import { Router } from 'express';
import {
  listDoctors as listarDoctores,
  createDoctor  as crearDoctor,
  updateDoctor as actualizarDoctor,
  deleteDoctor   as eliminarDoctor
} from '../doctors/doctor.controller.js'; 

import { validateJWT } from '../middlewares/validate-jwt.js'; 
import { esOwner }   from '../middlewares/validar-roles.js';      

const router = Router();


router.get('/', [validateJWT], listarDoctores);

router.post('/nuevoDoc', [validateJWT, esOwner], crearDoctor);

router.put('/:id', [validateJWT, esOwner], actualizarDoctor);

router.delete('/:id', [validateJWT, esOwner], eliminarDoctor);

export default router;
