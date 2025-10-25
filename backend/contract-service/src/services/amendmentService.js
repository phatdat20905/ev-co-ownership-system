import db from '../models/index.js';
import { 
  logger, 
  AppError 
} from '@ev-coownership/shared';
import eventService from './eventService.js';
import contractService from './contractService.js';
import ContractNumberGenerator from '../utils/contractNumberGenerator.js';

export class AmendmentService {
  async createAmendment(contractId, amendmentData) {
    const transaction = await db.sequelize.transaction();

    try {
      const originalContract = await db.Contract.findByPk(contractId);
      
      if (!originalContract) {
        throw new AppError('Original contract not found', 404, 'CONTRACT_NOT_FOUND');
      }

      if (originalContract.status !== 'active') {
        throw new AppError('Only active contracts can be amended', 400, 'CONTRACT_NOT_ACTIVE');
      }

      const {
        reason,
        changesSummary,
        content,
        effectiveDate,
        createdBy
      } = amendmentData;

      // Create amendment contract
      const amendmentContract = await db.Contract.create({
        group_id: originalContract.group_id,
        contract_type: 'amendment',
        contract_number: ContractNumberGenerator.generateAmendmentNumber(originalContract.contract_number),
        title: `Phụ lục: ${originalContract.title}`,
        content: content || this.generateAmendmentContent(originalContract, changesSummary),
        status: 'draft',
        effective_date: effectiveDate || originalContract.effective_date,
        created_by: createdBy
      }, { transaction });

      // Link amendment to original contract
      await db.ContractAmendment.create({
        original_contract_id: contractId,
        amendment_contract_id: amendmentContract.id,
        amendment_reason: reason,
        changes_summary: changesSummary
      }, { transaction });

      // Copy parties from original contract
      const originalParties = await db.ContractParty.findAll({
        where: { contract_id: contractId }
      });

      for (const party of originalParties) {
        await db.ContractParty.create({
          contract_id: amendmentContract.id,
          user_id: party.user_id,
          party_role: party.party_role,
          ownership_percentage: party.ownership_percentage,
          signing_order: party.signing_order,
          has_signed: false
        }, { transaction });
      }

      await transaction.commit();

      // Publish event
      await eventService.publishContractAmended({
        originalContractId: contractId,
        amendmentContractId: amendmentContract.id,
        groupId: originalContract.group_id,
        reason
      });

      logger.info('Contract amendment created successfully', { 
        originalContractId: contractId,
        amendmentContractId: amendmentContract.id,
        reason 
      });

      return await contractService.getContractById(amendmentContract.id);
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to create contract amendment', { error: error.message, contractId });
      throw error;
    }
  }

  async getAmendments(contractId) {
    try {
      const amendments = await db.ContractAmendment.findAll({
        where: { original_contract_id: contractId },
        include: [
          {
            model: db.Contract,
            as: 'amendment_contract',
            include: ['parties']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return amendments;
    } catch (error) {
      logger.error('Failed to get contract amendments', { error: error.message, contractId });
      throw error;
    }
  }

  async approveAmendment(amendmentContractId, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const amendment = await db.ContractAmendment.findOne({
        where: { amendment_contract_id: amendmentContractId },
        include: ['original_contract', 'amendment_contract']
      });

      if (!amendment) {
        throw new AppError('Amendment not found', 404, 'AMENDMENT_NOT_FOUND');
      }

      if (amendment.amendment_contract.status !== 'active') {
        throw new AppError('Amendment must be active before approval', 400, 'AMENDMENT_NOT_ACTIVE');
      }

      // Update original contract with amendment changes
      await amendment.original_contract.update({
        content: amendment.amendment_contract.content,
        // Add other fields that should be updated from amendment
        updated_at: new Date()
      }, { transaction });

      // Mark amendment as executed
      await amendment.amendment_contract.update({ status: 'executed' }, { transaction });

      await transaction.commit();

      // Clear cache
      await contractService.clearContractCache(amendment.original_contract_id);
      await contractService.clearContractCache(amendmentContractId);

      // Publish event
      await eventService.publishContractAmended({
        originalContractId: amendment.original_contract_id,
        amendmentContractId: amendmentContractId,
        groupId: amendment.original_contract.group_id,
        reason: amendment.amendment_reason,
        approvedBy: userId
      });

      logger.info('Contract amendment approved successfully', { 
        amendmentContractId,
        originalContractId: amendment.original_contract_id,
        approvedBy: userId 
      });

      return amendment;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to approve amendment', { error: error.message, amendmentContractId });
      throw error;
    }
  }

  generateAmendmentContent(originalContract, changesSummary) {
    return `
      <h1>PHỤ LỤC HỢP ĐỒNG</h1>
      <p><strong>Hợp đồng gốc:</strong> ${originalContract.contract_number}</p>
      <p><strong>Tiêu đề:</strong> ${originalContract.title}</p>
      <p><strong>Lý do sửa đổi:</strong> ${changesSummary}</p>
      <p><strong>Nội dung sửa đổi:</strong></p>
      <div>${changesSummary}</div>
      <p><em>Phụ lục này là một phần không thể tách rời của hợp đồng gốc và có hiệu lực kể từ ngày ký.</em></p>
    `;
  }
}

export default new AmendmentService();