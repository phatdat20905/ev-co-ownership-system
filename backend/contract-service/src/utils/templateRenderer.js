import { logger, AppError } from '@ev-coownership/shared';

export class TemplateRenderer {
  static renderContractTemplate(templateContent, variables) {
    try {
      let renderedContent = templateContent;

      // Replace simple variables
      Object.keys(variables).forEach(key => {
        const placeholder = `{{${key}}}`;
        const value = this.safeStringify(variables[key]);
        renderedContent = renderedContent.replace(new RegExp(placeholder, 'g'), value);
      });

      // Handle array variables (parties)
      if (variables.parties && renderedContent.includes('{{#each parties}}')) {
        renderedContent = this.renderPartiesSection(renderedContent, variables.parties);
      }

      logger.debug('Contract template rendered successfully', { 
        variables: Object.keys(variables) 
      });

      return renderedContent;
    } catch (error) {
      logger.error('Template rendering failed', { error: error.message, variables });
      throw new AppError('Failed to render contract template', 500, 'TEMPLATE_RENDER_ERROR');
    }
  }

  static renderPartiesSection(templateContent, parties) {
    const eachRegex = /{{#each parties}}([\s\S]*?){{\/each}}/;
    const match = templateContent.match(eachRegex);
    
    if (!match) return templateContent;

    const [fullMatch, innerTemplate] = match;
    let partiesHtml = '';

    parties.forEach(party => {
      let partyHtml = innerTemplate;
      Object.keys(party).forEach(key => {
        const placeholder = `{{${key}}}`;
        partyHtml = partyHtml.replace(new RegExp(placeholder, 'g'), this.safeStringify(party[key]));
      });
      partiesHtml += partyHtml;
    });

    return templateContent.replace(fullMatch, partiesHtml);
  }

  static safeStringify(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}

export default TemplateRenderer;