import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['DOCTOR_ROLE'],
    default: 'DOCTOR_ROLE'
  },
  consultationPrice: {
    type: Number,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);
