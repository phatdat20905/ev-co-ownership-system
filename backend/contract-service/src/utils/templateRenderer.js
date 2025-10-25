import Handlebars from 'handlebars';
import { logger, AppError } from '@ev-coownership/shared';

// Register Handlebars helpers
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

Handlebars.registerHelper('neq', function (a, b) {
  return a !== b;
});

Handlebars.registerHelper('formatDate', function (date) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('vi-VN');
  } catch (error) {
    return date;
  }
});

Handlebars.registerHelper('formatDateTime', function (date) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleString('vi-VN');
  } catch (error) {
    return date;
  }
});

Handlebars.registerHelper('ifSigned', function (hasSigned, options) {
  return hasSigned ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('percentage', function (value) {
  if (value === undefined || value === null) return '0%';
  return `${parseFloat(value).toFixed(2)}%`;
});

Handlebars.registerHelper('upperCase', function (str) {
  return str ? str.toUpperCase() : '';
});

Handlebars.registerHelper('lowerCase', function (str) {
  return str ? str.toLowerCase() : '';
});

Handlebars.registerHelper('currency', function (amount) {
  if (amount === undefined || amount === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
});

export class TemplateRenderer {
  static renderContractTemplate(templateContent, variables) {
    try {
      // Compile template with Handlebars
      const template = Handlebars.compile(templateContent);
      
      // Prepare variables for template
      const templateVariables = this.prepareTemplateVariables(variables);
      
      // Render template
      const renderedContent = template(templateVariables);

      logger.debug('Contract template rendered successfully', { 
        variables: Object.keys(variables),
        templateLength: renderedContent.length
      });

      return renderedContent;
    } catch (error) {
      logger.error('Template rendering failed', { 
        error: error.message, 
        templateContent: templateContent.substring(0, 100) + '...',
        variables: Object.keys(variables) 
      });
      throw new AppError('Failed to render contract template: ' + error.message, 500, 'TEMPLATE_RENDER_ERROR');
    }
  }

  static prepareTemplateVariables(variables) {
    const prepared = { ...variables };
    
    // Format dates
    if (prepared.effectiveDate) {
      prepared.effective_date = new Date(prepared.effectiveDate).toLocaleDateString('vi-VN');
    }
    
    if (prepared.expiryDate) {
      prepared.expiry_date = new Date(prepared.expiryDate).toLocaleDateString('vi-VN');
    }

    if (prepared.generated_at) {
      prepared.generated_at = new Date(prepared.generated_at).toLocaleString('vi-VN');
    } else {
      prepared.generated_at = new Date().toLocaleString('vi-VN');
    }
    
    // Prepare parties data for Handlebars
    if (prepared.parties && Array.isArray(prepared.parties)) {
      prepared.parties = prepared.parties.map((party, index) => ({
        ...party,
        index: index + 1,
        role: this.translateRole(party.role || party.party_role),
        ownership_percentage: party.ownershipPercentage || party.ownership_percentage || 0,
        full_name: party.fullName || party.full_name || `User ${party.userId}`,
        has_signed: party.hasSigned || party.has_signed || false,
        signed_at: party.signedAt || party.signed_at ? 
          new Date(party.signedAt || party.signed_at).toLocaleDateString('vi-VN') : null
      }));
    }

    // Prepare changes for amendment template
    if (prepared.changes && Array.isArray(prepared.changes)) {
      prepared.changes = prepared.changes.map((change, index) => ({
        ...change,
        index: index + 1
      }));
    }

    return prepared;
  }

  static translateRole(role) {
    const translations = {
      'owner': 'Chủ sở hữu',
      'co_owner': 'Đồng sở hữu',
      'witness': 'Nhân chứng',
      'legal_representative': 'Đại diện pháp lý',
      'admin': 'Quản trị viên',
      'member': 'Thành viên'
    };
    return translations[role] || role;
  }

  // Validate template variables before rendering
  static validateTemplateVariables(templateContent, variables) {
    const requiredVariables = this.extractVariablesFromTemplate(templateContent);
    const missingVariables = requiredVariables.filter(variable => 
      !variables.hasOwnProperty(variable) && !this.isOptionalVariable(variable)
    );

    if (missingVariables.length > 0) {
      throw new AppError(
        `Missing required template variables: ${missingVariables.join(', ')}`,
        400,
        'MISSING_TEMPLATE_VARIABLES'
      );
    }
  }

  static extractVariablesFromTemplate(templateContent) {
    const variableRegex = /{{{\s*([^{}]+)\s*}}}|{{\s*([^{}]+)\s*}}/g;
    const variables = new Set();
    let match;

    while ((match = variableRegex.exec(templateContent)) !== null) {
      const variable = match[1] || match[2];
      // Skip helpers and block statements
      if (!variable.includes('#') && !variable.includes('/') && !this.isHandlebarsHelper(variable)) {
        const cleanVariable = variable.trim();
        if (cleanVariable && !cleanVariable.startsWith('>')) {
          variables.add(cleanVariable);
        }
      }
    }

    return Array.from(variables);
  }

  static isHandlebarsHelper(variable) {
    const helpers = ['eq', 'neq', 'formatDate', 'formatDateTime', 'ifSigned', 'percentage', 'upperCase', 'lowerCase', 'currency'];
    return helpers.some(helper => variable.includes(helper));
  }

  static isOptionalVariable(variable) {
    return variable.includes('?') || variable.includes('optional');
  }
}

export default TemplateRenderer;