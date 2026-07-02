const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.db'),
  logging: false
});

sequelize.authenticate()
  .then(() => console.log('✅ Conectado a SQLite'))
  .catch(err => console.error('❌ Error conectando a SQLite:', err));

module.exports = sequelize;
