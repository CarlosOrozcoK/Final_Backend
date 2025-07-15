import { Router } from 'express';
import { createInvoice, getInvoiceById } from './invoice.controller.js';
import { validateJWT } from '../middlewares/validate-jwt.js';

const router = Router();


router.post('/crear', [validateJWT], createInvoice);


router.get('/:id', [validateJWT], getInvoiceById);

export default router;
