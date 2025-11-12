import db from '../models/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  logger, 
  AppError,
  redisClient
} from '@ev-coownership/shared';
import TemplateRenderer from '../utils/templateRenderer.js';
import ContractNumberGenerator from '../utils/contractNumberGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateService {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.init();
  }

  async init() {
    try {
      // Ensure templates directory exists
      await fs.mkdir(this.templatesDir, { recursive: true });
      logger.info('Template service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize template service', { error: error.message });
    }
  }

  async createTemplate(templateData) {
    try {
      const {
        templateName,
        templateType,
        content,
        variables = [],
        createdBy
      } = templateData;

      // Check if template file exists for file-based templates
      if (content.startsWith('file:')) {
        const fileName = content.replace('file:', '');
        const filePath = path.join(this.templatesDir, fileName);
        
        try {
          await fs.access(filePath);
        } catch (error) {
          throw new AppError(`Template file not found: ${fileName}`, 404, 'TEMPLATE_FILE_NOT_FOUND');
        }
      }

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
      const { type, isActive = true, page = 1, limit = 20, includeFileTemplates = false } = filters;
      
      const cacheKey = `templates:${type}:${isActive}:${page}:${limit}:${includeFileTemplates}`;
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

      let result = {
        templates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };

      // Include file-based templates if requested
      if (includeFileTemplates) {
        const fileTemplates = await this.getFileTemplates();
        result.fileTemplates = fileTemplates;
        result.total += fileTemplates.length;
      }

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

      // Validate template file if content references a file
      if (updatePayload.content && updatePayload.content.startsWith('file:')) {
        const fileName = updatePayload.content.replace('file:', '');
        const filePath = path.join(this.templatesDir, fileName);
        
        try {
          await fs.access(filePath);
        } catch (error) {
          throw new AppError(`Template file not found: ${fileName}`, 404, 'TEMPLATE_FILE_NOT_FOUND');
        }
      }

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

      // Load template content (from file or database)
      let templateContent = template.content;
      
      if (template.content.startsWith('file:')) {
        const fileName = template.content.replace('file:', '');
        templateContent = await this.loadTemplateFile(fileName);
      }

      // Render template content
      const renderedContent = TemplateRenderer.renderContractTemplate(templateContent, variables);

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

  async generateContractFromFile(templateFile, variables, createdBy) {
    try {
      // Load template content from file
      const templateContent = await this.loadTemplateFile(templateFile);

      // Determine template type from filename
      const templateType = this.getTemplateTypeFromFile(templateFile);

      // Render template content
      const renderedContent = TemplateRenderer.renderContractTemplate(templateContent, variables);

      // Create contract from template
      const contractData = {
        groupId: variables.groupId,
        contractType: templateType,
        title: variables.title || this.getTemplateNameFromFile(templateFile),
        content: renderedContent,
        parties: variables.parties || [],
        effectiveDate: variables.effectiveDate,
        expiryDate: variables.expiryDate,
        createdBy
      };

      const contractService = (await import('./contractService.js')).default;
      const contract = await contractService.createContract(contractData);

      logger.info('Contract generated from file template successfully', { 
        templateFile,
        contractId: contract.id,
        templateType 
      });

      return contract;
    } catch (error) {
      logger.error('Failed to generate contract from file template', { error: error.message, templateFile });
      throw error;
    }
  }

  async loadTemplateFile(fileName) {
    try {
      const filePath = path.join(this.templatesDir, fileName);
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      logger.error('Failed to load template file', { fileName, error: error.message });
      throw new AppError(`Template file not found: ${fileName}`, 404, 'TEMPLATE_FILE_NOT_FOUND');
    }
  }

  async getFileTemplates() {
    try {
      const files = await fs.readdir(this.templatesDir);
      
      const templateFiles = files.filter(file => 
        file.endsWith('.html') || file.endsWith('.hbs')
      );

      return templateFiles.map(file => ({
        id: `file_${file}`,
        template_name: this.getTemplateNameFromFile(file),
        template_type: this.getTemplateTypeFromFile(file),
        content: `file:${file}`,
        is_active: true,
        is_file_template: true,
        file_path: file
      }));
    } catch (error) {
      logger.error('Failed to get file templates', { error: error.message });
      return [];
    }
  }

  getTemplateTypeFromFile(fileName) {
    if (fileName.includes('co-ownership')) return 'co_ownership';
    if (fileName.includes('amendment')) return 'amendment';
    if (fileName.includes('termination')) return 'termination';
    return 'general';
  }

  getTemplateNameFromFile(fileName) {
    const name = fileName.replace('.html', '').replace('.hbs', '');
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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

  // Initialize default templates in database
  async initializeDefaultTemplates() {
    try {
      const fileTemplates = await this.getFileTemplates();
      
      for (const fileTemplate of fileTemplates) {
        const existingTemplate = await db.ContractTemplate.findOne({
          where: {
            template_name: fileTemplate.template_name,
            template_type: fileTemplate.template_type
          }
        });

        if (!existingTemplate) {
          await this.createTemplate({
            templateName: fileTemplate.template_name,
            templateType: fileTemplate.template_type,
            content: fileTemplate.content,
            variables: this.getDefaultVariablesForTemplate(fileTemplate.template_type),
            createdBy: '00000000-0000-0000-0000-000000000000' // System user
          });
          
          logger.info('Default template created', { 
            templateName: fileTemplate.template_name,
            templateType: fileTemplate.template_type 
          });
        }
      }
    } catch (error) {
      logger.error('Failed to initialize default templates', { error: error.message });
    }
  }

  getDefaultVariablesForTemplate(templateType) {
    const baseVariables = ['contract_number', 'effective_date', 'expiry_date', 'parties'];
    
    switch (templateType) {
      case 'co_ownership':
        return [...baseVariables, 'vehicle_license_plate', 'vehicle_model', 'vehicle_year', 'vehicle_vin'];
      case 'amendment':
        return [...baseVariables, 'original_contract_number', 'amendment_reason', 'changes_summary'];
      case 'termination':
        return [...baseVariables, 'termination_reason', 'termination_date'];
      default:
        return baseVariables;
    }
  }
}

export default new TemplateService();