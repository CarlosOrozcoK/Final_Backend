
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

    const appointments = await Appointment.find({ patient: patientId })
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
