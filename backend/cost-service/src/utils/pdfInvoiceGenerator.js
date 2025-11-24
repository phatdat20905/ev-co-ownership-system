// src/utils/pdfInvoiceGenerator.js
import { logger } from '@ev-coownership/shared';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFInvoiceGenerator {
  async generate(invoice, costs) {
    try {
      // Ensure output folder exists. INVOICE_PDF_PATH is a URL path like '/data/invoices'
      const urlPath = process.env.INVOICE_PDF_PATH || '/data/invoices';
      const relFolder = urlPath.replace(/^\//, ''); // e.g. 'data/invoices'
      const outDir = path.join(__dirname, '..', relFolder);
      await fs.promises.mkdir(outDir, { recursive: true });

      const fileName = `invoice_${invoice.invoiceNumber}.pdf`;
      const filePath = path.join(outDir, fileName);

      // Create a minimal placeholder PDF if not exists. In production replace with real PDF generation.
      if (!fs.existsSync(filePath)) {
        const placeholder = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \ntrailer\n<< /Root 1 0 R >>\nstartxref\n100\n%%EOF');
        await fs.promises.writeFile(filePath, placeholder);
      }

      // Return a gateway-routable URL: prefix with the service mount so gateway proxies correctly
      const pdfUrl = `/costs${urlPath}/` + fileName; // e.g. /costs/data/invoices/invoice_INV-2025-11-001.pdf

      logger.info('PDF invoice generated', {
        invoiceId: invoice.id,
        pdfUrl,
        filePath
      });

      return { pdfUrl, filePath, fileName };
    } catch (error) {
      logger.error('PDFInvoiceGenerator.generate - Error:', error);
      throw new Error('Failed to generate PDF invoice');
    }
  }

  async generateFromTemplate(invoiceData, templateName = 'default') {
    return this.generate(invoiceData);
  }
}

export default new PDFInvoiceGenerator();