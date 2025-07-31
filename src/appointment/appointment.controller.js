
import Appointment from './appointment.model.js';
import Doctor from '../doctors/doctor.model.js';
import Payment from '../payments/payment.model.js';  

export const createAppointment = async (req, res) => {
  try {
    const patientId = req.uid;              
    const { doctorId, date } = req.body;

    if (!doctorId || !date) {
      return res.status(400).json({ message: 'doctorId and date are required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor)
      return res.status(404).json({ message: 'Doctor not found' });

    const clash = await Appointment.findOne({ doctor: doctorId, date: new Date(date) });
    if (clash)
      return res.status(400).json({ message: 'Doctor is not available at this date/time' });

    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      date,
      price: doctor.consultationPrice     
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
      status: { $ne: 'cancelled' } 
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
  console.log('*** Entrando a cancelAppointment ***');
  try {
    const { id } = req.params;
    const patientId = req.uid;

    console.log('ID de cita a cancelar:', id); 
    console.log('ID de paciente:', patientId); 
    const appointment = await Appointment.findOne({ _id: id, patient: patientId });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada o no tienes permiso para cancelarla.' });
    }

    console.log('Estado actual de la cita:', appointment.status);

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: `La cita ya está ${appointment.status}. No se puede cancelar.` });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ message: 'Cita cancelada exitosamente.', appointment });
  } catch (error) {
    console.error('Error al cancelar la cita:', error);
    res.status(500).json({ message: 'Error interno del servidor al cancelar la cita.', error: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).populate('doctor patient');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ appointment });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
