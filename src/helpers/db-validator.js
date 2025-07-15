import User from '../users/user.model.js';
import Doctor from '../doctors/doctor.model.js';
import Appointment from '../appointment/appointment.model.js';
import Payment from '../payments/payment.model.js';
import mongoose from 'mongoose';

export const validarDPI = async (dpi = '') => {
  const existeDPI = await User.findOne({ dpi });
  if (existeDPI) {
    throw new Error(`El DPI: ${dpi} ya está registrado`);
  }
};

export const validarCorreo = async (email = '') => {
  const existeEmail = await User.findOne({ email });
  if (existeEmail) {
    throw new Error(`El correo: ${email} ya está registrado`);
  }
};

export const existeUsuarioById = async (id = '') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`El ID ${id} no es válido`);
  }

  const existeUsuario = await User.findById(id);
  if (!existeUsuario) {
    throw new Error(`El ID ${id} no existe`);
  }
};

export const existeDoctorById = async (id = '') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`El ID ${id} no es válido`);
  }

  const existeDoctor = await Doctor.findById(id);
  if (!existeDoctor) {
    throw new Error(`No existe un doctor con el ID ${id}`);
  }
};

export const existeAppointmentById = async (id = '') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`El ID ${id} no es válido`);
  }

  const existeAppointment = await Appointment.findById(id);
  if (!existeAppointment) {
    throw new Error(`No existe una cita con el ID ${id}`);
  }
};

export const existeAppointmentLibreDePago = async (appointmentId = '') => {
  const pago = await Payment.findOne({ appointment: appointmentId });
  if (pago) {
    throw new Error(`La cita ya tiene un pago registrado`);
  }
};

export const pagoEsValido = async (id = '') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`El ID ${id} no es válido`);
  }

  const payment = await Payment.findById(id);
  if (!payment || payment.status !== 'paid') {
    throw new Error(`El pago no existe o no está confirmado como pagado`);
  }
};
