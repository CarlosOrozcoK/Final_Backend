import User from '../users/user.model.js';
import { hash as hashPassword } from 'argon2';

/* ------------------------------------------------------------------------ */
/* LISTAR (GET /api/clientes)                                               */
/* ------------------------------------------------------------------------ */
export const listarClientes = async (req, res) => {
  try {
    // Solo clientes activos; quita el filtro si quieres ver también inactivos
    const clientes = await User.find({ status: true }).select('-password');
    res.json({ success: true, clientes });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error al obtener clientes', error });
  }
};

/* ------------------------------------------------------------------------ */
/* CREAR (POST /api/clientes)                                               */
/* ------------------------------------------------------------------------ */
export const crearCliente = async (req, res) => {
  try {
    const {
      name,
      username,
      dpi,
      address,
      phone,
      email,
      password
    } = req.body;

    // Validaciones de unicidad
    const [userExists, dpiExists, emailExists] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ dpi }),
      User.findOne({ email })
    ]);

    if (userExists) return res.status(400).json({ success: false, msg: 'El username ya está en uso' });
    if (dpiExists)  return res.status(400).json({ success: false, msg: 'El DPI ya está registrado' });
    if (emailExists) return res.status(400).json({ success: false, msg: 'El email ya está registrado' });

    // Hash de contraseña
    const hashedPassword = await hashPassword(password);

    const nuevoCliente = new User({
      name,
      username,
      dpi,
      address,
      phone,
      email,
      password: hashedPassword   // Se almacena el hash
    });

    await nuevoCliente.save();
    // Por seguridad, evita devolver el hash
    const { password: _, ...clienteSinPassword } = nuevoCliente.toObject();

    res.status(201).json({ success: true, cliente: clienteSinPassword });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error al crear el cliente', error });
  }
};

/* ------------------------------------------------------------------------ */
/* ACTUALIZAR (PUT /api/clientes/:id)                                       */
/* ------------------------------------------------------------------------ */
export const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, username, dpi, email, ...campos } = req.body;

    const cliente = await User.findById(id);
    if (!cliente) return res.status(404).json({ success: false, msg: 'Cliente no encontrado' });

    /* --- verificación de campos únicos si cambian --- */
    if (username && username !== cliente.username) {
      const exists = await User.findOne({ username });
      if (exists) return res.status(400).json({ success: false, msg: 'Username en uso' });
      campos.username = username;
    }
    if (dpi && dpi !== cliente.dpi) {
      const exists = await User.findOne({ dpi });
      if (exists) return res.status(400).json({ success: false, msg: 'DPI en uso' });
      campos.dpi = dpi;
    }
    if (email && email !== cliente.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ success: false, msg: 'Email en uso' });
      campos.email = email;
    }

    /* --- manejar cambio de contraseña --- */
    if (password) {
      campos.password = await hashPassword(password);
    }

    const actualizado = await User.findByIdAndUpdate(id, campos, { new: true }).select('-password');
    res.json({ success: true, cliente: actualizado });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error al actualizar el cliente', error });
  }
};

/* ------------------------------------------------------------------------ */
/* ELIMINAR (DELETE /api/clientes/:id)                                      */
/* ------------------------------------------------------------------------ */
export const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    // Soft delete: status = false
    const cliente = await User.findByIdAndUpdate(id, { status: false }, { new: true }).select('-password');

    if (!cliente) return res.status(404).json({ success: false, msg: 'Cliente no encontrado' });

    res.json({ success: true, msg: 'Cliente desactivado', cliente });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error al eliminar el cliente', error });
  }
};
