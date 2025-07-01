import { Router } from 'express';
import { createPayment, getPaymentsByAppointment, updatePaymentStatus } from './payment.controller.js';
import { validateJWT } from '../middlewares/validate-jwt.js';
import { check } from 'express-validator';
import { existeAppointmentById, existeAppointmentLibreDePago } from '../helpers/db-validator.js';
import { validarCampos } from '../middlewares/validar-campos.js';

const router = Router();

router.post(
  '/',
  [
    validateJWT,
    check('appointmentId', 'El appointmentId es obligatorio').not().isEmpty(),
    check('appointmentId').custom(existeAppointmentById),
    check('appointmentId').custom(existeAppointmentLibreDePago),
    check('amount', 'El amount es obligatorio y debe ser numérico').isNumeric(),
    validarCampos
  ],
  createPayment
);

router.get(
  '/:appointmentId',
  [
    validateJWT,
    check('appointmentId', 'El appointmentId es obligatorio').not().isEmpty(),
    check('appointmentId').custom(existeAppointmentById),
    validarCampos
  ],
  getPaymentsByAppointment
);

router.put(
  '/:id',
  [
    validateJWT,
    check('id', 'El id del pago es obligatorio').not().isEmpty(),
    validarCampos
  ],
  updatePaymentStatus
);

export default router;
