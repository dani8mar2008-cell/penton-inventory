const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const router = express.Router();

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Obtener todos los productos públicos
router.get('/', async (req, res) => {
  try {
    const productos = await Product.find({ activo: true })
      .select('nombre descripcion precio categoria imagen')
      .populate('propietario', 'nombre');
    
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener productos del usuario autenticado
router.get('/mis-productos', verifyToken, async (req, res) => {
  try {
    const productos = await Product.find({ propietario: req.user.id });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear producto
router.post('/', verifyToken, async (req, res) => {
  try {
    const { nombre, descripcion, precio, cantidad, categoria } = req.body;
    
    if (!nombre || !descripcion || !precio) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    const nuevoProducto = new Product({
      nombre,
      descripcion,
      precio,
      cantidad: cantidad || 0,
      categoria: categoria || 'General',
      propietario: req.user.id,
    });
    
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar producto
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    if (producto.propietario.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { nombre, descripcion, precio, cantidad, categoria, activo } = req.body;
    
    if (nombre) producto.nombre = nombre;
    if (descripcion) producto.descripcion = descripcion;
    if (precio !== undefined) producto.precio = precio;
    if (cantidad !== undefined) producto.cantidad = cantidad;
    if (categoria) producto.categoria = categoria;
    if (activo !== undefined) producto.activo = activo;
    
    producto.updatedAt = Date.now();
    await producto.save();
    
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar producto
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    if (producto.propietario.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
