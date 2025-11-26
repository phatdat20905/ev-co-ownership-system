import { GoogleGenAI } from "@google/genai";
import { logger } from '@ev-coownership/shared';

class GeminiConfig {
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.maxRetries = parseInt(process.env.GEMINI_MAX_RETRIES) || 3;
    this.timeout = parseInt(process.env.GEMINI_TIMEOUT) || 30000;
  }

  getModel() {
    return this.ai.models;
  }

  // Internal helper: sleep for ms
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Robust request method: try SDK then fallback to REST with timeout and retries
  async requestGenerateContent({ model, contents, generationConfig = {} }) {
    const maxRetries = this.maxRetries;
    const timeout = this.timeout;
    const restUrlBase = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models';

    // Quick validation: ensure some form of auth is present otherwise REST will fail
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    const hasBearer = !!process.env.GEMINI_BEARER_TOKEN;
    if (!hasApiKey && !hasBearer) {
      const msg = 'No GEMINI_API_KEY or GEMINI_BEARER_TOKEN configured in environment';
      // Log and throw early to avoid noisy retries
      try { logger && logger.error && logger.error('Gemini configuration error', { message: msg }); } catch (e) {}
      throw new Error(msg);
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Try SDK first (if available)
        if (this.ai && this.ai.models && typeof this.ai.models.generateContent === 'function') {
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const sdkPromise = this.ai.models.generateContent({
            model,
            contents,
            generationConfig
          });

          const result = await Promise.race([
            sdkPromise,
            new Promise((_, rej) => setTimeout(() => rej(new Error('Gemini SDK request timeout')), timeout))
          ]);

          return result;
        }
      } catch (err) {
        // fallthrough to REST fallback
        logger.warn('Gemini SDK request failed, will try REST fallback', { attempt, error: err && err.message, stack: err && err.stack });
      }

      // REST fallback
      try {
        let url = `${restUrlBase}/${encodeURIComponent(model)}:generateContent`;
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const signal = controller ? controller.signal : undefined;

        // Use correct Gemini API format (not messages, but contents)
        const body = {
          contents: Array.isArray(contents) ? contents : [
            {
              role: 'user',
              parts: [
                { text: typeof contents === 'string' ? contents : JSON.stringify(contents) }
              ]
            }
          ],
          generationConfig
        };

        const headers = {
          'Content-Type': 'application/json'
        };

        // Use query parameter for API key authentication
        if (process.env.GEMINI_API_KEY) {
          url += `?key=${process.env.GEMINI_API_KEY}`;
        } else if (process.env.GEMINI_BEARER_TOKEN) {
          headers['Authorization'] = `Bearer ${process.env.GEMINI_BEARER_TOKEN}`;
        }

        let res;
        try {
          const fetchPromise = fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal
          });

          res = await Promise.race([
            fetchPromise,
            new Promise((_, rej) => setTimeout(() => rej(new Error('Gemini REST request timeout')), timeout))
          ]);

          if (!res || !res.ok) {
            const text = res ? await res.text().catch(() => '') : '';
            throw new Error(`Gemini REST error: ${res ? res.status : 'no-response'} ${text}`);
          }
        } catch (fetchErr) {
          // Network-level errors (DNS, ECONNREFUSED, TLS) often surface as TypeError or FetchError
          logger.error('Gemini REST fetch failed', { attempt, name: fetchErr && fetchErr.name, message: fetchErr && fetchErr.message, stack: fetchErr && fetchErr.stack });
          // If this is final attempt, rethrow to caller
          if (attempt === maxRetries) throw fetchErr;
          // Otherwise, backoff and retry
          await this.sleep(1000 * Math.pow(2, attempt));
          continue;
        }

        const data = await res.json();
        // Try to normalize response shape to match SDK: data.candidates or data.output
        if (data && data.candidates && data.candidates.length) {
          return { text: data.candidates[0].content && data.candidates[0].content.reduce((acc, c) => acc + (c.text || ''), '') };
        }

        if (data && data.output && data.output[0] && data.output[0].content) {
          const text = data.output[0].content.map(c => c.text || '').join('');
          return { text };
        }

        // Fallback: stringify entire response
        return { text: typeof data === 'string' ? data : JSON.stringify(data) };

      } catch (err) {
        logger.error('Gemini REST attempt failed', { attempt, error: err && err.message });
        if (attempt === maxRetries) throw err;
        // backoff
        await this.sleep(1000 * Math.pow(2, attempt));
      }
    }
  }

  getGenerationConfig() {
    return {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };
  }

  async healthCheck() {
    try {
      // Simple health check using requestGenerateContent (SDK+REST fallback)
      const response = await this.requestGenerateContent({
        model: this.modelName,
        contents: "Say 'OK' if you're working",
        generationConfig: this.getGenerationConfig()
      });

      return {
        healthy: true,
        model: this.modelName,
        response: response && response.text
      };
    } catch (error) {
      logger.error('Gemini API health check failed', { error: error.message });
      return { 
        healthy: false, 
        model: this.modelName,
        error: error.message 
      };
    }
  }
}

export default new GeminiConfig();