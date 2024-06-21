import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    message: { type: Array, default: null },
    audio: { type: Array, default: null },
    imgToimg: { type: Array, default: null },
    image: { type: Array, default: null },
    aiModel: { type: String, default: null },
    title: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true })
roomSchema.index({ userId: 1 })
export const roomModel = mongoose.model('room', roomSchema)