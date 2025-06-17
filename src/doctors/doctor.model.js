import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String,
    required: true 
    },

  phone: { type: String, 
    required: true 
    },

  email: { type: String, 
    required: true, 
    unique: true 
    },

  specialization: { type: String, 
    required: true },

  role: { type: String, 
    enum: ['CLIENT_ROLE', 'DOCTOR_ROLE'], 
    default: 'DOCTOR_ROLE' 
    },

  status: { type: Boolean, 
    default: true },

}, { timestamps: true });

export default mongoose.model('Doctor', userSchema);
