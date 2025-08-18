import mongoose from "mongoose";
import bycrpt from "bcryptjs";
import { type } from "os";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxLength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    avatar: {
        type: String,
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    preferences: {
    currency: {
      type: String,
      default: 'USD'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  }
}, {
  timestamps: true
});

//Index for fatser email lookups
userSchema.index({email: 1});

//Hash password before saving
userSchema.pre('save', async function (next) {
    //Only hash password if it has not been modified (or is new)
    if(!this.isModified("password")) return next();

    //Hash password with cost of 12
    this.password = await bycrpt.hash(this.password, 12);
    next();
});

//Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bycrpt.compare(candidatePassword, this.password);    
};

//Don't return password in JSON
userSchema.methods.toJSON = function(){
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
}

export default mongoose.model("User", userSchema);