import { GoogleGenAI } from "@google/genai";
import geminiConfig from '../config/gemini.js';
import { logger } from '@ev-coownership/shared';
import ResponseParser from './responseParser.js';

export class GeminiCoreService {
  constructor() {
    this.config = geminiConfig;
    this.ai = geminiConfig.getModel();
  }

  async generateAIResponse(promptTemplate, context = {}, featureType) {
    const startTime = Date.now();
    const maxRetries = this.config.maxRetries;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const fullPrompt = this.buildFullPrompt(promptTemplate, context);
        
        const response = await this.ai.generateContent({
          model: this.config.modelName,
          contents: fullPrompt,
          generationConfig: this.config.getGenerationConfig()
        });

        const responseTime = Date.now() - startTime;
        
        const parsedResponse = ResponseParser.parseGeminiResponse(
          response.text, 
          featureType
        );

        const confidenceScore = ResponseParser.calculateConfidenceScore(
          parsedResponse, 
          featureType
        );

        logger.info('Gemini API call successful', {
          featureType,
          attempt: attempt + 1,
          responseTime: `${responseTime}ms`,
          confidenceScore,
          tokenEstimate: Math.ceil(fullPrompt.length / 4) // Rough token estimate
        });

        return {
          ...parsedResponse,
          _metadata: {
            ...parsedResponse._metadata,
            response_time: responseTime,
            attempt: attempt + 1,
            model: this.config.modelName
          }
        };

      } catch (error) {
        logger.error(`Gemini API attempt ${attempt + 1} failed`, {
          featureType,
          error: error.message,
          attempt: attempt + 1
        });

        if (attempt === maxRetries) {
          throw new Error(`Gemini API failed after ${maxRetries + 1} attempts: ${error.message}`);
        }

        // Exponential backoff
        await this.delay(1000 * Math.pow(2, attempt));
      }
    }
  }

  buildFullPrompt(promptTemplate, context) {
    if (typeof promptTemplate === 'string') {
      return promptTemplate;
    }

    if (promptTemplate.system && promptTemplate.user) {
      return `${promptTemplate.system}\n\n${promptTemplate.user}`;
    }

    // Handle template with context variables
    let processedPrompt = promptTemplate.user || promptTemplate;
    Object.keys(context).forEach(key => {
      const value = typeof context[key] === 'object' 
        ? JSON.stringify(context[key], null, 2) 
        : context[key];
      processedPrompt = processedPrompt.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    });

    return processedPrompt;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async healthCheck() {
    return await this.config.healthCheck();
  }

  // Batch processing for multiple requests (future enhancement)
  async generateBatchResponses(requests) {
    const results = [];
    
    for (const request of requests) {
      try {
        const result = await this.generateAIResponse(
          request.prompt, 
          request.context, 
          request.featureType
        );
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message,
          featureType: request.featureType 
        });
      }
    }
    
    return results;
  }
}

export default new GeminiCoreService();