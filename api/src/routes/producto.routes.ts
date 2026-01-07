import { Router } from 'express';
import productoController from '../controllers/producto.controller';

const router = Router();

/**
 * @route   GET /api/productos
 * @desc    Get all productos with optional filters and pagination
 * @query   nombre, precioMin, precioMax, orderBy, orderDirection, page, limit
 * @access  Public
 */
router.get('/', (req, res) => productoController.getProductos(req, res));

/**
 * @route   GET /api/productos/latest/:limit?
 * @desc    Get latest productos
 * @param   limit - Number of productos to return (default: 10)
 * @access  Public
 */
router.get('/latest/:limit?', (req, res) => productoController.getLatest(req, res));

/**
 * @route   GET /api/productos/order-by-precio/:direction
 * @desc    Get productos ordered by price
 * @param   direction - 'asc' or 'desc'
 * @access  Public
 */
router.get('/order-by-precio/:direction', (req, res) => productoController.getOrderByPrecio(req, res));

/**
 * @route   GET /api/productos/search/:nombre
 * @desc    Search productos by name
 * @param   nombre - Search term
 * @access  Public
 */
router.get('/search/:nombre', (req, res) => productoController.searchByNombre(req, res));

/**
 * @route   GET /api/productos/ordered-by-categoria-nombre
 * @desc    Get productos ordered by categoria and then by nombre
 * @access  Public
 */
router.get('/ordered-by-categoria-nombre', (req, res) => productoController.getOrderedByCategoriaAndNombre(req, res));

/**
 * @route   GET /api/productos/:id
 * @desc    Get a single producto by ID
 * @param   id - Producto ID
 * @access  Public
 */
router.get('/:id', (req, res) => productoController.getProductoById(req, res));

/**
 * @route   POST /api/productos
 * @desc    Create a new producto
 * @body    { nombre, precio, peso?, img_url?, descripcion? }
 * @access  Public (should be protected in production)
 */
router.post('/', (req, res) => productoController.createProducto(req, res));

/**
 * @route   PUT /api/productos/:id
 * @desc    Update an existing producto
 * @param   id - Producto ID
 * @body    { nombre?, precio?, peso?, img_url?, descripcion? }
 * @access  Public (should be protected in production)
 */
router.put('/:id', (req, res) => productoController.updateProducto(req, res));

/**
 * @route   DELETE /api/productos/:id
 * @desc    Delete a producto
 * @param   id - Producto ID
 * @access  Public (should be protected in production)
 */
router.delete('/:id', (req, res) => productoController.deleteProducto(req, res));

export default router;
