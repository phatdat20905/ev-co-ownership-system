// src/services/templateService.js
import db from '../models/index.js';
import { AppError, logger } from '@ev-coownership/shared';
import { validateTemplate } from '../utils/notificationValidator.js';
import TemplateParser from '../utils/templateParser.js';

class TemplateService {
  async createTemplate(templateData) {
    const validatedData = validateTemplate(templateData);

    // Check if template name already exists
    const existingTemplate = await db.NotificationTemplate.findOne({
      where: { name: validatedData.name },
    });

    if (existingTemplate) {
      throw new AppError('Template name already exists', 409, 'TEMPLATE_EXISTS');
    }

    // Validate template variables
    if (validatedData.variables) {
      try {
        TemplateParser.validateVariables(validatedData.body, {});
        if (validatedData.subject) {
          TemplateParser.validateVariables(validatedData.subject, {});
        }
      } catch (error) {
        throw new AppError(`Template validation failed: ${error.message}`, 400, 'TEMPLATE_VALIDATION_ERROR');
      }
    }

    const template = await db.NotificationTemplate.create(validatedData);

    logger.info('Notification template created', {
      templateId: template.id,
      name: template.name,
    });

    return template;
  }

  async getTemplates(filters = {}) {
    const {
      page = 1,
      limit = 20,
      isActive,
      type,
    } = filters;

    const where = {};
    
    if (isActive !== undefined) where.isActive = isActive;
    if (type) where.type = type;

    const templates = await db.NotificationTemplate.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    return {
      templates: templates.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: templates.count,
        totalPages: Math.ceil(templates.count / parseInt(limit)),
      },
    };
  }

  async getTemplateById(templateId) {
    const template = await db.NotificationTemplate.findByPk(templateId);

    if (!template) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND');
    }

    return template;
  }

  async updateTemplate(templateId, updateData) {
    const template = await this.getTemplateById(templateId);

    const validatedData = validateTemplate(updateData);

    // Check if new name conflicts with other templates
    if (validatedData.name && validatedData.name !== template.name) {
      const existingTemplate = await db.NotificationTemplate.findOne({
        where: { name: validatedData.name },
      });

      if (existingTemplate) {
        throw new AppError('Template name already exists', 409, 'TEMPLATE_EXISTS');
      }
    }

    // Validate template variables if body is updated
    if (validatedData.body) {
      try {
        TemplateParser.validateVariables(validatedData.body, {});
        if (validatedData.subject) {
          TemplateParser.validateVariables(validatedData.subject, {});
        }
      } catch (error) {
        throw new AppError(`Template validation failed: ${error.message}`, 400, 'TEMPLATE_VALIDATION_ERROR');
      }
    }

    await template.update(validatedData);

    logger.info('Notification template updated', {
      templateId: template.id,
      name: template.name,
    });

    return template;
  }

  async disableTemplate(templateId) {
    const template = await this.getTemplateById(templateId);

    await template.update({ isActive: false });

    logger.info('Notification template disabled', {
      templateId: template.id,
      name: template.name,
    });

    return template;
  }

  async enableTemplate(templateId) {
    const template = await this.getTemplateById(templateId);

    await template.update({ isActive: true });

    logger.info('Notification template enabled', {
      templateId: template.id,
      name: template.name,
    });

    return template;
  }

  async deleteTemplate(templateId) {
    const template = await this.getTemplateById(templateId);

    await template.destroy();

    logger.info('Notification template deleted', {
      templateId: template.id,
      name: template.name,
    });

    return { success: true };
  }

  async previewTemplate(templateId, variables = {}) {
    const template = await this.getTemplateById(templateId);

    try {
      const parsedBody = TemplateParser.parse(template.body, variables);
      const parsedSubject = template.subject ? 
        TemplateParser.parse(template.subject, variables) : undefined;

      return {
        subject: parsedSubject,
        body: parsedBody,
        channels: template.channels,
        variables: template.variables,
      };
    } catch (error) {
      throw new AppError(`Template preview failed: ${error.message}`, 400, 'TEMPLATE_PREVIEW_ERROR');
    }
  }
}

export default new TemplateService();