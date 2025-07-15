import Payment from './payment.model.js';
import Appointment from '../appointment/appointment.model.js';

export const createPayment = async (req, res) => {
  try {
    const { appointmentId, amount, method, transactionId } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate('patient');
    if (!appointment) {
      return res.status(404).json({ success: false, msg: 'Appointment not found' });
    }

    if (amount !== appointment.price) {
      return res.status(400).json({
        success: false,
        msg: `El monto debe ser exactamente Q${appointment.price}`
      });
    }

    const existePago = await Payment.findOne({ appointment: appointmentId });
    if (existePago) {
      return res.status(400).json({ success: false, msg: 'Esta cita ya tiene un pago registrado' });
    }

    const payment = new Payment({
      appointment: appointmentId,
      user: appointment.patient._id,
      amount,
      method,
      transactionId
    });

    await payment.save();

    appointment.status = 'completed';
    await appointment.save();

    res.status(201).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error creando el pago', error });
  }
};

export const getPaymentsByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const payments = await Payment.find({ appointment: appointmentId }).populate('user');
    if (payments.length === 0) {
      return res.status(404).json({ success: false, msg: 'No se encontraron pagos para esta cita' });
    }

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error obteniendo los pagos', error });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'paid', 'failed'].includes(status)) {
      return res.status(400).json({ success: false, msg: 'Estado inválido' });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, msg: 'Pago no encontrado' });
    }

    payment.status = status;
    if (status === 'paid') {
      payment.paidAt = new Date();
    }

    await payment.save();

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error actualizando el pago', error });
  }
};
