import { Router } from 'express';
import categoriaController from '../controllers/categoria.controller';

const router = Router();

/**
 * @route   GET /api/categorias
 * @desc    Get all categorias with optional filters and pagination
 * @query   nombre, orderBy, orderDirection, page, limit
 * @access  Public
 */
router.get('/', (req, res) => categoriaController.getCategorias(req, res));

/**
 * @route   GET /api/categorias/latest/:limit?
 * @desc    Get latest categorias
 * @param   limit - Number of categorias to return (default: 10)
 * @access  Public
 */
router.get('/latest/:limit?', (req, res) => categoriaController.getLatest(req, res));

/**
 * @route   GET /api/categorias/order-by-nombre/:direction
 * @desc    Get categorias ordered by name
 * @param   direction - 'asc' or 'desc'
 * @access  Public
 */
router.get('/order-by-nombre/:direction', (req, res) => categoriaController.getOrderByNombre(req, res));

/**
 * @route   GET /api/categorias/search/:nombre
 * @desc    Search categorias by name
 * @param   nombre - Search term
 * @access  Public
 */
router.get('/search/:nombre', (req, res) => categoriaController.searchByNombre(req, res));

/**
 * @route   GET /api/categorias/count
 * @desc    Get total count of categorias
 * @query   nombre - Optional filter by name
 * @access  Public
 */
router.get('/count', (req, res) => categoriaController.getCategoriasCount(req, res));

/**
 * @route   GET /api/categorias/:id
 * @desc    Get a single categoria by ID
 * @param   id - Categoria ID
 * @access  Public
 */
router.get('/:id', (req, res) => categoriaController.getCategoriaById(req, res));

/**
 * @route   POST /api/categorias
 * @desc    Create a new categoria
 * @body    { nombre }
 * @access  Public (should be protected in production)
 */
router.post('/', (req, res) => categoriaController.createCategoria(req, res));

/**
 * @route   PUT /api/categorias/:id
 * @desc    Update an existing categoria
 * @param   id - Categoria ID
 * @body    { nombre? }
 * @access  Public (should be protected in production)
 */
router.put('/:id', (req, res) => categoriaController.updateCategoria(req, res));

/**
 * @route   DELETE /api/categorias/:id
 * @desc    Delete a categoria
 * @param   id - Categoria ID
 * @access  Public (should be protected in production)
 */
router.delete('/:id', (req, res) => categoriaController.deleteCategoria(req, res));

export default router;
