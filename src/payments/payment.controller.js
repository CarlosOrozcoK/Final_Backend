import Payment from './payment.model.js';
import Appointment from '../appointment/appointment.model.js';

// POST: Crear pago
export const createPayment = async (req, res) => {
  try {
    const { appointmentId, amount, method, transactionId } = req.body;

    // Validar cita
    const appointment = await Appointment.findById(appointmentId).populate('patient');
    if (!appointment) {
      return res.status(404).json({ success: false, msg: 'Appointment not found' });
    }

    // Crear el pago
    const payment = new Payment({
      appointment: appointmentId,
      user: appointment.patient._id,
      amount,
      method,
      transactionId,
    });

    await payment.save();

    // Actualizar estado de la cita
    appointment.status = 'completed'; // Marca la cita como completada
    await appointment.save();

    res.status(201).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error creating payment', error });
  }
};

// GET: Obtener pagos por cita
export const getPaymentsByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const payments = await Payment.find({ appointment: appointmentId }).populate('user');
    if (payments.length === 0) {
      return res.status(404).json({ success: false, msg: 'No payments found for this appointment' });
    }

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error fetching payments', error });
  }
};

// PUT: Actualizar estado de pago
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'paid', 'failed'].includes(status)) {
      return res.status(400).json({ success: false, msg: 'Invalid status' });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, msg: 'Payment not found' });
    }

    payment.status = status;
    if (status === 'paid') {
      payment.paidAt = new Date();
    }

    await payment.save();

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error updating payment status', error });
  }
};
