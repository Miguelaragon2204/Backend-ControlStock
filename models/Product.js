const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0, 
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  lastStockCheck: {
    type: Date,
    default: Date.now,
  },
  lastModifiedBy: {
    type: String, // Puede ser el nombre o el ID del usuario
    default: "Sistema", // Valor por defecto si no se proporciona
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', ProductSchema);
