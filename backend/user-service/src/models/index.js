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

// Manual associations
db.CoOwnershipGroup.hasMany(db.GroupMember, { 
  foreignKey: 'groupId', 
  as: 'members' 
});
db.GroupMember.belongsTo(db.CoOwnershipGroup, { 
  foreignKey: 'groupId', 
  as: 'group' 
});

db.CoOwnershipGroup.hasMany(db.GroupFundTransaction, { 
  foreignKey: 'groupId', 
  as: 'fundTransactions' 
});
db.GroupFundTransaction.belongsTo(db.CoOwnershipGroup, { 
  foreignKey: 'groupId', 
  as: 'group' 
});

db.CoOwnershipGroup.hasMany(db.GroupVote, { 
  foreignKey: 'groupId', 
  as: 'votes' 
});
db.GroupVote.belongsTo(db.CoOwnershipGroup, { 
  foreignKey: 'groupId', 
  as: 'group' 
});

db.GroupVote.hasMany(db.VoteOption, { 
  foreignKey: 'voteId', 
  as: 'options' 
});
db.VoteOption.belongsTo(db.GroupVote, { 
  foreignKey: 'voteId', 
  as: 'vote' 
});

db.GroupVote.hasMany(db.UserVote, { 
  foreignKey: 'voteId', 
  as: 'userVotes' 
});
db.UserVote.belongsTo(db.GroupVote, { 
  foreignKey: 'voteId', 
  as: 'vote' 
});
db.UserVote.belongsTo(db.VoteOption, { 
  foreignKey: 'optionId', 
  as: 'selectedOption' 
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;