import { Router } from 'express';
import { createAppointment, listAppointments, completeAppointment } from './appointment.controller.js';
import { validateJWT } from '../middlewares/validate-jwt.js';
import { check } from 'express-validator';
import { existeDoctorById, existeAppointmentById, pagoEsValido } from '../helpers/db-validator.js';
import { validarCampos } from '../middlewares/validar-campos.js';

const router = Router();

router.post(
  '/nuevaCita',
  [
    validateJWT,
    check('doctorId', 'El doctorId es obligatorio').not().isEmpty(),
    check('doctorId').custom(existeDoctorById),
    check('date', 'La fecha es obligatoria').not().isEmpty(),
    validarCampos
  ],
  createAppointment
);

router.get('/', validateJWT, listAppointments);

router.put(
  '/completar/:id',
  [
    validateJWT,
    check('appointmentId', 'El appointmentId es obligatorio').not().isEmpty(),
    check('appointmentId').custom(existeAppointmentById),
    check('paymentId', 'El paymentId es obligatorio').not().isEmpty(),
    check('paymentId').custom(pagoEsValido),
    validarCampos
  ],
  completeAppointment
);

export default router;
