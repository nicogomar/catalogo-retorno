import { Request, Response } from 'express';
import productoService from '../services/producto.service';
import { NuevoProducto, ActualizarProducto, ProductoFilters } from '../types';

/**
 * Controller for handling Producto HTTP requests
 */
export class ProductoController {
  /**
   * GET /api/productos
   * Get all productos with optional filters and pagination
   */
  async getProductos(req: Request, res: Response): Promise<void> {
    try {
      const {
        nombre,
        precioMin,
        precioMax,
        orderBy,
        orderDirection,
        page,
        limit
      } = req.query;

      const filters: ProductoFilters = {
        nombre: nombre as string,
        precioMin: precioMin ? parseFloat(precioMin as string) : undefined,
        precioMax: precioMax ? parseFloat(precioMax as string) : undefined,
        orderBy: orderBy as any,
        orderDirection: orderDirection as any
      };

      const pagination = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      };

      const productos = await productoService.getProductos(filters, pagination);

      // If pagination is requested, also get total count
      if (pagination.page && pagination.limit) {
        const total = await productoService.getProductosCount(filters);
        const totalPages = Math.ceil(total / pagination.limit);

        res.json({
          success: true,
          data: productos,
          meta: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages
          }
        });
      } else {
        res.json({
          success: true,
          data: productos
        });
      }
    } catch (error: any) {
      console.error('Error in getProductos:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error fetching productos'
      });
    }
  }

  /**
   * GET /api/productos/:id
   * Get a single producto by ID
   */
  async getProductoById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid producto ID'
        });
        return;
      }

      const producto = await productoService.getProductoById(id);

      if (!producto) {
        res.status(404).json({
          success: false,
          error: 'Producto not found'
        });
        return;
      }

      res.json({
        success: true,
        data: producto
      });
    } catch (error: any) {
      console.error('Error in getProductoById:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error fetching producto'
      });
    }
  }

  /**
   * POST /api/productos
   * Create a new producto
   */
  async createProducto(req: Request, res: Response): Promise<void> {
    try {
      const productoData: NuevoProducto = req.body;

      // Validate required fields
      if (!productoData.nombre || productoData.precio === undefined) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: nombre and precio are required'
        });
        return;
      }

      const newProducto = await productoService.createProducto(productoData);

      res.status(201).json({
        success: true,
        data: newProducto,
        message: 'Producto created successfully'
      });
    } catch (error: any) {
      console.error('Error in createProducto:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error creating producto'
      });
    }
  }

  /**
   * PUT /api/productos/:id
   * Update an existing producto
   */
  async updateProducto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid producto ID'
        });
        return;
      }

      const productoData: ActualizarProducto = req.body;

      const updatedProducto = await productoService.updateProducto(id, productoData);

      if (!updatedProducto) {
        res.status(404).json({
          success: false,
          error: 'Producto not found'
        });
        return;
      }

      res.json({
        success: true,
        data: updatedProducto,
        message: 'Producto updated successfully'
      });
    } catch (error: any) {
      console.error('Error in updateProducto:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error updating producto'
      });
    }
  }

  /**
   * DELETE /api/productos/:id
   * Delete a producto
   */
  async deleteProducto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid producto ID'
        });
        return;
      }

      await productoService.deleteProducto(id);

      res.json({
        success: true,
        message: 'Producto deleted successfully'
      });
    } catch (error: any) {
      console.error('Error in deleteProducto:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error deleting producto'
      });
    }
  }

  /**
   * GET /api/productos/search/:nombre
   * Search productos by name
   */
  async searchByNombre(req: Request, res: Response): Promise<void> {
    try {
      const nombre = req.params.nombre;

      if (!nombre) {
        res.status(400).json({
          success: false,
          error: 'Search term is required'
        });
        return;
      }

      const productos = await productoService.searchByNombre(nombre);

      res.json({
        success: true,
        data: productos
      });
    } catch (error: any) {
      console.error('Error in searchByNombre:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error searching productos'
      });
    }
  }

  /**
   * GET /api/productos/latest/:limit
   * Get latest productos
   */
  async getLatest(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.params.limit ? parseInt(req.params.limit) : 10;

      if (isNaN(limit) || limit < 1) {
        res.status(400).json({
          success: false,
          error: 'Invalid limit parameter'
        });
        return;
      }

      const productos = await productoService.getLatestProductos(limit);

      res.json({
        success: true,
        data: productos
      });
    } catch (error: any) {
      console.error('Error in getLatest:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error fetching latest productos'
      });
    }
  }

  /**
   * GET /api/productos/order-by-precio/:direction
   * Get productos ordered by price
   */
  async getOrderByPrecio(req: Request, res: Response): Promise<void> {
    try {
      const direction = req.params.direction;
      const ascending = direction === 'asc';

      const productos = await productoService.getProductosOrderByPrecio(ascending);

      res.json({
        success: true,
        data: productos
      });
    } catch (error: any) {
      console.error('Error in getOrderByPrecio:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error fetching productos ordered by precio'
      });
    }
  }

  /**
   * GET /api/productos/ordered-by-categoria-nombre
   * Get productos ordered by categoria and then by nombre
   */
  async getOrderedByCategoriaAndNombre(_req: Request, res: Response): Promise<void> {
    try {
      const productos = await productoService.getProductosOrderedByCategoriaAndNombre();

      res.json({
        success: true,
        data: productos
      });
    } catch (error: any) {
      console.error('Error in getOrderedByCategoriaAndNombre:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error fetching productos ordered by categoria and nombre'
      });
    }
  }
}

export default new ProductoController();
