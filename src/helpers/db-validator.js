import User from '../users/user.model.js';

export const validarDPI = async (dpi = '') => {
  const existeDPI = await User.findOne({
    dpi
  });
  if (existeDPI) {
    throw new Error(`El DPI: ${dpi} ya está registrado`);
  }
};

export const validarCorreo = async (email = '') => {
  const existeEmail = await User.findOne({
    email
  });
  if (existeEmail) {
    throw new Error(`El correo: ${email} ya está registrado`);
  }
};

export const existeUsuarioById = async (id = '') => {
  const existeUsuario = await User.findById(id);
  if (!existeUsuario) {
    throw new Error(`El ID ${id} no existe`);
  }
};