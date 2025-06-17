import { request, response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../users/user.model.js';

export const validateJWT = async (req = request, res = response, next) => {
  const token = req.header('x-token');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No hay token en la petición'
    });
  }

  try {
    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
    req.uid = uid;

    const user = await User.findById(uid);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido - usuario no existe en DB'
      });
    }

    if (!user.status) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido - usuario con status: false'
      });
    }

    // ✅ Cambiado para que sea compatible con el middleware de roles
    req.usuario = user;

    next();

  } catch (err) {
    console.error(err);
    res.status(401).json({
      success: false,
      message: 'Token no válido'
    });
  }
};
