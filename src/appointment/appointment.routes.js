import { Router } from 'express';
import { createAppointment, listAppointments } from './appointment.controller.js';
import { validateJWT } from '../middlewares/validate-jwt.js';  // ruta a tu middleware JWT

const router = Router();

router.post('/nuevaCita', validateJWT, createAppointment);  // Aquí validamos el token para extraer paciente
router.get('/', listAppointments);

export default router;
