const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Generar Token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Registrar nuevo usuario
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "employee",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Datos de usuario inválidos" });
    }
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({
      message: "Error en el registro",
      error: error.message,
    });
  }
};

// Iniciar sesión
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Tu cuenta está bloqueada. Contacta con el administrador." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};


// Obtener usuarios (solo para admin)
const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Acceso no autorizado" });
    }

    const users = await User.find().select("-password"); // No incluir la contraseña
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  res.json(req.user); // Devuelve la información del usuario autenticado
};

// Eliminar usuario (solo para admin)
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Acceso no autorizado" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Eliminar el usuario
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
};

const toggleSuspendUser = async (req, res) => {
  try {
    // Verificar si el usuario existe
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el usuario es un administrador
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden suspender usuarios.' });
    }

    // Cambiar el estado de suspensión
    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      message: `Usuario ${user.isSuspended ? "suspendido" : "activado"} correctamente`,
      user,
    });
  } catch (error) {
    console.error("Error al suspender usuario:", error.message);
    res.status(500).json({
      message: "Error al actualizar el estado del usuario",
      error: error.message,
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUsers,
  deleteUser,
  getUserProfile,
  toggleSuspendUser,
};
