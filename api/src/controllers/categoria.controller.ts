import { Request, Response } from 'express';
import categoriaService from '../services/categoria.service';
import { NuevaCategoria, ActualizarCategoria, CategoriaFilters } from '../types';

/**
 * Controller for handling Categoria HTTP requests
 */
export class CategoriaController {
  /**
   * GET /api/categorias
   * Get all categorias with optional filters and pagination
   */
  async getCategorias(req: Request, res: Response): Promise<void> {
    try {
      const {
        nombre,
        orderBy,
        orderDirection,
        page,
        limit
      } = req.query;

      const filters: CategoriaFilters = {
        nombre: nombre as string,
        orderBy: orderBy as any,
        orderDirection: orderDirection as any
      };

      const pagination = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      };

      const categorias = await categoriaService.getCategorias(filters, pagination);

      // If pagination is requested, also get total count
      if (pagination.page && pagination.limit) {
        const total = await categoriaService.getCategoriasCount(filters);
        const totalPages = Math.ceil(total / pagination.limit);

        res.json({
          success: true,
          data: categorias,
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
          data: categorias
        });
      }
    } catch (error: any) {
      console.error('Error in getCategorias:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error fetching categorias'
      });
    }
  }

  /**
   * GET /api/categorias/:id
   * Get a single categoria by ID
   */
  async getCategoriaById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid categoria ID'
        });
        return;
      }

      const categoria = await categoriaService.getCategoriaById(id);

      if (!categoria) {
        res.status(404).json({
          success: false,
          error: 'Categoria not found'
        });
        return;
      }

      res.json({
        success: true,
        data: categoria
      });
    } catch (error: any) {
      console.error('Error in getCategoriaById:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error fetching categoria'
      });
    }
  }

  /**
   * POST /api/categorias
   * Create a new categoria
   */
  async createCategoria(req: Request, res: Response): Promise<void> {
    try {
      const categoriaData: NuevaCategoria = req.body;

      // Validate required fields
      if (!categoriaData.nombre) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: nombre is required'
        });
        return;
      }

      const newCategoria = await categoriaService.createCategoria(categoriaData);

      res.status(201).json({
        success: true,
        data: newCategoria,
        message: 'Categoria created successfully'
      });
    } catch (error: any) {
      console.error('Error in createCategoria:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error creating categoria'
      });
    }
  }

  /**
   * PUT /api/categorias/:id
   * Update an existing categoria
   */
  async updateCategoria(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid categoria ID'
        });
        return;
      }

      const categoriaData: ActualizarCategoria = req.body;

      const updatedCategoria = await categoriaService.updateCategoria(id, categoriaData);

      if (!updatedCategoria) {
        res.status(404).json({
          success: false,
          error: 'Categoria not found'
        });
        return;
      }

      res.json({
        success: true,
        data: updatedCategoria,
        message: 'Categoria updated successfully'
      });
    } catch (error: any) {
      console.error('Error in updateCategoria:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error updating categoria'
      });
    }
  }

  /**
   * DELETE /api/categorias/:id
   * Delete a categoria
   */
  async deleteCategoria(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid categoria ID'
        });
        return;
      }

      await categoriaService.deleteCategoria(id);

      res.json({
        success: true,
        message: 'Categoria deleted successfully'
      });
    } catch (error: any) {
      console.error('Error in deleteCategoria:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error deleting categoria'
      });
    }
  }

  /**
   * GET /api/categorias/search/:nombre
   * Search categorias by name
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

      const categorias = await categoriaService.searchByNombre(nombre);

      res.json({
        success: true,
        data: categorias
      });
    } catch (error: any) {
      console.error('Error in searchByNombre:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error searching categorias'
      });
    }
  }

  /**
   * GET /api/categorias/latest/:limit
   * Get latest categorias
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

      const categorias = await categoriaService.getLatestCategorias(limit);

      res.json({
        success: true,
        data: categorias
      });
    } catch (error: any) {
      console.error('Error in getLatest:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error fetching latest categorias'
      });
    }
  }

  /**
   * GET /api/categorias/order-by-nombre/:direction
   * Get categorias ordered by name
   */
  async getOrderByNombre(req: Request, res: Response): Promise<void> {
    try {
      const direction = req.params.direction;
      const ascending = direction === 'asc';

      const categorias = await categoriaService.getCategoriasOrderByNombre(ascending);

      res.json({
        success: true,
        data: categorias
      });
    } catch (error: any) {
      console.error('Error in getOrderByNombre:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error fetching categorias ordered by nombre'
      });
    }
  }

  /**
   * GET /api/categorias/count
   * Get total count of categorias
   */
  async getCategoriasCount(req: Request, res: Response): Promise<void> {
    try {
      const { nombre } = req.query;

      const filters: CategoriaFilters = {
        nombre: nombre as string
      };

      const count = await categoriaService.getCategoriasCount(filters);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error: any) {
      console.error('Error in getCategoriasCount:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error counting categorias'
      });
    }
  }
}

export default new CategoriaController();
