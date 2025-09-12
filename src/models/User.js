import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['Admin', 'Tenant'], 
      required: true 
    }
  },
  { 
    timestamps: true,
    versionKey: false
  }
);

// Add method to compare passwords
userSchema.methods.comparePassword = function (pwd) {
  return bcrypt.compare(pwd, this.passwordHash);
};

// Add indexes for better performance
userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);