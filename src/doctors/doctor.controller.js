import Doctor from '../doctors/doctor.model.js';

// GET: List all active doctors
export const listDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: true }).select('-__v');
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error fetching doctors', error });
  }
};

// POST: Create doctor
export const createDoctor = async (req, res) => {
  try {
    const { name, phone, email, specialization, consultationPrice } = req.body;

    if (!consultationPrice) {
      return res.status(400).json({ success: false, msg: 'consultationPrice is required' });
    }

    if (await Doctor.findOne({ email })) {
      return res.status(400).json({ success: false, msg: 'Email already in use' });
    }

    const doctor = new Doctor({
      name,
      phone,
      email,
      specialization,
      consultationPrice     // ← requerido
    });

    await doctor.save();
    res.status(201).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error creating doctor', error });
  }
};

// PUT: Update doctor
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, ...data } = req.body;

    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ success: false, msg: 'Doctor not found' });

    if (email && email !== doctor.email && await Doctor.findOne({ email })) {
      return res.status(400).json({ success: false, msg: 'Email already in use' });
    }

    const updated = await Doctor.findByIdAndUpdate(id, { ...data, email }, { new: true });
    res.json({ success: true, doctor: updated });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error updating doctor', error });
  }
};

// DELETE: Soft delete
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Doctor.findByIdAndUpdate(id, { status: false }, { new: true });
    if (!deleted) return res.status(404).json({ success: false, msg: 'Doctor not found' });

    res.json({ success: true, msg: 'Doctor deactivated', doctor: deleted });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error deleting doctor', error });
  }
};
