const mongoose = require('mongoose')

const taskSchema: any = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    title: { type: String, default: null },
    description: { type: String, default: null },
    status: { type: String, default: null },
    taskId: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true })
export const taskModel = mongoose.model('task', taskSchema);