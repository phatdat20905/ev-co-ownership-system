// src/models/index.js
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Sequelize from 'sequelize';
import { sequelize } from '../config/database.js';

// Định nghĩa __dirname trong môi trường ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = {};

// Đọc tất cả file trong thư mục models
const files = await readdir(__dirname);
const modelFiles = files.filter(
  (file) =>
    file.indexOf('.') !== 0 && // bỏ qua file ẩn (.gitkeep, ...)
    file !== 'index.js' && // bỏ qua chính file này
    file.slice(-3) === '.js' // chỉ lấy file .js
);

// Import động các model
for (const file of modelFiles) {
  const filePath = join(__dirname, file);
  const modelModule = await import(pathToFileURL(filePath).href); // ✅ chuyển sang file:// URL
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// Thiết lập các mối quan hệ (nếu có)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Xuất Sequelize instance và models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
