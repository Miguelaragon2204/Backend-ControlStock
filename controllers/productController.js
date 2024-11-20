const Product = require("../models/Product");
const createProduct = async (req, res) => {
  try {
    const { name, stock, description, category, lastModifiedBy } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ message: "Nombre, descripción y categoría son requeridos." });
    }

    const product = await Product.create({
      name,
      stock,
      description,
      category,
      lastModifiedBy, // Este campo debería recibir correctamente el nombre del usuario
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error creando el producto", error: error.message });
  }
};
const getProducts = async (req, res) => {
  try {
    let {
      name,
      minStock,
      maxStock,
      category,
      page = 1,
      limit = 10,
    } = req.query;

    // Validar que page y limit sean números
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) {
      return res
        .status(400)
        .json({ message: "El número de página debe ser un número positivo." });
    }
    if (isNaN(limit) || limit < 1) {
      return res
        .status(400)
        .json({ message: "El límite debe ser un número positivo." });
    }

    const query = {};
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }
    if (minStock) {
      query.stock = { $gte: minStock };
    }
    if (maxStock) {
      query.stock = { $lte: maxStock };
    }
    if (category) {
      query.category = category; // Asegúrate de que el modelo de producto tenga un campo de categoría
    }

    const products = await Product.find(query)
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await Product.countDocuments(query);
    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error obteniendo productos", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, stock, description, category, lastModifiedBy } = req.body;

    console.log("Modificado por:", lastModifiedBy); // Esto te permitirá ver si el valor es correcto

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        stock,
        description,
        category,
        lastStockCheck: Date.now(),
        lastModifiedBy, // Asegúrate de que el nombre del usuario se guarde aquí
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error actualizando el producto",
        error: error.message,
      });
  }
};

// Eliminar un producto

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Usar findByIdAndDelete para eliminar el producto
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error eliminando el producto", error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
