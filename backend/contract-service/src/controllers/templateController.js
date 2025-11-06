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
        limit: parseInt(req.query.limit) || 20,
        includeFileTemplates: req.query.includeFileTemplates === 'true'
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

      // Check if it's a file template request
      if (templateId.startsWith('file_')) {
        const fileName = templateId.replace('file_', '');
        const fileTemplates = await templateService.getFileTemplates();
        const fileTemplate = fileTemplates.find(t => t.file_path === fileName);
        
        if (!fileTemplate) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'TEMPLATE_NOT_FOUND',
              message: 'File template not found'
            }
          });
        }

        return successResponse(res, 'File template retrieved successfully', fileTemplate);
      }

      // Database template
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

      // File templates cannot be updated via API
      if (templateId.startsWith('file_')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TEMPLATE_READONLY',
            message: 'File templates are read-only. Modify the template file directly.'
          }
        });
      }

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

      let contract;

      // Check if it's a file template
      if (templateId.startsWith('file_')) {
        const fileName = templateId.replace('file_', '');
        contract = await templateService.generateContractFromFile(fileName, variables, createdBy);
      } else {
        // Database template
        contract = await templateService.generateContractFromTemplate(templateId, variables, createdBy);
      }

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

      // File templates cannot be deleted via API
      if (templateId.startsWith('file_')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TEMPLATE_READONLY',
            message: 'File templates cannot be deleted via API.'
          }
        });
      }

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

  async getAvailableFiles(req, res, next) {
    try {
      const fileTemplates = await templateService.getFileTemplates();

      return successResponse(res, 'Available template files retrieved successfully', fileTemplates);
    } catch (error) {
      logger.error('Failed to get available template files', { error: error.message });
      next(error);
    }
  }
}

export default new TemplateController();