// src/repositories/baseRepository.js
import { logger } from '@ev-coownership/shared';

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    try {
      return await this.model.findAll(options);
    } catch (error) {
      logger.error(`Error in ${this.model.name} findAll:`, error);
      throw error;
    }
  }

  async findById(id, options = {}) {
    try {
      return await this.model.findByPk(id, options);
    } catch (error) {
      logger.error(`Error in ${this.model.name} findById:`, error);
      throw error;
    }
  }

  async findOne(where, options = {}) {
    try {
      return await this.model.findOne({ where, ...options });
    } catch (error) {
      logger.error(`Error in ${this.model.name} findOne:`, error);
      throw error;
    }
  }

  async create(data, options = {}) {
    try {
      return await this.model.create(data, options);
    } catch (error) {
      logger.error(`Error in ${this.model.name} create:`, error);
      throw error;
    }
  }

  async update(id, data, options = {}) {
    try {
      const instance = await this.model.findByPk(id);
      if (!instance) {
        return null;
      }
      return await instance.update(data, options);
    } catch (error) {
      logger.error(`Error in ${this.model.name} update:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const instance = await this.model.findByPk(id);
      if (!instance) {
        return false;
      }
      await instance.destroy();
      return true;
    } catch (error) {
      logger.error(`Error in ${this.model.name} delete:`, error);
      throw error;
    }
  }

  async count(where = {}) {
    try {
      return await this.model.count({ where });
    } catch (error) {
      logger.error(`Error in ${this.model.name} count:`, error);
      throw error;
    }
  }

  async paginate({ page = 1, limit = 20, where = {}, include = [], order = [] }) {
    try {
      const offset = (page - 1) * limit;
      
      const result = await this.model.findAndCountAll({
        where,
        include,
        order,
        limit,
        offset,
        distinct: true
      });

      return {
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.count,
          totalPages: Math.ceil(result.count / limit)
        }
      };
    } catch (error) {
      logger.error(`Error in ${this.model.name} paginate:`, error);
      throw error;
    }
  }
}