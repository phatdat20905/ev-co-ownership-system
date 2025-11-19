import db from '../models/index.js';
import { 
  logger, 
  AppError,
  redisClient
} from '@ev-coownership/shared';
import eventService from './eventService.js';
import ContractNumberGenerator from '../utils/contractNumberGenerator.js';

export class ContractService {
  async createContract(contractData) {
    const transaction = await db.sequelize.transaction();

    try {
      const {
        groupId,
        contractType,
        title,
        content,
        parties,
        effectiveDate,
        expiryDate,
        autoRenew = false,
        parentContractId = null
      } = contractData;

      // Validate contract data
      await this.validateContractData(contractData);

      // Create contract
      const contract = await db.Contract.create({
        group_id: groupId,
        contract_type: contractType,
        contract_number: ContractNumberGenerator.generateContractNumber(),
        title,
        content,
        status: 'draft',
        effective_date: effectiveDate,
        expiry_date: expiryDate,
        auto_renew: autoRenew,
        parent_contract_id: parentContractId,
        created_by: contractData.createdBy
      }, { transaction });

      // Add parties to contract
      for (const partyData of parties) {
        await db.ContractParty.create({
          contract_id: contract.id,
          user_id: partyData.userId,
          party_role: partyData.role,
          ownership_percentage: partyData.ownershipPercentage,
          signing_order: partyData.signingOrder
        }, { transaction });
      }

      await transaction.commit();

      // Publish event
      await eventService.publishContractCreated({
        contractId: contract.id,
        groupId,
        contractType,
        title,
        createdBy: contractData.createdBy,
        parties: parties.map(p => p.userId)
      });

      logger.info('Contract created successfully', { 
        contractId: contract.id,
        groupId,
        contractType 
      });

      return await this.getContractById(contract.id);
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to create contract', { error: error.message, groupId: contractData.groupId });
      throw error;
    }
  }

  async getAllContracts(filters = {}) {
    try {
      const {
        status,
        contractType,
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = filters;

      const where = {};
      
      if (status) where.status = status;
      if (contractType) where.contract_type = contractType;

      const offset = (page - 1) * limit;

      // Get all contracts with parties
      const { count, rows: contracts } = await db.Contract.findAndCountAll({
        where,
        include: [
          {
            model: db.ContractParty,
            as: 'parties',
            attributes: ['user_id', 'party_role', 'has_signed', 'signing_order', 'ownership_percentage'],
            required: false // LEFT JOIN to include contracts even without parties
          }
        ],
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        distinct: true
      });

      const result = {
        contracts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };

      return result;
    } catch (error) {
      logger.error('Failed to get all contracts', { error: error.message });
      throw error;
    }
  }

  async getContractById(contractId, userId = null) {
    try {
      const cacheKey = `contract:${contractId}`;
      const cachedContract = await redisClient.get(cacheKey);
      
      if (cachedContract) {
        return JSON.parse(cachedContract);
      }

      const contract = await db.Contract.findByPk(contractId, {
        include: [
          {
            model: db.ContractParty,
            as: 'parties',
            attributes: ['id', 'user_id', 'party_role', 'ownership_percentage', 'signing_order', 'has_signed', 'signed_at']
          },
          {
            model: db.ContractDocument,
            as: 'documents',
            attributes: ['id', 'document_name', 'document_type', 'file_url', 'uploaded_at']
          }
        ]
      });

      if (!contract) {
        throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
      }

      // Validate access if userId provided
      if (userId && !await this.validateContractAccess(contract, userId)) {
        throw new AppError('Access denied to contract', 403, 'CONTRACT_ACCESS_DENIED');
      }

      // Cache for 5 minutes
      await redisClient.set(cacheKey, JSON.stringify(contract), 300);

      return contract;
    } catch (error) {
      logger.error('Failed to get contract', { error: error.message, contractId });
      throw error;
    }
  }

  async getContractsByGroup(groupId, filters = {}) {
    try {
      const {
        status,
        contractType,
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = filters;

      const cacheKey = `contracts:group:${groupId}:${JSON.stringify(filters)}`;
      const cachedContracts = await redisClient.get(cacheKey);
      
      if (cachedContracts) {
        return JSON.parse(cachedContracts);
      }

      const where = { group_id: groupId };
      
      if (status) where.status = status;
      if (contractType) where.contract_type = contractType;

      const offset = (page - 1) * limit;

      const { count, rows: contracts } = await db.Contract.findAndCountAll({
        where,
        include: [
          {
            model: db.ContractParty,
            as: 'parties',
            attributes: ['user_id', 'party_role', 'has_signed']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        distinct: true
      });

      const result = {
        contracts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };

      // Cache for 2 minutes
      await redisClient.set(cacheKey, JSON.stringify(result), 120);

      return result;
    } catch (error) {
      logger.error('Failed to get contracts by group', { error: error.message, groupId });
      throw error;
    }
  }

  async getContractsByUser(userId, filters = {}) {
    try {
      const {
        status,
        contractType,
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = filters;

      const cacheKey = `contracts:user:${userId}:${JSON.stringify(filters)}`;
      const cachedContracts = await redisClient.get(cacheKey);
      
      if (cachedContracts) {
        return JSON.parse(cachedContracts);
      }

      const where = {};
      
      if (status) where.status = status;
      if (contractType) where.contract_type = contractType;

      const offset = (page - 1) * limit;

      // Get contracts where user is a party
      const { count, rows: contracts } = await db.Contract.findAndCountAll({
        where,
        include: [
          {
            model: db.ContractParty,
            as: 'parties',
            where: { user_id: userId },
            attributes: ['user_id', 'party_role', 'has_signed', 'signing_order']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        distinct: true
      });

      const result = {
        contracts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };

      // Cache for 2 minutes
      await redisClient.set(cacheKey, JSON.stringify(result), 120);

      return result;
    } catch (error) {
      logger.error('Failed to get contracts by user', { error: error.message, userId });
      throw error;
    }
  }

  async updateContract(contractId, updateData, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const contract = await db.Contract.findByPk(contractId);
      
      if (!contract) {
        throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
      }

      // Only allow updates for draft contracts
      if (contract.status !== 'draft') {
        throw new AppError('Only draft contracts can be updated', 400, 'CONTRACT_NOT_EDITABLE');
      }

      // Validate user has permission to update
      if (!await this.validateContractAccess(contract, userId)) {
        throw new AppError('Access denied to update contract', 403, 'CONTRACT_UPDATE_DENIED');
      }

      const allowedUpdates = ['title', 'content', 'effective_date', 'expiry_date', 'auto_renew'];
      const updatePayload = {};
      
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          updatePayload[field] = updateData[field];
        }
      });

      await contract.update(updatePayload, { transaction });
      await transaction.commit();

      // Clear cache
      await this.clearContractCache(contractId);

      logger.info('Contract updated successfully', { contractId, updatedBy: userId });

      return await this.getContractById(contractId);
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to update contract', { error: error.message, contractId });
      throw error;
    }
  }

  async sendForSignature(contractId, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const contract = await db.Contract.findByPk(contractId, {
        include: ['parties']
      });

      if (!contract) {
        throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
      }

      if (contract.status !== 'draft') {
        throw new AppError('Contract must be in draft status to send for signature', 400, 'INVALID_CONTRACT_STATUS');
      }

      // Validate user has permission
      if (!await this.validateContractAccess(contract, userId)) {
        throw new AppError('Access denied to send contract for signature', 403, 'CONTRACT_SIGNATURE_DENIED');
      }

      // Update contract status
      await contract.update({ status: 'pending_signatures' }, { transaction });

      await transaction.commit();

      // Clear cache
      await this.clearContractCache(contractId);

      // Publish event
      await eventService.publishContractSentForSignature({
        contractId,
        groupId: contract.group_id,
        title: contract.title,
        parties: contract.parties.map(p => p.user_id)
      });

      logger.info('Contract sent for signature successfully', { contractId, sentBy: userId });

      return await this.getContractById(contractId);
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to send contract for signature', { error: error.message, contractId });
      throw error;
    }
  }

  async validateContractData(contractData) {
    const { parties, contractType } = contractData;

    if (!parties || parties.length === 0) {
      throw new AppError('Contract must have at least one party', 400, 'NO_PARTIES');
    }

    if (contractType === 'co_ownership') {
      const totalOwnership = parties.reduce((sum, party) => sum + (party.ownershipPercentage || 0), 0);
      
      if (Math.abs(totalOwnership - 100) > 0.01) {
        throw new AppError('Total ownership percentage must equal 100%', 400, 'INVALID_OWNERSHIP_TOTAL');
      }
    }

    return true;
  }

  async validateContractAccess(contract, userId) {
    // Check if user is a party in the contract
    const isParty = await db.ContractParty.findOne({
      where: {
        contract_id: contract.id,
        user_id: userId
      }
    });

    if (isParty) return true;

    // TODO: Check if user is in the same group (need integration with user service)
    // For now, return true for demo purposes
    return true;
  }

  async clearContractCache(contractId) {
    const patterns = [
      `contract:${contractId}`,
      `contracts:group:*`
    ];

    for (const pattern of patterns) {
      const keys = await redisClient.keys(pattern);
      for (const key of keys) {
        await redisClient.del(key);
      }
    }
  }
}

export default new ContractService();