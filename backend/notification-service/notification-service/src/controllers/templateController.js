// src/controllers/templateController.js
import templateService from '../services/templateService.js';
import { successResponse, logger } from '@ev-coownership/shared';

class TemplateController {
  async createTemplate(req, res, next) {
    try {
      const template = await templateService.createTemplate(req.body);

      return successResponse(res, 'Template created successfully', template, 201);
    } catch (error) {
      logger.error('Failed to create template', {
        error: error.message,
        templateName: req.body?.name,
      });
      next(error);
    }
  }

  async getTemplates(req, res, next) {
    try {
      const { page, limit, isActive, type } = req.query;

      const result = await templateService.getTemplates({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        isActive: isActive === 'true',
        type,
      });

      return successResponse(res, 'Templates retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get templates', { error: error.message });
      next(error);
    }
  }

  async getTemplate(req, res, next) {
    try {
      const { id } = req.params;
      
      const template = await templateService.getTemplateById(id);

      return successResponse(res, 'Template retrieved successfully', template);
    } catch (error) {
      logger.error('Failed to get template', {
        error: error.message,
        templateId: req.params?.id,
      });
      next(error);
    }
  }

  async updateTemplate(req, res, next) {
    try {
      const { id } = req.params;
      
      const template = await templateService.updateTemplate(id, req.body);

      return successResponse(res, 'Template updated successfully', template);
    } catch (error) {
      logger.error('Failed to update template', {
        error: error.message,
        templateId: req.params?.id,
      });
      next(error);
    }
  }

  async disableTemplate(req, res, next) {
    try {
      const { id } = req.params;
      
      const template = await templateService.disableTemplate(id);

      return successResponse(res, 'Template disabled successfully', template);
    } catch (error) {
      logger.error('Failed to disable template', {
        error: error.message,
        templateId: req.params?.id,
      });
      next(error);
    }
  }

  async enableTemplate(req, res, next) {
    try {
      const { id } = req.params;
      
      const template = await templateService.enableTemplate(id);

      return successResponse(res, 'Template enabled successfully', template);
    } catch (error) {
      logger.error('Failed to enable template', {
        error: error.message,
        templateId: req.params?.id,
      });
      next(error);
    }
  }

  async deleteTemplate(req, res, next) {
    try {
      const { id } = req.params;
      
      const result = await templateService.deleteTemplate(id);

      return successResponse(res, 'Template deleted successfully', result);
    } catch (error) {
      logger.error('Failed to delete template', {
        error: error.message,
        templateId: req.params?.id,
      });
      next(error);
    }
  }

  async previewTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const { variables = {} } = req.body;
      
      const preview = await templateService.previewTemplate(id, variables);

      return successResponse(res, 'Template preview generated successfully', preview);
    } catch (error) {
      logger.error('Failed to preview template', {
        error: error.message,
        templateId: req.params?.id,
      });
      next(error);
    }
  }
}

export default new TemplateController();