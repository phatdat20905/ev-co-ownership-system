import PDFDocument from 'pdfkit';
import { logger, AppError } from '@ev-coownership/shared';

export class PDFGenerator {
  static async generateContractPDF(contractData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Add header
        this.addHeader(doc, contractData);
        
        // Add contract content
        this.addContractContent(doc, contractData);
        
        // Add signatures section
        this.addSignaturesSection(doc, contractData);

        doc.end();

        logger.debug('Contract PDF generated successfully', { 
          contractId: contractData.id,
          title: contractData.title 
        });
      } catch (error) {
        logger.error('PDF generation failed', { error: error.message });
        reject(new AppError('Failed to generate PDF', 500, 'PDF_GENERATION_ERROR'));
      }
    });
  }

  static addHeader(doc, contractData) {
    // Title
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text(contractData.title, { align: 'center' })
       .moveDown(0.5);

    // Contract number
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Số hợp đồng: ${contractData.contract_number}`, { align: 'center' })
       .moveDown(0.5);

    // Effective date
    if (contractData.effective_date) {
      doc.text(`Ngày có hiệu lực: ${new Date(contractData.effective_date).toLocaleDateString('vi-VN')}`, { align: 'center' })
         .moveDown(1);
    }

    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke()
       .moveDown(1);
  }

  static addContractContent(doc, contractData) {
    doc.fontSize(11)
       .font('Helvetica')
       .text(this.stripHTML(contractData.content), {
         align: 'justify',
         lineGap: 4
       })
       .moveDown(2);
  }

  static addSignaturesSection(doc, contractData) {
    const startY = doc.y;
    const colWidth = 160;
    const parties = contractData.parties || [];

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('CHỮ KÝ CÁC BÊN', { align: 'center' })
       .moveDown(1);

    parties.forEach((party, index) => {
      const x = 50 + (index % 3) * colWidth;
      const y = doc.y;

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(party.user?.full_name || `Bên ${index + 1}`, x, y)
         .font('Helvetica')
         .text(`Vai trò: ${this.translateRole(party.party_role)}`, x, y + 15)
         .text(`Tỷ lệ sở hữu: ${party.ownership_percentage || 0}%`, x, y + 30);

      if (party.has_signed) {
        doc.text(`Đã ký: ${new Date(party.signed_at).toLocaleDateString('vi-VN')}`, x, y + 45)
           .text('✓', x + 120, y + 10);
      } else {
        doc.text('Chưa ký', x, y + 45);
      }

      // Signature line
      doc.moveTo(x, y + 65)
         .lineTo(x + 120, y + 65)
         .stroke();

      // Move to next row if needed
      if ((index + 1) % 3 === 0) {
        doc.moveDown(3);
      }
    });

    // Ensure we have enough space
    if (doc.y > 700) {
      doc.addPage();
    }
  }

  static stripHTML(html) {
    return html.replace(/<[^>]*>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");
  }

  static translateRole(role) {
    const translations = {
      'owner': 'Chủ sở hữu',
      'co_owner': 'Đồng sở hữu',
      'witness': 'Nhân chứng',
      'legal_representative': 'Đại diện pháp lý'
    };
    return translations[role] || role;
  }
}

export default PDFGenerator;