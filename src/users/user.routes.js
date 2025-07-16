import { Router } from 'express';
import {
  crearCliente,
  listarClientes,
  actualizarCliente,
  eliminarCliente,
  obtenerMiPerfil 
} from '../users/user.controller.js';

import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarDPI, validarCorreo, existeUsuarioById } from '../helpers/db-validator.js'; // Renombra según lo desees
import { validateJWT } from '../middlewares/validate-jwt.js';


const router = Router();

router.post(
  '/',
  [
    check('name', 'El nombre es obligatorio').notEmpty(),
    check('username', 'El username es obligatorio').notEmpty(),
    check('dpi', 'El DPI es obligatorio').notEmpty(),
    check('dpi').custom(validarDPI),
    check('email', 'El correo no es válido').isEmail(),
    check('email').custom(validarCorreo),
    check('phone', 'El teléfono es obligatorio').notEmpty(),
    check('address', 'La dirección es obligatoria').notEmpty(),
    validarCampos
  ],
  crearCliente
);

router.get('/', listarClientes);

router.get('/mi-perfil', validateJWT, obtenerMiPerfil);


router.put(
  '/:id',
  [
    check('id', 'ID inválido').isMongoId(),
    check('id').custom(existeUsuarioById),
    validarCampos
  ],
  actualizarCliente
);

router.delete(
  '/:id',
  [
    check('id', 'ID inválido').isMongoId(),
    check('id').custom(existeUsuarioById),
    validarCampos
  ],
  eliminarCliente
);

export default router;
