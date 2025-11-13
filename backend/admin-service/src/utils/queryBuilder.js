// src/utils/queryBuilder.js
import { Op } from 'sequelize';
import { logger } from '@ev-coownership/shared';

export class QueryBuilder {
  static buildSequelizeQuery(filters = {}) {
    const where = {};
    const include = [];
    const order = [];

    // Handle search
    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    // Handle status filters
    if (filters.status) {
      where.status = Array.isArray(filters.status) ? { [Op.in]: filters.status } : filters.status;
    }

    // Handle date ranges
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt[Op.gte] = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt[Op.lte] = new Date(filters.endDate);
      }
    }

    // Handle ordering
    if (filters.sortBy) {
      const direction = filters.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      order.push([filters.sortBy, direction]);
    } else {
      order.push(['createdAt', 'DESC']);
    }

    return { where, include, order };
  }

  static buildMongoQuery(filters = {}) {
    const query = {};

    // Handle text search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Handle exact matches
    if (filters.service) {
      query.service_name = filters.service;
    }

    if (filters.level) {
      query.log_level = filters.level;
    }

    // Handle date ranges
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.timestamp.$lte = new Date(filters.endDate);
      }
    }

    return query;
  }

  static buildPaginationOptions(query = {}) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  static buildSortOptions(sortBy, sortOrder = 'desc') {
    const sort = {};
    
    if (sortBy) {
      sort[sortBy] = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
    } else {
      sort.timestamp = -1; // Default sort by timestamp descending
    }

    return sort;
  }

  static sanitizeFilters(filters, allowedFields) {
    const sanitized = {};
    
    Object.keys(filters).forEach(key => {
      if (allowedFields.includes(key) && filters[key] !== undefined && filters[key] !== null) {
        sanitized[key] = filters[key];
      }
    });

    return sanitized;
  }
}

export default QueryBuilder;