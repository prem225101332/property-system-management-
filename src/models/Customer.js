import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
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
    phone: { 
      type: String,
      default: ""
    },
    company: { 
      type: String,
      default: ""
    },
    status: { 
      type: String, 
      enum: ["Active", "Inactive"], 
      default: "Active" 
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
    dueAmount: { 
      type: Number, 
      default: 0 
    },
    paid: { 
      type: Boolean, 
      default: false 
    }
  },
  { 
    timestamps: true,
    versionKey: false
  }
);

// Add indexes for better performance
customerSchema.index({ email: 1 });
customerSchema.index({ isDeleted: 1 });

export default mongoose.model("Customer", customerSchema);