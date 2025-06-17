import User from '../doctors/doctor.model.js';
import { hash as hashPassword } from 'argon2';

// 📄 GET: Listar todos los usuarios
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find();
    res.json({ success: true, usuarios });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error al obtener los usuarios', error });
  }
};

export const crearUsuario = async (req, res) => {
  try {
    const { name, phone, email, specialization, role } = req.body;

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ success: false, msg: 'Ya existe un usuario con ese correo' });
    }

    const hashedPassword = await hashPassword(phone); // O usa otro valor para la contraseña

    const nuevoUsuario = new User({
      name,
      phone,
      email,
      specialization,
      role,
      password: hashedPassword  // Aunque no lo tienes en el schema, por seguridad podrías agregarlo
    });

    await nuevoUsuario.save();
    res.status(201).json({ success: true, usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error al crear el usuario', error });
  }
};

// 🔄 PUT: Actualizar usuario
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone, ...data } = req.body;

    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ success: false, msg: 'Usuario no encontrado' });
    }

    if (email && email !== usuario.email) {
      const existeEmail = await User.findOne({ email });
      if (existeEmail) {
        return res.status(400).json({ success: false, msg: 'Ese correo ya está en uso' });
      }
    }

    const actualizado = await User.findByIdAndUpdate(id, { ...data, email, phone }, { new: true });
    res.json({ success: true, usuario: actualizado });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error al actualizar el usuario', error });
  }
};

// ❌ DELETE: Eliminar usuario (soft delete)
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await User.findByIdAndUpdate(id, { status: false }, { new: true });

    if (!eliminado) {
      return res.status(404).json({ success: false, msg: 'Usuario no encontrado' });
    }

    res.json({ success: true, msg: 'Usuario desactivado', usuario: eliminado });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error al eliminar el usuario', error });
  }
};
