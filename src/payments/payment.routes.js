import { Router } from 'express';
import { createPayment, getPaymentsByAppointment, updatePaymentStatus } from './payment.controller.js';
import { validateJWT } from '../middlewares/validate-jwt.js';

const router = Router();

// Crear pago
router.post('/', [validateJWT], createPayment);

// Obtener pagos de una cita
router.get('/:appointmentId', [validateJWT], getPaymentsByAppointment);

// Actualizar estado de pago (ej: de 'pendiente' a 'pagado')
router.put('/:id', [validateJWT], updatePaymentStatus);

export default router;
