import { Router } from 'express';
import { createAppointment, listAppointments, completeAppointment } from './appointment.controller.js';
import { validateJWT } from '../middlewares/validate-jwt.js';  // middleware para validar JWT

const router = Router();

// Crear una nueva cita
router.post('/nuevaCita', validateJWT, createAppointment);

// Obtener las citas del paciente (por token)
router.get('/', validateJWT, listAppointments);

// Completar una cita (cuando el pago se haya hecho)
router.put('/completar/:id', validateJWT, completeAppointment);

export default router;
