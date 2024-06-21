import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, default: null },
    receiverId: { type: mongoose.Schema.Types.ObjectId, default: null },
    status: { type: Number, default: 0 },  // 0 = Sent || 1 = Delivered || 2 = View
    roomId: { type: mongoose.Schema.Types.ObjectId, default: null },
    message: { type: String, default: null },
    extraid: { type: String, default: null },
    media: { type: [], default: [] },
    deleteby: { type: [], default: [] },

}, { timestamps: true })

export const messageModel = mongoose.model('message', messageSchema)