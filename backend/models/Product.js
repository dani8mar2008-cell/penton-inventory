const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
  },
  precio: {
    type: Number,
    required: true,
    min: 0,
  },
  cantidad: {
    type: Number,
    default: 0,
    min: 0,
  },
  imagen: {
    type: String,
    default: null,
  },
  categoria: {
    type: String,
    default: 'General',
  },
  activo: {
    type: Boolean,
    default: true,
  },
  propietario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
