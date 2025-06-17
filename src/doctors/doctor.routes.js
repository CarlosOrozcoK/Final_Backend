import { Router } from 'express';
import {
  listarUsuarios as listarDoctores,
  crearUsuario  as crearDoctor,
  actualizarUsuario as actualizarDoctor,
  eliminarUsuario   as eliminarDoctor
} from '../doctors/doctor.controller.js'; 

import { validateJWT } from '../middlewares/validate-jwt.js'; // tu middleware existente
import { esOwner }   from '../middlewares/validar-roles.js';      // creado arriba

const router = Router();


// Listar doctores -> basta con estar autenticado
router.get('/', [validateJWT], listarDoctores);

// Crear doctor -> solo OWNER
router.post('/nuevoDoc', [validateJWT, esOwner], crearDoctor);

// Actualizar doctor -> solo OWNER
router.put('/:id', [validateJWT, esOwner], actualizarDoctor);

// Eliminar doctor (soft‑delete) -> solo OWNER
router.delete('/:id', [validateJWT, esOwner], eliminarDoctor);

export default router;
