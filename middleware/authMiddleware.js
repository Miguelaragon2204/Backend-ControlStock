const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];  // Obtener token

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener el usuario del token y continuar
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error('Error de autenticación:', error);
      res.status(401).json({ message: 'No autorizado, token inválido o expirado' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, token no proporcionado' });
  }
};


const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Acceso denegado, solo administradores pueden acceder a esta ruta' });
  }
};

const empleado = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'employee')) {
    next();
  } else {
    return res.status(403).json({ message: 'Acceso denegado, solo administradores o empleados pueden acceder a esta ruta' });
  }
};

module.exports = { protect, admin, empleado };
