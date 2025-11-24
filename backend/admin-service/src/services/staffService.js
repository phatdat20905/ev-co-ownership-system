// src/services/staffService.js
import staffRepository from '../repositories/staffRepository.js';
import { logger, AppError } from '@ev-coownership/shared';
import eventService from './eventService.js';
import { v4 as uuidv4 } from 'uuid';

export class StaffService {
  async createStaff(staffData) {
    try {
      // If client didn't supply a userId, generate one so userId is never null.
      // Note: this creates a staff.userId value but does NOT create a corresponding
      // user in the user-service. If you need an actual user account, call user-service
      // to create or link a user and populate userId accordingly.
      const generatedUserId = !staffData.userId;
      if (generatedUserId) {
        staffData.userId = uuidv4();
      }
      // Check if employee ID already exists
      const existingStaff = await staffRepository.findByEmployeeId(staffData.employeeId);
      if (existingStaff) {
        throw new AppError('Employee ID already exists', 400, 'DUPLICATE_EMPLOYEE_ID');
      }
      // If the client provided a userId (not one we generated), ensure the user doesn't already have a staff profile
      if (!generatedUserId) {
        const existingUserStaff = await staffRepository.findByUserId(staffData.userId);
        if (existingUserStaff) {
          throw new AppError('User already has a staff profile', 400, 'DUPLICATE_STAFF_PROFILE');
        }
      }

      const staff = await staffRepository.create(staffData);

      logger.info('Staff profile created successfully', {
        staffId: staff.id,
        employeeId: staff.employeeId,
        department: staff.department
      });

      await eventService.publishStaffCreated({
        staffId: staff.id,
        userId: staff.userId,
        employeeId: staff.employeeId,
        department: staff.department,
        position: staff.position
      });

      return staff;
    } catch (error) {
      logger.error('Failed to create staff profile', {
        error: error.message,
        employeeId: staffData.employeeId,
        userId: staffData.userId
      });
      throw error;
    }
  }

  async getStaffById(staffId) {
    try {
      const staff = await staffRepository.findById(staffId);
      if (!staff) {
        throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
      }
      return staff;
    } catch (error) {
      logger.error('Failed to get staff by ID', {
        error: error.message,
        staffId
      });
      throw error;
    }
  }

  async getStaffByUserId(userId) {
    try {
      const staff = await staffRepository.findByUserId(userId);
      if (!staff) {
        throw new AppError('Staff not found for user', 404, 'STAFF_NOT_FOUND');
      }
      return staff;
    } catch (error) {
      logger.error('Failed to get staff by user ID', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  async updateStaff(staffId, updateData) {
    try {
      const staff = await staffRepository.update(staffId, updateData);
      if (!staff) {
        throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
      }

      logger.info('Staff profile updated successfully', {
        staffId,
        updates: Object.keys(updateData)
      });

      await eventService.publishStaffUpdated({
        staffId: staff.id,
        updates: updateData
      });

      return staff;
    } catch (error) {
      logger.error('Failed to update staff profile', {
        error: error.message,
        staffId
      });
      throw error;
    }
  }

  async updatePermissions(staffId, permissions) {
    try {
      const staff = await staffRepository.updatePermissions(staffId, permissions);
      if (!staff) {
        throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
      }

      logger.info('Staff permissions updated successfully', {
        staffId,
        permissions
      });

      await eventService.publishStaffPermissionsUpdated({
        staffId: staff.id,
        permissions
      });

      return staff;
    } catch (error) {
      logger.error('Failed to update staff permissions', {
        error: error.message,
        staffId
      });
      throw error;
    }
  }

  async deactivateStaff(staffId) {
    try {
      const staff = await staffRepository.deactivateStaff(staffId);
      if (!staff) {
        throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
      }

      logger.info('Staff deactivated successfully', { staffId });

      await eventService.publishStaffDeactivated({
        staffId: staff.id
      });

      return staff;
    } catch (error) {
      logger.error('Failed to deactivate staff', {
        error: error.message,
        staffId
      });
      throw error;
    }
  }

  async listStaff(filters = {}) {
    try {
      const {
        department,
        isActive = true,
        page = 1,
        limit = 20
      } = filters;

      const where = { isActive };
      if (department) {
        where.department = department;
      }

      const result = await staffRepository.paginate({
        where,
        page,
        limit,
        order: [['createdAt', 'DESC']]
      });

      logger.debug('Staff list retrieved successfully', {
        total: result.pagination.total,
        page,
        limit
      });

      // Enrich returned staff rows with performance summary (disputes, kyc) and managedVehiclesCount
      try {
        // Get aggregated performance for active staff for the same period (monthly)
        const perfRows = await staffRepository.getStaffWithPerformance('monthly');
        const perfMap = {};
        if (Array.isArray(perfRows)) {
          perfRows.forEach(p => {
            if (p.id) perfMap[p.id] = p;
          });
        }

        // Normalize result data shape (paginate helper may return { data } or { rows })
        const dataKey = result.data ? 'data' : (result.rows ? 'rows' : null);
        const items = dataKey ? result[dataKey] : (Array.isArray(result) ? result : []);

        const enriched = items.map((s) => {
          const id = s.id || s.ID || null;
          const perf = perfMap[id] || {};
          const totalDisputes = perf.total_disputes ? Number(perf.total_disputes) : 0;
          const totalKYC = perf.total_kyc_reviews ? Number(perf.total_kyc_reviews) : 0;
          const resolutionRate = perf.resolution_rate ? Number(perf.resolution_rate) : 0;

          // rough estimate of resolved disputes count (resolutionRate is avg 0/1)
          const resolvedDisputes = Math.round(totalDisputes * resolutionRate);

          // Completed tasks = resolved disputes + completed KYC reviews (approximation)
          const completedTasks = resolvedDisputes + totalKYC;

          return {
            ...s,
            totalDisputes,
            totalKYCReviews: totalKYC,
            resolutionRate,
            completedTasks,
            // managedVehiclesCount is a denormalized column; fallback to 0 if missing
            managedVehiclesCount: s.managedVehiclesCount ?? s.managed_vehicles_count ?? 0,
            // normalize common contact fields to camelCase for frontend convenience
            email: s.email ?? s.contact_email ?? null,
            phone: s.phone ?? s.contact_phone ?? null
          };
        });

        // attach enriched items back into result preserving pagination metadata
        if (dataKey) {
          result[dataKey] = enriched;
        } else {
          // unknown paginate shape: return enriched array as-is
          return { data: enriched, pagination: result.pagination || {} };
        }
      } catch (err) {
        // Do not block the list if enrichment fails; log and return original result
        logger.warn('Failed to enrich staff list with performance data', { error: err.message });
      }

      return result;
    } catch (error) {
      logger.error('Failed to list staff', {
        error: error.message,
        filters
      });
      throw error;
    }
  }

  async getStaffPerformance(period = 'monthly') {
    try {
      const performance = await staffRepository.getStaffWithPerformance(period);

      logger.debug('Staff performance data retrieved successfully', {
        period,
        count: performance.length
      });

      return performance;
    } catch (error) {
      logger.error('Failed to get staff performance', {
        error: error.message,
        period
      });
      throw error;
    }
  }

  /**
   * Return staff list enriched with external user profiles (bulk) to avoid N+1 calls.
   * This method will fall back to the regular list if the user-service call fails.
   */
  async listStaffEnriched(filters = {}) {
    try {
      // Reuse existing listStaff which already provides performance enrichment and denormalized fields
      const result = await this.listStaff(filters);

      // Normalize result items array
      const dataKey = result.data ? 'data' : (result.rows ? 'rows' : null);
      const items = dataKey ? result[dataKey] : (Array.isArray(result) ? result : []);

      // Collect userIds to request from user-service in bulk
      const userIds = Array.from(new Set(items.map(i => i.userId).filter(Boolean)));
      if (userIds.length === 0) return result;

      // Attempt bulk fetch from user-service (POST /api/v1/users/bulk-get) or fallback to query param API
      const userServiceBase = process.env.USER_SERVICE_URL;
      if (!userServiceBase) {
        logger.warn('USER_SERVICE_URL not configured — returning staff list without external enrichment');
        return result;
      }

      try {
        const url = `${userServiceBase.replace(/\/$/, '')}/api/v1/users/bulk-get`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: userIds })
        });

        if (!resp.ok) {
          // Try alternate GET style
          const altUrl = `${userServiceBase.replace(/\/$/, '')}/api/v1/users?ids=${userIds.join(',')}`;
          const altResp = await fetch(altUrl);
          if (!altResp.ok) throw new Error(`User service bulk endpoints failed: ${resp.status}/${altResp.status}`);
          const altJson = await altResp.json();
          const users = altJson.data || altJson;
          const userMap = {};
          users.forEach(u => { if (u.id) userMap[u.id] = u; });

          const merged = items.map(it => ({ ...it, ...(userMap[it.userId] || {}) }));
          if (dataKey) result[dataKey] = merged; else result.data = merged;
          return result;
        }

        const json = await resp.json();
        const users = json.data || json;
        const userMap = {};
        if (Array.isArray(users)) users.forEach(u => { if (u.id) userMap[u.id] = u; });

        // Merge user profile fields (email, phone, name) into staff items
        const mergedItems = items.map((it) => {
          const user = userMap[it.userId] || {};
          return {
            ...it,
            firstName: it.firstName || user.firstName || user.first_name || null,
            lastName: it.lastName || user.lastName || user.last_name || null,
            email: it.email || user.email || null,
            phone: it.phone || user.phone || null
          };
        });

        if (dataKey) result[dataKey] = mergedItems; else result.data = mergedItems;
        return result;
      } catch (err) {
        logger.warn('Bulk fetch from user-service failed — returning denormalized staff list', { error: err.message });
        return result;
      }
    } catch (error) {
      logger.error('Failed to list enriched staff', { error: error.message, filters });
      throw error;
    }
  }

  async validateStaffPermissions(staffId, requiredPermission) {
    try {
      const staff = await staffRepository.findById(staffId);
      if (!staff) {
        throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
      }

      if (!staff.isActive) {
        throw new AppError('Staff account is deactivated', 403, 'STAFF_DEACTIVATED');
      }

      const hasPermission = staff.permissions[requiredPermission];
      if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      return staff;
    } catch (error) {
      logger.error('Failed to validate staff permissions', {
        error: error.message,
        staffId,
        requiredPermission
      });
      throw error;
    }
  }
}

export default new StaffService();