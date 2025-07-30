// src/appointments/appointment.controller.js

import Appointment from './appointment.model.js';
import Doctor from '../doctors/doctor.model.js';
import Payment from '../payments/payment.model.js';  

export const createAppointment = async (req, res) => {
  try {
    const patientId = req.uid;               // paciente desde JWT
    const { doctorId, date } = req.body;

    if (!doctorId || !date) {
      return res.status(400).json({ message: 'doctorId and date are required' });
    }

    // 1️⃣  Obtener doctor y su precio
    const doctor = await Doctor.findById(doctorId);
    if (!doctor)
      return res.status(404).json({ message: 'Doctor not found' });

    // 2️⃣  Verificar disponibilidad (misma fecha/hora exacta)
    const clash = await Appointment.findOne({ doctor: doctorId, date: new Date(date) });
    if (clash)
      return res.status(400).json({ message: 'Doctor is not available at this date/time' });

    // 3️⃣  Crear la cita con el precio del doctor
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      date,
      price: doctor.consultationPrice        // 💲 precio copiado
    });

    await appointment.save();

    res.status(201).json({ message: 'Appointment created', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Listar citas
export const listAppointments = async (req, res) => {
  try {
    const patientId = req.uid;

    const appointments = await Appointment.find({
      patient: patientId,
      status: { $ne: 'cancelled' } // <-- ¡AÑADE ESTA LÍNEA PARA FILTRAR!
    })
      .populate('doctor', 'name email specialization consultationPrice')
      .sort({ date: 1 });

    res.json({ appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const completeAppointment = async (req, res) => {
  try {
    const { appointmentId, paymentId } = req.body;


    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment || payment.status !== 'paid') {
      return res.status(400).json({ message: 'Payment not valid or not paid' });
    }

    appointment.status = 'completed';
    appointment.paidAt = new Date(); 
    await appointment.save();

    res.json({ message: 'Appointment completed and payment registered', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error completing appointment', error: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  console.log('*** Entrando a cancelAppointment ***'); // <-- Añade esto
  try {
    const { id } = req.params;
    const patientId = req.uid;

    console.log('ID de cita a cancelar:', id); // <-- Añade esto
    console.log('ID de paciente:', patientId); // <-- Añade esto
    const appointment = await Appointment.findOne({ _id: id, patient: patientId });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada o no tienes permiso para cancelarla.' });
    }

    console.log('Estado actual de la cita:', appointment.status);

    // 2. Verificar si la cita ya está completada o cancelada
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: `La cita ya está ${appointment.status}. No se puede cancelar.` });
    }

    // 3. Cambiar el estado de la cita a 'cancelled' (soft delete)
    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ message: 'Cita cancelada exitosamente.', appointment });
  } catch (error) {
    console.error('Error al cancelar la cita:', error);
    res.status(500).json({ message: 'Error interno del servidor al cancelar la cita.', error: error.message });
  }
};