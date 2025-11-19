// src/services/costService.js
import { 
  costRepository, 
  splitRepository, 
} from '../repositories/index.js';
import { AppError, logger } from '@ev-coownership/shared';
import splitCalculator from '../utils/splitCalculator.js';
import eventService from './eventService.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

export class CostService {
  async createCost(costData, userId) {
    try {
      const cost = await costRepository.create({
        ...costData,
        createdBy: userId
      });

      // Calculate splits based on split type
      const splits = await splitCalculator.calculateSplits(cost);
      await splitRepository.createSplits(cost.id, splits);

      // Publish event
      await eventService.publishCostCreated({
        costId: cost.id,
        groupId: cost.groupId,
        vehicleId: cost.vehicleId,
        totalAmount: cost.totalAmount,
        createdBy: userId,
        splitsCount: splits.length
      });

      logger.info('Cost created successfully', { costId: cost.id, groupId: cost.groupId });
      return await costRepository.findById(cost.id);
    } catch (error) {
      logger.error('CostService.createCost - Error:', error);
      throw error;
    }
  }

  async getCostById(id, userId) {
    try {
      const cost = await costRepository.findById(id);
      
      // Check if user has access to this cost (via group membership)
      // This would typically call User Service to verify group membership
      // For now, we'll assume the API Gateway handles authentication
      
      return cost;
    } catch (error) {
      logger.error('CostService.getCostById - Error:', error);
      throw error;
    }
  }

  async getCostsByGroup(groupId, filters, userId) {
    try {
      return await costRepository.findByGroup(groupId, filters);
    } catch (error) {
      logger.error('CostService.getCostsByGroup - Error:', error);
      throw error;
    }
  }

  async updateCost(id, costData, userId) {
    try {
      const cost = await costRepository.update(id, costData);

      // Publish event
      await eventService.publishCostUpdated({
        costId: cost.id,
        groupId: cost.groupId,
        updatedBy: userId,
        updates: costData
      });

      logger.info('Cost updated successfully', { costId: cost.id });
      return cost;
    } catch (error) {
      logger.error('CostService.updateCost - Error:', error);
      throw error;
    }
  }

  async deleteCost(id, userId) {
    try {
      await costRepository.delete(id);

      // Publish event
      await eventService.publishCostDeleted({
        costId: id,
        deletedBy: userId
      });

      logger.info('Cost deleted successfully', { costId: id });
      return { success: true, message: 'Cost deleted successfully' };
    } catch (error) {
      logger.error('CostService.deleteCost - Error:', error);
      throw error;
    }
  }

  async getCostSummary(groupId, period, userId) {
    try {
      const summary = await costRepository.getCostSummary(groupId, period);
      
      // Calculate total and percentages
      const totalAmount = summary.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0);
      
      const categories = summary.map(item => ({
        id: item.categoryId,
        name: item.categoryName || 'Khác',
        amount: parseFloat(item.totalAmount || 0),
        count: parseInt(item.costCount || 0),
        percentage: totalAmount > 0 ? ((parseFloat(item.totalAmount || 0) / totalAmount) * 100).toFixed(1) : 0
      }));

      return {
        total: totalAmount,
        categories,
        period
      };
    } catch (error) {
      logger.error('CostService.getCostSummary - Error:', error);
      throw error;
    }
  }

  async getCostBreakdown(groupId, period, userId) {
    try {
      // Get summary by category
      const summary = await this.getCostSummary(groupId, period, userId);
      
      // Get ownership breakdown from splits
      const ownershipBreakdown = await splitRepository.getOwnershipBreakdown(groupId, period);
      
      // Calculate trend (compare with previous period)
      const previousPeriodSummary = await this.getPreviousPeriodSummary(groupId, period);
      const change = this.calculateChange(summary.total, previousPeriodSummary.total);

      return {
        ...summary,
        change,
        ownershipBreakdown,
        period
      };
    } catch (error) {
      logger.error('CostService.getCostBreakdown - Error:', error);
      throw error;
    }
  }

  async getPreviousPeriodSummary(groupId, period) {
    try {
      // Calculate previous period dates
      let previousPeriod;
      const now = new Date();
      
      switch (period) {
        case 'week':
          previousPeriod = { 
            start: new Date(now.setDate(now.getDate() - 14)),
            end: new Date(now.setDate(now.getDate() - 7))
          };
          break;
        case 'month':
          previousPeriod = {
            start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            end: new Date(now.getFullYear(), now.getMonth(), 0)
          };
          break;
        case 'quarter':
          previousPeriod = {
            start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
            end: new Date(now.getFullYear(), now.getMonth() - 3, 0)
          };
          break;
        default:
          return { total: 0 };
      }

      const costs = await costRepository.findByGroup(groupId, {
        startDate: previousPeriod.start,
        endDate: previousPeriod.end
      });

      const total = costs.costs.reduce((sum, cost) => sum + parseFloat(cost.totalAmount || 0), 0);
      
      return { total };
    } catch (error) {
      logger.error('CostService.getPreviousPeriodSummary - Error:', error);
      return { total: 0 };
    }
  }

  calculateChange(current, previous) {
    if (previous === 0) return '+100%';
    const changePercent = ((current - previous) / previous * 100).toFixed(1);
    return changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`;
  }

  async calculateSplits(costId, userId) {
    try {
      const cost = await costRepository.findById(costId);
      const splits = await splitRepository.findByCostId(costId);
      
      return {
        cost,
        splits,
        totalAmount: cost.totalAmount,
        splitType: cost.splitType
      };
    } catch (error) {
      logger.error('CostService.calculateSplits - Error:', error);
      throw error;
    }
  }

  async getExpenseTracking(groupId, year, userId) {
    try {
      const currentYear = parseInt(year) || new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1);
      const endDate = new Date(currentYear, 11, 31);

      // Get all costs for the year
      const yearCosts = await costRepository.getCostsByDateRange(groupId, startDate, endDate);

      // Calculate total expenses
      const totalExpenses = yearCosts.reduce((sum, cost) => sum + parseFloat(cost.totalAmount || 0), 0);

      // Calculate monthly average
      const monthlyAverage = totalExpenses / 12;

      // Get previous year data for YoY calculation
      const previousYearStart = new Date(currentYear - 1, 0, 1);
      const previousYearEnd = new Date(currentYear - 1, 11, 31);
      const previousYearCosts = await costRepository.getCostsByDateRange(groupId, previousYearStart, previousYearEnd);
      const previousYearTotal = previousYearCosts.reduce((sum, cost) => sum + parseFloat(cost.totalAmount || 0), 0);

      // Calculate YoY growth
      const yoyGrowth = previousYearTotal > 0 
        ? ((totalExpenses - previousYearTotal) / previousYearTotal * 100).toFixed(1)
        : 0;

      // Group by category
      const categoryMap = {};
      yearCosts.forEach(cost => {
        const categoryName = cost['category.categoryName'] || 'Khác';
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = {
            name: categoryName,
            amount: 0
          };
        }
        categoryMap[categoryName].amount += parseFloat(cost.totalAmount || 0);
      });

      const categories = Object.values(categoryMap).map(cat => ({
        name: cat.name,
        amount: cat.amount,
        percentage: totalExpenses > 0 ? ((cat.amount / totalExpenses) * 100).toFixed(1) : 0
      }));

      // Group by month
      const monthlyData = [];
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(currentYear, month, 1);
        const monthEnd = new Date(currentYear, month + 1, 0);
        
        const monthCosts = yearCosts.filter(cost => {
          const costDate = new Date(cost.costDate);
          return costDate >= monthStart && costDate <= monthEnd;
        });

        const monthTotal = monthCosts.reduce((sum, cost) => sum + parseFloat(cost.totalAmount || 0), 0);
        
        monthlyData.push({
          month: monthStart.toLocaleDateString('vi-VN', { month: 'short' }),
          amount: monthTotal,
          usage: monthCosts.length
        });
      }

      // Get recent transactions (last 10)
      const recentTransactions = yearCosts
        .sort((a, b) => new Date(b.costDate) - new Date(a.costDate))
        .slice(0, 10)
        .map(cost => ({
          id: cost.id,
          date: new Date(cost.costDate).toLocaleDateString('vi-VN'),
          description: cost.costName,
          amount: parseFloat(cost.totalAmount),
          category: cost['category.categoryName'] || 'other',
          status: cost.invoiced ? 'completed' : 'pending'
        }));

      return {
        totalExpenses,
        monthlyAverage,
        yoyGrowth: parseFloat(yoyGrowth),
        categories,
        monthlyData,
        recentTransactions,
        year: currentYear
      };
    } catch (error) {
      logger.error('CostService.getExpenseTracking - Error:', error);
      throw error;
    }
  }

  async getPaymentHistory(groupId, userId, filters = {}) {
    try {
      const { status, timeRange = '3months', page = 1, limit = 20 } = filters;

      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();
      switch (timeRange) {
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 3);
      }

      // Get payment history from splits
      const paymentHistory = await splitRepository.getPaymentHistory(
        userId, 
        groupId, 
        { 
          status, 
          startDate, 
          endDate, 
          page, 
          limit 
        }
      );

      // Calculate stats
      const stats = await splitRepository.getPaymentStats(userId, groupId, startDate, endDate);

      return {
        payments: paymentHistory.rows,
        pagination: paymentHistory.pagination,
        stats
      };
    } catch (error) {
      logger.error('CostService.getPaymentHistory - Error:', error);
      throw error;
    }
  }

  // Admin overview: total revenue across all groups for a given period
  async getAdminOverview(period = 'month') {
    try {
      const totalRevenue = await costRepository.getTotalRevenue(period);
      return { totalRevenue };
    } catch (error) {
      logger.error('CostService.getAdminOverview - Error:', error);
      return { totalRevenue: 0 };
    }
  }

  async exportCostBreakdownPDF(groupId, period, userId) {
    try {
      const PDFModule = await import('pdfkit');
      const PDFDocument = PDFModule.default || PDFModule;
      const breakdown = await this.getCostBreakdown(groupId, period, userId);
      
      // Prepare optional font for Vietnamese if available
      let notoFontPath = null;
      try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        notoFontPath = path.resolve(__dirname, '../assets/fonts/NotoSans-Regular.ttf');
        if (!fs.existsSync(notoFontPath)) {
          logger.warn('NotoSans font not found at ' + notoFontPath + '. Vietnamese characters may not render correctly in PDFs.');
          notoFontPath = null;
        }
      } catch (fontErr) {
        logger.warn('Failed to probe custom font for PDF export', { error: fontErr.message });
        notoFontPath = null;
      }

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        // Register font inside the PDF generation context if available
        try {
          if (notoFontPath) {
            doc.registerFont('NotoSans', notoFontPath);
            doc.font('NotoSans');
          }
        } catch (fontErr) {
          logger.warn('Failed to register custom font inside PDF generation', { error: fontErr.message });
        }

        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Title
        doc.fontSize(20).text('BÁO CÁO PHÂN BỔ CHI PHÍ', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Kỳ: ${period === 'week' ? 'Tuần này' : period === 'month' ? 'Tháng này' : 'Quý này'}`, { align: 'center' });
        doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, { align: 'center' });
        doc.moveDown(2);

        // Summary
        doc.fontSize(14).text('TỔNG QUAN', { underline: true });
        doc.moveDown();
        doc.fontSize(11).text(`Tổng chi phí: ${breakdown.total.toLocaleString('vi-VN')} VNĐ`);
        doc.text(`Biến động: ${breakdown.change}`);
        doc.moveDown(2);

        // Categories
        doc.fontSize(14).text('CHI TIẾT THEO DANH MỤC', { underline: true });
        doc.moveDown();
        
        breakdown.categories.forEach((category, index) => {
          doc.fontSize(11).text(
            `${index + 1}. ${category.name}: ${category.amount.toLocaleString('vi-VN')} VNĐ (${category.percentage}%)`,
            { indent: 20 }
          );
          doc.text(`   Số lượng: ${category.count} khoản chi`, { indent: 20 });
          doc.moveDown(0.5);
        });

        // Ownership breakdown
        if (breakdown.ownershipBreakdown && breakdown.ownershipBreakdown.length > 0) {
          doc.moveDown();
          doc.fontSize(14).text('PHÂN BỔ THEO THÀNH VIÊN', { underline: true });
          doc.moveDown();
          
          breakdown.ownershipBreakdown.forEach((owner, index) => {
            doc.fontSize(11).text(
              `${index + 1}. Thành viên ${owner.userId.substring(0, 8)}: ${owner.amount.toLocaleString('vi-VN')} VNĐ - ${owner.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}`,
              { indent: 20 }
            );
            doc.moveDown(0.5);
          });
        }

        doc.end();
      });
    } catch (error) {
      logger.error('CostService.exportCostBreakdownPDF - Error:', error);
      throw new AppError('Failed to export cost breakdown PDF', 500, 'EXPORT_PDF_ERROR');
    }
  }

  async exportExpenseTrackingExcel(groupId, year, userId) {
    try {
      const ExcelModule = await import('exceljs');
      const ExcelJS = ExcelModule.default || ExcelModule;
      const expenseData = await this.getExpenseTracking(groupId, year, userId);
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Theo dõi chi phí');

      // Title
      worksheet.mergeCells('A1:F1');
      worksheet.getCell('A1').value = `BÁO CÁO THEO DÕI CHI PHÍ NĂM ${year}`;
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

      // Summary
      worksheet.addRow([]);
      worksheet.addRow(['TỔNG QUAN']);
      worksheet.addRow(['Tổng chi phí:', `${expenseData.totalExpenses.toLocaleString('vi-VN')} VNĐ`]);
      worksheet.addRow(['Trung bình tháng:', `${expenseData.monthlyAverage.toLocaleString('vi-VN')} VNĐ`]);
      worksheet.addRow(['Tăng trưởng YoY:', `${expenseData.yoyGrowth}%`]);
      worksheet.addRow([]);

      // Category breakdown
      worksheet.addRow(['PHÂN LOẠI CHI PHÍ']);
      worksheet.addRow(['Danh mục', 'Số tiền (VNĐ)', 'Tỷ lệ (%)', 'Số lượng']);
      
      expenseData.categories.forEach(category => {
        worksheet.addRow([
          category.name,
          category.amount,
          category.percentage,
          category.count || 0
        ]);
      });

      worksheet.addRow([]);

      // Monthly data
      worksheet.addRow(['CHI PHÍ THEO THÁNG']);
      worksheet.addRow(['Tháng', 'Số tiền (VNĐ)']);
      
      expenseData.monthlyData.forEach(month => {
        worksheet.addRow([month.month, month.amount]);
      });

      // Styling
      worksheet.columns = [
        { key: 'A', width: 25 },
        { key: 'B', width: 20 },
        { key: 'C', width: 15 },
        { key: 'D', width: 15 },
        { key: 'E', width: 20 },
        { key: 'F', width: 20 }
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      logger.error('CostService.exportExpenseTrackingExcel - Error:', error);
      throw new AppError('Failed to export expense tracking Excel', 500, 'EXPORT_EXCEL_ERROR');
    }
  }

  async exportPaymentHistoryPDF(groupId, userId, filters) {
    try {
      const PDFModule = await import('pdfkit');
      const PDFDocument = PDFModule.default || PDFModule;
      const paymentData = await this.getPaymentHistory(groupId, userId, filters);
      
      // Probe for optional font
      let notoFontPath = null;
      try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        notoFontPath = path.resolve(__dirname, '../assets/fonts/NotoSans-Regular.ttf');
        if (!fs.existsSync(notoFontPath)) {
          logger.warn('NotoSans font not found at ' + notoFontPath + '. Vietnamese characters may not render correctly in PDFs.');
          notoFontPath = null;
        }
      } catch (fontErr) {
        logger.warn('Failed to probe custom font for PDF export', { error: fontErr.message });
        notoFontPath = null;
      }

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        try {
          if (notoFontPath) {
            doc.registerFont('NotoSans', notoFontPath);
            doc.font('NotoSans');
          }
        } catch (fontErr) {
          logger.warn('Failed to register custom font inside PDF generation', { error: fontErr.message });
        }
        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Title
        doc.fontSize(20).text('LỊCH SỬ THANH TOÁN', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, { align: 'center' });
        doc.moveDown(2);

        // Stats
        doc.fontSize(14).text('THỐNG KÊ', { underline: true });
        doc.moveDown();
        doc.fontSize(11).text(`Tổng đã thanh toán: ${paymentData.stats.totalPaid.toLocaleString('vi-VN')} VNĐ`);
        doc.text(`Đang chờ: ${paymentData.stats.pendingAmount.toLocaleString('vi-VN')} VNĐ`);
        doc.text(`Giao dịch thành công: ${paymentData.stats.completedPayments}`);
        doc.text(`Giao dịch thất bại: ${paymentData.stats.failedPayments}`);
        doc.moveDown(2);

        // Payments
        doc.fontSize(14).text('CHI TIẾT GIAO DỊCH', { underline: true });
        doc.moveDown();
        
        paymentData.payments.forEach((payment, index) => {
          doc.fontSize(11).text(`${index + 1}. ${payment.description}`);
          doc.fontSize(9).text(`   Ngày: ${payment.date}`, { indent: 20 });
          doc.text(`   Số tiền: ${payment.amount.toLocaleString('vi-VN')} VNĐ`, { indent: 20 });
          doc.text(`   Phương thức: ${payment.method}`, { indent: 20 });
          doc.text(`   Trạng thái: ${payment.status}`, { indent: 20 });
          doc.moveDown(0.5);
        });

        doc.end();
      });
    } catch (error) {
      logger.error('CostService.exportPaymentHistoryPDF - Error:', error);
      throw new AppError('Failed to export payment history PDF', 500, 'EXPORT_PDF_ERROR');
    }
  }
}

export default new CostService();