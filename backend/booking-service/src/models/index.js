// src/models/index.js
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Sequelize from 'sequelize';
import { sequelize } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = {};

const files = await readdir(__dirname);
const modelFiles = files.filter(
  (file) =>
    file.indexOf('.') !== 0 &&
    file !== 'index.js' &&
    file.slice(-3) === '.js'
);

for (const file of modelFiles) {
  const filePath = join(__dirname, file);
  const modelModule = await import(pathToFileURL(filePath).href);
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// Setup associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Manual associations để đảm bảo tất cả relationships được thiết lập
if (db.Vehicle && db.Booking) {
  db.Vehicle.hasMany(db.Booking, { foreignKey: 'vehicleId', as: 'bookings' });
  db.Booking.belongsTo(db.Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
}

if (db.Booking && db.CheckInOutLog) {
  db.Booking.hasMany(db.CheckInOutLog, { foreignKey: 'bookingId', as: 'checkLogs' });
  db.CheckInOutLog.belongsTo(db.Booking, { foreignKey: 'bookingId', as: 'booking' });
}

if (db.Booking && db.BookingConflict) {
  db.Booking.hasMany(db.BookingConflict, { foreignKey: 'bookingId_1', as: 'conflictsAsBooking1' });
  db.Booking.hasMany(db.BookingConflict, { foreignKey: 'bookingId_2', as: 'conflictsAsBooking2' });
  db.BookingConflict.belongsTo(db.Booking, { foreignKey: 'bookingId_1', as: 'booking1' });
  db.BookingConflict.belongsTo(db.Booking, { foreignKey: 'bookingId_2', as: 'booking2' });
}

if (db.Vehicle && db.CalendarCache) {
  db.Vehicle.hasMany(db.CalendarCache, { foreignKey: 'vehicleId', as: 'calendarCache' });
  db.CalendarCache.belongsTo(db.Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;