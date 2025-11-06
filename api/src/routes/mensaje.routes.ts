import { Router } from 'express';
import { MensajeController } from '../controllers/mensaje.controller';

const router = Router();
const mensajeController = new MensajeController();

/**
 * @route   GET /api/mensajes/chats
 * @desc    Get all chats grouped by phone number
 * @access  Public
 */
router.get('/chats', (req, res) => mensajeController.getChats(req, res));

/**
 * @route   GET /api/mensajes/telefono/:telefono
 * @desc    Get all messages for a specific phone number
 * @param   telefono - Phone number
 * @access  Public
 */
router.get('/telefono/:telefono', (req, res) => mensajeController.getMensajesByTelefono(req, res));

/**
 * @route   GET /api/mensajes/count
 * @desc    Get total message count
 * @access  Public
 */
router.get('/count', (req, res) => mensajeController.getMensajesCount(req, res));

/**
 * @route   POST /api/mensajes
 * @desc    Create a new message
 * @body    { telefono, mensaje, esAdmin? }
 * @access  Public
 */
router.post('/', (req, res) => mensajeController.createMensaje(req, res));

/**
 * @route   DELETE /api/mensajes/:id
 * @desc    Delete a message
 * @param   id - Message ID
 * @access  Public
 */
router.delete('/:id', (req, res) => mensajeController.deleteMensaje(req, res));

export default router;
