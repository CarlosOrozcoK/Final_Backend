// src/appointments/appointment.controller.js
import Appointment from './appointment.model.js';
import Doctor from '../doctors/doctor.model.js';
import Payment from '../payments/payment.model.js';  // Asegúrate de importar el modelo de pagos

// Crear cita
export const createAppointment = async (req, res) => {
  try {
    const patientId = req.uid;               // Paciente desde JWT
    const { doctorId, date } = req.body;

    if (!doctorId || !date) {
      return res.status(400).json({ message: 'doctorId and date are required' });
    }

    // 1️⃣ Obtener doctor y su precio
    const doctor = await Doctor.findById(doctorId);
    if (!doctor)
      return res.status(404).json({ message: 'Doctor not found' });

    // 2️⃣ Verificar disponibilidad (misma fecha/hora exacta)
    const clash = await Appointment.findOne({ doctor: doctorId, date: new Date(date) });
    if (clash)
      return res.status(400).json({ message: 'Doctor is not available at this date/time' });

    // 3️⃣ Crear la cita con el precio del doctor
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

    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'name email specialization consultationPrice')
      .sort({ date: 1 });

    res.json({ appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Esta función la agregaríamos para actualizar la cita después de realizar el pago
export const completeAppointment = async (req, res) => {
  try {
    const { appointmentId, paymentId } = req.body;

    // Buscar la cita
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verificar si el pago ya está registrado
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.status !== 'paid') {
      return res.status(400).json({ message: 'Payment not valid or not paid' });
    }

    // Actualizar la cita: cambiar el estado a 'completed' y registrar la fecha del pago
    appointment.status = 'completed';
    appointment.paidAt = new Date();   // Registrar la fecha de pago
    await appointment.save();

    res.json({ message: 'Appointment completed and payment registered', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error completing appointment', error: error.message });
  }
};
