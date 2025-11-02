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
      // Simple health check by making a minimal request
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: "Say 'OK' if you're working",
      });
      
      return { 
        healthy: true, 
        model: this.modelName,
        response: response.text 
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