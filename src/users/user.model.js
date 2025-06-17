import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String,
    required: true 
    },

  username: { type: String,
    required: true,
    unique: true 
    },

  dpi: { type: String,
    required: true,
    unique: true 
    },

  address: { type: String, 
    required: true 
    },

  phone: { type: String, 
    required: true 
    },

  email: { type: String, 
    required: true, 
    unique: true 
    },

  password: { type: String, 
    required: true },

  role: { type: String, 
    enum: ['CLIENT_ROLE'], 
    default: 'CLIENT_ROLE' 
    },

  status: { type: Boolean, 
    default: true },

}, { timestamps: true });

export default mongoose.model('User', userSchema);
