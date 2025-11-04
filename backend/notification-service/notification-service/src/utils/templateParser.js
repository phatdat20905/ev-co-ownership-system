// src/utils/templateParser.js
import { logger } from '@ev-coownership/shared';

class TemplateParser {
  static parse(template, variables) {
    try {
      let parsedContent = template;

      // Replace variables in format {{variable_name}}
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        parsedContent = parsedContent.replace(regex, value || '');
      }

      return parsedContent;
    } catch (error) {
      logger.error('Template parsing failed', { error: error.message, template, variables });
      throw new Error(`Template parsing failed: ${error.message}`);
    }
  }

  static validateVariables(template, providedVariables) {
    const requiredVariables = this.extractVariables(template);
    const missingVariables = requiredVariables.filter(
      variable => !providedVariables.hasOwnProperty(variable)
    );

    if (missingVariables.length > 0) {
      throw new Error(`Missing required variables: ${missingVariables.join(', ')}`);
    }

    return true;
  }

  static extractVariables(template) {
    const variableRegex = /{{(\w+)}}/g;
    const variables = [];
    let match;

    while ((match = variableRegex.exec(template)) !== null) {
      variables.push(match[1]);
    }

    return [...new Set(variables)]; // Remove duplicates
  }
}

export default TemplateParser;