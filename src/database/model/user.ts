const mongoose = require('mongoose')

const userSchema: any = new mongoose.Schema({
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    username: { type: String, default: null },
    bio: { type: String, default: null },
    email: { type: String, default: null },
    password: { type: String, default: null },
    description: { type: String, default: null },
    country: { type: String, default: null },
    DOB: { type: String, default: null },
    image: { type: String, default: null },
    otp: { type: Number, default: 0 },
    otpExpireTime: { type: Date, default: null },
    deviceToken: { type: [{ type: String }], default: [] },
    loginType: { type: Number, default: 0, enum: [0, 1, 2, 3] }, // 0 - custom || 1 - google || 2 - facebook 
    userType: { type: Number, default: 0, enum: [0, 1,] }, // 0 - user || 1 - owner 
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
}, { timestamps: true })
userSchema.index({ username: 1, userType: 1, })
export const userModel = mongoose.model('user', userSchema);