import db from '../models/index.js';
import { 
  successResponse, 
  logger,
  AppError
} from '@ev-coownership/shared';

export class PartyController {
  async addParty(req, res, next) {
    try {
      const { contractId } = req.params;
      const partyData = req.body;

      const contract = await db.Contract.findByPk(contractId);
      
      if (!contract) {
        throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
      }

      if (contract.status !== 'draft') {
        throw new AppError('Parties can only be added to draft contracts', 400, 'CONTRACT_NOT_EDITABLE');
      }

      // Check if party already exists
      const existingParty = await db.ContractParty.findOne({
        where: {
          contract_id: contractId,
          user_id: partyData.userId
        }
      });

      if (existingParty) {
        throw new AppError('Party already exists in this contract', 400, 'PARTY_ALREADY_EXISTS');
      }

      const party = await db.ContractParty.create({
        contract_id: contractId,
        ...partyData
      });

      logger.info('Party added to contract', { 
        contractId,
        partyId: party.id,
        userId: partyData.userId 
      });

      return successResponse(res, 'Party added successfully', party, 201);
    } catch (error) {
      logger.error('Failed to add party to contract', { 
        error: error.message, 
        contractId: req.params.contractId 
      });
      next(error);
    }
  }

  async getParties(req, res, next) {
    try {
      const { contractId } = req.params;

      const parties = await db.ContractParty.findAll({
        where: { contract_id: contractId },
        order: [['signing_order', 'ASC']]
      });

      return successResponse(res, 'Parties retrieved successfully', parties);
    } catch (error) {
      logger.error('Failed to get contract parties', { 
        error: error.message, 
        contractId: req.params.contractId 
      });
      next(error);
    }
  }

  async updateParty(req, res, next) {
    try {
      const { contractId, partyId } = req.params;

      const party = await db.ContractParty.findOne({
        where: {
          id: partyId,
          contract_id: contractId
        }
      });

      if (!party) {
        throw new AppError('Party not found', 404, 'PARTY_NOT_FOUND');
      }

      const contract = await db.Contract.findByPk(contractId);
      if (contract.status !== 'draft') {
        throw new AppError('Parties can only be updated in draft contracts', 400, 'CONTRACT_NOT_EDITABLE');
      }

      await party.update(req.body);

      logger.info('Party updated', { 
        contractId,
        partyId 
      });

      return successResponse(res, 'Party updated successfully', party);
    } catch (error) {
      logger.error('Failed to update party', { 
        error: error.message, 
        partyId: req.params.partyId 
      });
      next(error);
    }
  }

  async removeParty(req, res, next) {
    try {
      const { contractId, partyId } = req.params;

      const party = await db.ContractParty.findOne({
        where: {
          id: partyId,
          contract_id: contractId
        }
      });

      if (!party) {
        throw new AppError('Party not found', 404, 'PARTY_NOT_FOUND');
      }

      const contract = await db.Contract.findByPk(contractId);
      if (contract.status !== 'draft') {
        throw new AppError('Parties can only be removed from draft contracts', 400, 'CONTRACT_NOT_EDITABLE');
      }

      await party.destroy();

      logger.info('Party removed from contract', { 
        contractId,
        partyId 
      });

      return successResponse(res, 'Party removed successfully');
    } catch (error) {
      logger.error('Failed to remove party', { 
        error: error.message, 
        partyId: req.params.partyId 
      });
      next(error);
    }
  }
}

export default new PartyController();