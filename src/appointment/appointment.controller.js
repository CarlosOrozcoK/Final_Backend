import Appointment from './appointment.model.js';
import Doctor from '../doctors/doctor.model.js';

export const createAppointment = async (req, res) => {
  try {
    const patientId = req.uid;  // 👈 Obtenemos paciente desde el token validado
    const { doctorId, date } = req.body;

    if (!doctorId || !date) {
      return res.status(400).json({ message: 'doctorId and date are required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Verificar disponibilidad del doctor para la fecha
    const existing = await Appointment.findOne({ doctor: doctorId, date: new Date(date) });
    if (existing) {
      return res.status(400).json({ message: 'Doctor is not available at this date/time' });
    }

    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      date
    });

    await appointment.save();

    return res.status(201).json({ message: 'Appointment created', appointment });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const listAppointments = async (req, res) => {
  try {
    const patientId = req.uid; // Paciente autenticado

    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'name email specialization') // Información básica del doctor
      .sort({ date: 1 }); // Ordenar por fecha ascendente

    return res.json({ appointments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
