import db from '../models/index.js';
import { 
  logger, 
  AppError 
} from '@ev-coownership/shared';
import eventService from './eventService.js';
import SignatureValidator from '../utils/signatureValidator.js';

export class SignatureService {
  async signContract(contractId, userId, signatureData, clientInfo = {}) {
    const transaction = await db.sequelize.transaction();

    try {
      const contract = await db.Contract.findByPk(contractId, {
        include: ['parties']
      });

      if (!contract) {
        throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
      }

      const party = await db.ContractParty.findOne({
        where: { contract_id: contractId, user_id: userId }
      });

      if (!party) {
        throw new AppError('User is not a party in this contract', 403, 'NOT_CONTRACT_PARTY');
      }

      if (party.has_signed) {
        throw new AppError('User has already signed this contract', 400, 'ALREADY_SIGNED');
      }

      if (contract.status !== 'pending_signatures') {
        throw new AppError('Contract is not in signature pending status', 400, 'INVALID_CONTRACT_STATUS');
      }

      // Validate digital signature
      await SignatureValidator.validateDigitalSignature(signatureData, userId);

      // Record signature
      await db.SignatureLog.create({
        contract_id: contractId,
        user_id: userId,
        signature_data: signatureData.signature,
        signed_at: new Date(),
        ip_address: clientInfo.ipAddress,
        user_agent: clientInfo.userAgent
      }, { transaction });

      // Update party signature status
      await party.update({ 
        has_signed: true,
        signed_at: new Date(),
        signature_data: signatureData.signature
      }, { transaction });

      // Check if all parties have signed
      const unsignedParties = await db.ContractParty.count({
        where: { 
          contract_id: contractId,
          has_signed: false
        },
        transaction
      });

      let contractStatus = contract.status;
      
      if (unsignedParties === 0) {
        // All parties have signed - activate contract
        await contract.update({ 
          status: 'active',
          activated_at: new Date()
        }, { transaction });
        
        contractStatus = 'active';

        // Publish contract activated event
        await eventService.publishContractActivated({
          contractId,
          groupId: contract.group_id,
          title: contract.title,
          effectiveDate: contract.effective_date
        });
      }

      await transaction.commit();

      // Publish signature event
      await eventService.publishContractSigned({
        contractId,
        userId,
        groupId: contract.group_id,
        contractStatus
      });

      logger.info('Contract signed successfully', { 
        contractId, 
        userId,
        allSigned: unsignedParties === 0
      });

      return { 
        success: true, 
        contractStatus,
        allSigned: unsignedParties === 0
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to sign contract', { error: error.message, contractId, userId });
      throw error;
    }
  }

  async getSignatureStatus(contractId) {
    try {
      const contract = await db.Contract.findByPk(contractId, {
        include: [
          {
            model: db.ContractParty,
            as: 'parties',
            attributes: ['user_id', 'party_role', 'has_signed', 'signed_at']
          }
        ]
      });

      if (!contract) {
        throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
      }

      const totalParties = contract.parties.length;
      const signedParties = contract.parties.filter(p => p.has_signed).length;
      const unsignedParties = totalParties - signedParties;

      return {
        contractId,
        contractStatus: contract.status,
        totalParties,
        signedParties,
        unsignedParties,
        signatureProgress: totalParties > 0 ? (signedParties / totalParties) * 100 : 0,
        parties: contract.parties.map(party => ({
          userId: party.user_id,
          role: party.party_role,
          hasSigned: party.has_signed,
          signedAt: party.signed_at
        }))
      };
    } catch (error) {
      logger.error('Failed to get signature status', { error: error.message, contractId });
      throw error;
    }
  }

  async getSignatureLogs(contractId) {
    try {
      const logs = await db.SignatureLog.findAll({
        where: { contract_id: contractId },
        order: [['signed_at', 'DESC']],
        attributes: ['id', 'user_id', 'signed_at', 'ip_address']
      });

      return logs;
    } catch (error) {
      logger.error('Failed to get signature logs', { error: error.message, contractId });
      throw error;
    }
  }

  async sendSignatureReminder(contractId, userId, reminderType = 'general') {
    try {
      const contract = await db.Contract.findByPk(contractId, {
        include: ['parties']
      });

      if (!contract) {
        throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
      }

      if (contract.status !== 'pending_signatures') {
        throw new AppError('Contract is not in signature pending status', 400, 'INVALID_CONTRACT_STATUS');
      }

      const unsignedParties = contract.parties.filter(p => !p.has_signed);
      
      if (unsignedParties.length === 0) {
        throw new AppError('All parties have already signed the contract', 400, 'ALL_PARTIES_SIGNED');
      }

      // In a real implementation, this would send actual notifications
      // For now, we'll just log and publish events
      for (const party of unsignedParties) {
        await eventService.publishSignatureReminderSent({
          contractId,
          userId: party.user_id,
          groupId: contract.group_id,
          reminderType
        });
      }

      logger.info('Signature reminders sent successfully', { 
        contractId,
        sentBy: userId,
        remindersSent: unsignedParties.length
      });

      return {
        success: true,
        remindersSent: unsignedParties.length,
        message: `Signature reminders sent to ${unsignedParties.length} parties`
      };
    } catch (error) {
      logger.error('Failed to send signature reminders', { error: error.message, contractId });
      throw error;
    }
  }

  async verifySignature(contractId, signatureData) {
    try {
      const signatureLog = await db.SignatureLog.findOne({
        where: { 
          contract_id: contractId,
          signature_data: signatureData.signature
        },
        include: ['contract']
      });

      if (!signatureLog) {
        throw new AppError('Signature not found', 404, 'SIGNATURE_NOT_FOUND');
      }

      // Verify signature validity
      const isValid = await SignatureValidator.validateDigitalSignature(
        signatureData,
        signatureLog.user_id
      );

      return {
        isValid,
        signatureDetails: {
          contractId: signatureLog.contract_id,
          userId: signatureLog.user_id,
          signedAt: signatureLog.signed_at,
          contractTitle: signatureLog.contract?.title
        }
      };
    } catch (error) {
      logger.error('Failed to verify signature', { error: error.message, contractId });
      throw error;
    }
  }
}

export default new SignatureService();