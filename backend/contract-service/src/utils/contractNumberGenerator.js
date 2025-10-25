import { randomInt } from 'crypto';
import { logger } from '@ev-coownership/shared';

export class ContractNumberGenerator {
  static generateContractNumber(prefix = 'CTR') {
    const timestamp = Date.now().toString().slice(-8);
    const random = randomInt(1000, 9999);
    const contractNumber = `${prefix}-${timestamp}-${random}`;
    
    logger.debug('Contract number generated', { contractNumber });
    return contractNumber;
  }

  static generateAmendmentNumber(originalContractNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = randomInt(100, 999);
    return `${originalContractNumber}/AMEND-${timestamp}-${random}`;
  }

  static generateTemplateNumber(prefix = 'TMP') {
    const timestamp = Date.now().toString().slice(-6);
    const random = randomInt(100, 999);
    return `${prefix}-${timestamp}-${random}`;
  }
}

export default ContractNumberGenerator;