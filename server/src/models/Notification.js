const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'task-assigned',
  'status-change',
  'comment',
  'mention',
  'team-invite',
  'added-to-project',
];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    message: { type: String, required: true, maxlength: 300 },
    read: { type: Boolean, default: false },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  },
  { timestamps: true }
);

notificationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
