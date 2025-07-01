import { Router } from 'express';
import { createInvoice, getInvoiceById } from './invoice.controller.js';
import { validateJWT } from '../middlewares/validate-jwt.js';

const router = Router();

// Ruta para crear factura
router.post('/crear', [validateJWT], createInvoice);

// Ruta para obtener factura por ID
router.get('/:id', [validateJWT], getInvoiceById);

export default router;
