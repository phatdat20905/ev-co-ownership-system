import { v4 as uuidv4 } from 'uuid';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdef', 10);

export class IdGenerator {
  generateUUID() {
    return uuidv4();
  }

  generateShortId() {
    return nanoid();
  }

  generateRecommendationId() {
    return `rec_${this.generateShortId()}`;
  }

  generateRequestId() {
    return `req_${Date.now()}_${this.generateShortId()}`;
  }
}

export const idGenerator = new IdGenerator();
export default idGenerator;