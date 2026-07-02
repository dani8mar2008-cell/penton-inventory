const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  categoria: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

module.exports = Product;