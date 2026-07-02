const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./database');

// Importar modelos
const User = require('./models/User');
const Product = require('./models/Product');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sincronizar base de datos
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Base de datos sincronizada');
}).catch(err => console.error('❌ Error sincronizando BD:', err));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ mensaje: 'Backend funcionando correctamente' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
});
