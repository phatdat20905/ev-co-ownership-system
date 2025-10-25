// src/models/index.js
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Sequelize from 'sequelize';
import { sequelize } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = {};

// 🔹 Load tất cả model trong thư mục
const files = await readdir(__dirname);
const modelFiles = files.filter(
  (file) =>
    file.indexOf('.') !== 0 &&
    file !== 'index.js' &&
    file.endsWith('.js')
);

for (const file of modelFiles) {
  const filePath = join(__dirname, file);
  const modelModule = await import(pathToFileURL(filePath).href);
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// 🔹 Gọi associate() cho mỗi model (nếu có)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
