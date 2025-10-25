import db from '../models/index.js';
import { 
  logger, 
  AppError,
  redisClient
} from '@ev-coownership/shared';
import TemplateRenderer from '../utils/templateRenderer.js';
import ContractNumberGenerator from '../utils/contractNumberGenerator.js';

export class TemplateService {
  async createTemplate(templateData) {
    try {
      const {
        templateName,
        templateType,
        content,
        variables = [],
        createdBy
      } = templateData;

      const template = await db.ContractTemplate.create({
        template_name: templateName,
        template_type: templateType,
        content,
        variables,
        created_by: createdBy
      });

      // Clear templates cache
      await this.clearTemplatesCache(templateType);

      logger.info('Contract template created successfully', { 
        templateId: template.id,
        templateType,
        templateName 
      });

      return template;
    } catch (error) {
      logger.error('Failed to create contract template', { error: error.message, templateName });
      throw error;
    }
  }

  async getTemplates(filters = {}) {
    try {
      const { type, isActive = true, page = 1, limit = 20 } = filters;
      
      const cacheKey = `templates:${type}:${isActive}:${page}:${limit}`;
      const cachedTemplates = await redisClient.get(cacheKey);
      
      if (cachedTemplates) {
        return JSON.parse(cachedTemplates);
      }

      const where = { is_active: isActive };
      if (type) where.template_type = type;

      const offset = (page - 1) * limit;

      const { count, rows: templates } = await db.ContractTemplate.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      const result = {
        templates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };

      // Cache for 10 minutes
      await redisClient.set(cacheKey, JSON.stringify(result), 600);

      return result;
    } catch (error) {
      logger.error('Failed to get contract templates', { error: error.message });
      throw error;
    }
  }

  async getTemplateById(templateId) {
    try {
      const template = await db.ContractTemplate.findByPk(templateId);

      if (!template) {
        throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND');
      }

      return template;
    } catch (error) {
      logger.error('Failed to get template by ID', { error: error.message, templateId });
      throw error;
    }
  }

  async updateTemplate(templateId, updateData) {
    try {
      const template = await db.ContractTemplate.findByPk(templateId);

      if (!template) {
        throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND');
      }

      const allowedUpdates = ['template_name', 'content', 'variables', 'is_active', 'version'];
      const updatePayload = {};
      
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          updatePayload[field] = updateData[field];
        }
      });

      await template.update(updatePayload);

      // Clear templates cache
      await this.clearTemplatesCache(template.template_type);

      logger.info('Contract template updated successfully', { templateId });

      return template;
    } catch (error) {
      logger.error('Failed to update contract template', { error: error.message, templateId });
      throw error;
    }
  }

  async generateContractFromTemplate(templateId, variables, createdBy) {
    try {
      const template = await this.getTemplateById(templateId);

      if (!template.is_active) {
        throw new AppError('Template is not active', 400, 'TEMPLATE_INACTIVE');
      }

      // Validate required variables
      this.validateTemplateVariables(template, variables);

      // Render template content
      const renderedContent = TemplateRenderer.renderContractTemplate(template.content, variables);

      // Create contract from template
      const contractData = {
        groupId: variables.groupId,
        contractType: template.template_type,
        title: variables.title || template.template_name,
        content: renderedContent,
        parties: variables.parties || [],
        effectiveDate: variables.effectiveDate,
        expiryDate: variables.expiryDate,
        createdBy
      };

      // Import contract service to create the contract
      const contractService = (await import('./contractService.js')).default;
      const contract = await contractService.createContract(contractData);

      logger.info('Contract generated from template successfully', { 
        templateId,
        contractId: contract.id,
        contractType: template.template_type 
      });

      return contract;
    } catch (error) {
      logger.error('Failed to generate contract from template', { error: error.message, templateId });
      throw error;
    }
  }

  validateTemplateVariables(template, variables) {
    const requiredVariables = template.variables || [];
    
    for (const variable of requiredVariables) {
      if (variables[variable] === undefined) {
        throw new AppError(`Missing required variable: ${variable}`, 400, 'MISSING_TEMPLATE_VARIABLE');
      }
    }
  }

  async clearTemplatesCache(templateType = null) {
    const patterns = ['templates:*'];
    if (templateType) {
      patterns.push(`templates:${templateType}:*`);
    }

    for (const pattern of patterns) {
      const keys = await redisClient.keys(pattern);
      for (const key of keys) {
        await redisClient.del(key);
      }
    }
  }
}

export default new TemplateService();