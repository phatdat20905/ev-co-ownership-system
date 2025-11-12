// src/seeders/demo-contract-templates.js
export default {
  async up(queryInterface, Sequelize) {
    const templates = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        template_name: 'Hợp đồng đồng sở hữu xe điện cơ bản',
        template_type: 'co_ownership',
        content: `
<h1>HỢP ĐỒNG ĐỒNG SỞ HỮU XE ĐIỆN</h1>

<p><strong>Số:</strong> {{contract_number}}</p>
<p><strong>Ngày có hiệu lực:</strong> {{effective_date}}</p>

<h2>ĐIỀU 1: CÁC BÊN THAM GIA</h2>
<p>Các bên tham gia hợp đồng đồng sở hữu xe điện:</p>
<ul>
{{#each parties}}
<li><strong>{{full_name}}</strong> - Vai trò: {{role}} - Tỷ lệ sở hữu: {{ownership_percentage}}%</li>
{{/each}}
</ul>

<h2>ĐIỀU 2: THÔNG TIN XE</h2>
<p>Biển số: {{vehicle_license_plate}}</p>
<p>Model: {{vehicle_model}}</p>
<p>Năm sản xuất: {{vehicle_year}}</p>

<h2>ĐIỀU 3: QUYỀN VÀ NGHĨA VỤ</h2>
<p>3.1. Quyền sử dụng xe được phân bổ theo tỷ lệ sở hữu.</p>
<p>3.2. Chi phí bảo trì, bảo hiểm, sạc điện được chia theo tỷ lệ sở hữu.</p>
<p>3.3. Mọi quyết định quan trọng liên quan đến xe phải được sự đồng thuận của tất cả các bên.</p>

<h2>ĐIỀU 4: THỜI HẠN</h2>
<p>Hợp đồng có hiệu lực từ ngày {{effective_date}} đến ngày {{expiry_date}}.</p>

<h2>ĐIỀU 5: GIẢI QUYẾT TRANH CHẤP</h2>
<p>Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng hoặc theo quy định của pháp luật.</p>
        `,
        variables: [
          'contract_number',
          'effective_date',
          'expiry_date',
          'parties',
          'vehicle_license_plate',
          'vehicle_model',
          'vehicle_year'
        ],
        is_active: true,
        version: '1.0',
        created_by: '00000000-0000-0000-0000-000000000000',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        template_name: 'Phụ lục hợp đồng đồng sở hữu',
        template_type: 'amendment',
        content: `
<h1>PHỤ LỤC HỢP ĐỒNG ĐỒNG SỞ HỮU XE ĐIỆN</h1>

<p><strong>Số phụ lục:</strong> {{amendment_number}}</p>
<p><strong>Ngày có hiệu lực:</strong> {{effective_date}}</p>
<p><strong>Hợp đồng gốc:</strong> {{original_contract_number}}</p>

<h2>NỘI DUNG SỬA ĐỔI</h2>
<p>{{amendment_reason}}</p>

<h2>CHI TIẾT THAY ĐỔI</h2>
<p>{{changes_summary}}</p>

<h2>CÁC BÊN ĐỒNG Ý</h2>
<ul>
{{#each parties}}
<li><strong>{{full_name}}</strong> - Vai trò: {{role}}</li>
{{/each}}
</ul>
        `,
        variables: [
          'amendment_number',
          'effective_date',
          'original_contract_number',
          'amendment_reason',
          'changes_summary',
          'parties'
        ],
        is_active: true,
        version: '1.0',
        created_by: '00000000-0000-0000-0000-000000000000',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // ✅ stringify biến JSON trước khi insert
    await queryInterface.bulkInsert(
      'contract_templates',
      templates.map(t => ({
        ...t,
        variables: JSON.stringify(t.variables)
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('contract_templates', null, {});
  }
};
