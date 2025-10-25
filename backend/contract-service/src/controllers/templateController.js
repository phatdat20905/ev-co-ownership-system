import templateService from '../services/templateService.js';
import { 
  successResponse, 
  logger
} from '@ev-coownership/shared';

export class TemplateController {
  async createTemplate(req, res, next) {
    try {
      const templateData = {
        ...req.body,
        createdBy: req.user.id
      };

      const template = await templateService.createTemplate(templateData);

      logger.info('Contract template created', { 
        templateId: template.id,
        userId: req.user.id,
        templateType: template.template_type 
      });

      return successResponse(res, 'Contract template created successfully', template, 201);
    } catch (error) {
      logger.error('Failed to create contract template', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getTemplates(req, res, next) {
    try {
      const filters = {
        type: req.query.type,
        isActive: req.query.isActive !== 'false',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await templateService.getTemplates(filters);

      return successResponse(res, 'Contract templates retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get contract templates', { error: error.message });
      next(error);
    }
  }

  async getTemplate(req, res, next) {
    try {
      const { templateId } = req.params;

      const template = await templateService.getTemplateById(templateId);

      return successResponse(res, 'Contract template retrieved successfully', template);
    } catch (error) {
      logger.error('Failed to get contract template', { 
        error: error.message, 
        templateId: req.params.templateId 
      });
      next(error);
    }
  }

  async updateTemplate(req, res, next) {
    try {
      const { templateId } = req.params;

      const template = await templateService.updateTemplate(templateId, req.body);

      return successResponse(res, 'Contract template updated successfully', template);
    } catch (error) {
      logger.error('Failed to update contract template', { 
        error: error.message, 
        templateId: req.params.templateId 
      });
      next(error);
    }
  }

  async generateContract(req, res, next) {
    try {
      const { templateId } = req.params;
      const { variables } = req.body;
      const createdBy = req.user.id;

      const contract = await templateService.generateContractFromTemplate(templateId, variables, createdBy);

      logger.info('Contract generated from template', { 
        templateId,
        contractId: contract.id,
        userId: req.user.id 
      });

      return successResponse(res, 'Contract generated from template successfully', contract, 201);
    } catch (error) {
      logger.error('Failed to generate contract from template', { 
        error: error.message, 
        templateId: req.params.templateId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async deleteTemplate(req, res, next) {
    try {
      const { templateId } = req.params;

      // Soft delete by setting is_active to false
      await templateService.updateTemplate(templateId, { is_active: false });

      logger.info('Contract template deleted', { templateId });

      return successResponse(res, 'Contract template deleted successfully');
    } catch (error) {
      logger.error('Failed to delete contract template', { 
        error: error.message, 
        templateId: req.params.templateId 
      });
      next(error);
    }
  }
}

export default new TemplateController();