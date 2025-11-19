import express from 'express';
import { adminAuth, requirePermission } from '../middleware/adminAuth.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Financial overview
router.get('/financial/overview', adminAuth, requirePermission('reports_view'), async (req, res, next) => {
  try {
    const period = req.query.period || 'month';
    // Minimal placeholder response until full reporting service is implemented
    const data = {
      revenue: { current: 125000000, previous: 110000000, growth: 13.6 },
      expenses: { current: 54000000, previous: 50000000, growth: 8 },
      profit: { current: 71000000, previous: 60000000, growth: 18.3 },
      utilization: { current: 72, previous: 68, growth: 5.9 },
      period
    };
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Revenue report
router.get('/financial/revenue', adminAuth, requirePermission('reports_view'), async (req, res, next) => {
  try {
    const period = req.query.period || 'month';
    const breakdown = [
      { label: 'Subscription', amount: 45000000 },
      { label: 'Usage', amount: 32000000 },
      { label: 'Maintenance', amount: 18000000 },
      { label: 'Insurance', amount: 12000000 },
      { label: 'Other', amount: 8000000 }
    ];
    res.status(200).json({ success: true, data: { period, breakdown } });
  } catch (err) {
    next(err);
  }
});

// Expense report
router.get('/financial/expenses', adminAuth, requirePermission('reports_view'), async (req, res, next) => {
  try {
    const period = req.query.period || 'month';
    const breakdown = [
      { label: 'Operational', amount: 22000000 },
      { label: 'Repairs', amount: 14000000 },
      { label: 'Staff', amount: 9000000 },
      { label: 'Utilities', amount: 3000000 }
    ];
    res.status(200).json({ success: true, data: { period, breakdown } });
  } catch (err) {
    next(err);
  }
});

export default router;

// Export endpoint - generate a simple Excel report for the requested type
// GET /admin/reports/financial/export/:type
router.get('/financial/export/:type', adminAuth, requirePermission('reports_view'), async (req, res, next) => {
  try {
    const { type } = req.params;
    const period = req.query.period || 'month';

    const format = (req.query.format || 'xlsx').toLowerCase();

    // Helper to get sample rows (replace with real aggregation calls later)
    const getRowsForType = (t) => {
      if (t === 'revenue') {
        return [
          ['Subscription', 45000000],
          ['Usage', 32000000],
          ['Maintenance', 18000000],
          ['Insurance', 12000000],
          ['Other', 8000000]
        ];
      }
      if (t === 'expenses') {
        return [
          ['Operational', 22000000],
          ['Repairs', 14000000],
          ['Staff', 9000000],
          ['Utilities', 3000000]
        ];
      }
      // overview
      return [
        ['Revenue', 125000000, 110000000, '13.6%'],
        ['Expenses', 54000000, 50000000, '8%'],
        ['Profit', 71000000, 60000000, '18.3%'],
        ['Utilization (%)', 72, 68, '5.9%']
      ];
    };

    // PDF export
    if (format === 'pdf') {
      // Build a PDF using PDFKit and the bundled NotoSans font
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      const endPromise = new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
      });

      const fontsDir = path.resolve(process.cwd(), 'src', 'assets', 'fonts');
      const notoPath = path.join(fontsDir, 'NotoSans-Regular.ttf');
      if (fs.existsSync(notoPath)) {
        try {
          doc.registerFont('NotoSans', notoPath);
          doc.font('NotoSans');
        } catch (e) {
          // fallback to default if register fails
          doc.font('Helvetica');
        }
      } else {
        doc.font('Helvetica');
      }

      // Title
      doc.fontSize(18).text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Period: ${period}`, { align: 'center' });
      doc.moveDown(1);

      const rows = getRowsForType(type);

      if (type === 'revenue' || type === 'expenses') {
        // Table header
        doc.fontSize(12).text('Category', 80, doc.y, { continued: true });
        doc.text('Amount', 350);
        doc.moveDown(0.5);
        rows.forEach((r) => {
          doc.fontSize(10).text(String(r[0]), 80, doc.y, { continued: true });
          doc.text(new Intl.NumberFormat().format(r[1]), 350);
        });
      } else {
        // overview
        doc.fontSize(12).text('Metric', 60, doc.y, { continued: true });
        doc.text('Current', 220, doc.y, { continued: true });
        doc.text('Previous', 320, doc.y, { continued: true });
        doc.text('Growth', 420);
        doc.moveDown(0.5);
        rows.forEach((r) => {
          doc.fontSize(10).text(String(r[0]), 60, doc.y, { continued: true });
          doc.text(String(r[1]), 220, doc.y, { continued: true });
          doc.text(String(r[2]), 320, doc.y, { continued: true });
          doc.text(String(r[3]), 420);
        });
      }

      doc.end();
      const pdfBuffer = await endPromise;

      const filename = `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/pdf');
      return res.status(200).send(pdfBuffer);
    }

    // Default: Excel export (xlsx)
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    if (type === 'revenue') {
      sheet.addRow(['Category', 'Amount']);
      getRowsForType('revenue').forEach(r => sheet.addRow(r));
    } else if (type === 'expenses') {
      sheet.addRow(['Category', 'Amount']);
      getRowsForType('expenses').forEach(r => sheet.addRow(r));
    } else {
      sheet.addRow(['Metric', 'Current', 'Previous', 'Growth']);
      getRowsForType('overview').forEach(r => sheet.addRow(r));
    }

    // Format header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    const filename = `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.status(200).send(buffer);
  } catch (err) {
    next(err);
  }
});
