import db from '../models/index.js';
import { 
  logger, 
  AppError 
} from '@ev-coownership/shared';
import eventService from './eventService.js';
import contractService from './contractService.js';

export class LifecycleService {
  async checkExpiringContracts() {
    try {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const now = new Date();
      
      const expiringContracts = await db.Contract.findAll({
        where: {
          status: 'active',
          expiry_date: {
            [db.Sequelize.Op.between]: [now, thirtyDaysFromNow]
          }
        },
        include: ['parties']
      });

      const results = [];

      for (const contract of expiringContracts) {
        const daysUntilExpiry = Math.ceil((contract.expiry_date - now) / (24 * 60 * 60 * 1000));
        
        // Send expiry reminder
        await eventService.publishContractExpiryReminderSent({
          contractId: contract.id,
          groupId: contract.group_id,
          title: contract.title,
          expiryDate: contract.expiry_date,
          daysUntilExpiry,
          parties: contract.parties.map(p => p.user_id)
        });

        // Prepare auto-renewal for certain contract types
        if (contract.contract_type === 'co_ownership' && contract.auto_renew) {
          await this.prepareAutoRenewal(contract);
        }

        results.push({
          contractId: contract.id,
          title: contract.title,
          expiryDate: contract.expiry_date,
          daysUntilExpiry,
          autoRenew: contract.auto_renew
        });
      }

      logger.info('Expiring contracts checked', { 
        total: expiringContracts.length,
        results 
      });

      return results;
    } catch (error) {
      logger.error('Failed to check expiring contracts', { error: error.message });
      throw error;
    }
  }

  async prepareAutoRenewal(contract) {
    const transaction = await db.sequelize.transaction();

    try {
      const renewalContract = await db.Contract.create({
        group_id: contract.group_id,
        contract_type: 'renewal',
        contract_number: await this.generateRenewalNumber(contract.contract_number),
        title: `Gia hạn: ${contract.title}`,
        content: contract.content,
        status: 'draft',
        effective_date: contract.expiry_date,
        expiry_date: new Date(contract.expiry_date.getTime() + 365 * 24 * 60 * 60 * 1000), // +1 year
        auto_renew: contract.auto_renew,
        parent_contract_id: contract.id,
        created_by: contract.created_by
      }, { transaction });

      // Copy parties from original contract
      const originalParties = await db.ContractParty.findAll({
        where: { contract_id: contract.id }
      });

      for (const party of originalParties) {
        await db.ContractParty.create({
          contract_id: renewalContract.id,
          user_id: party.user_id,
          party_role: party.party_role,
          ownership_percentage: party.ownership_percentage,
          signing_order: party.signing_order,
          has_signed: false
        }, { transaction });
      }

      await transaction.commit();

      await eventService.publishContractRenewed({
        originalContractId: contract.id,
        renewalContractId: renewalContract.id,
        groupId: contract.group_id
      });

      logger.info('Contract auto-renewal prepared', { 
        originalContractId: contract.id,
        renewalContractId: renewalContract.id 
      });

      return renewalContract;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to prepare auto-renewal', { error: error.message, contractId: contract.id });
      throw error;
    }
  }

  async expireContracts() {
    try {
      const now = new Date();
      
      const expiredContracts = await db.Contract.findAll({
        where: {
          status: 'active',
          expiry_date: {
            [db.Sequelize.Op.lt]: now
          }
        }
      });

      const results = [];

      for (const contract of expiredContracts) {
        await contract.update({ status: 'expired' });

        await eventService.publishContractExpired({
          contractId: contract.id,
          groupId: contract.group_id,
          title: contract.title
        });

        // Clear cache
        await contractService.clearContractCache(contract.id);

        results.push({
          contractId: contract.id,
          title: contract.title,
          expiredAt: now
        });
      }

      logger.info('Contracts expired', { 
        total: expiredContracts.length,
        results 
      });

      return results;
    } catch (error) {
      logger.error('Failed to expire contracts', { error: error.message });
      throw error;
    }
  }

  generateRenewalNumber(originalNumber) {
    const timestamp = Date.now().toString().slice(-6);
    return `${originalNumber}/RENEW-${timestamp}`;
  }
}

export default new LifecycleService();