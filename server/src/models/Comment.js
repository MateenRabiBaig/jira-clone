const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
    {
        text: { type: String, required: true, trim: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true }
    },
    { timestamps: true }
)

commentSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        if (ret._id) ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
})

module.exports = mongoose.model('Comment', commentSchema)
