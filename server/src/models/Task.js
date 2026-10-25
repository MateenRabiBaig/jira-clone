const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    _id: false,
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, default: 'application/octet-stream' },
    size: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { strict: false }
);

const ACTIVITY_LIMIT = 50;

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    ticketKey: { type: String, unique: true, sparse: true },
    description: { type: String, trim: true, maxlength: 10000, default: '' },
    status: { type: String, enum: ['todo', 'in-progress', 'in-review', 'done'], default: 'todo', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    workType: { type: String, enum: ['task', 'story', 'bug'], default: 'task' },
    labels: [{ type: String, trim: true, maxlength: 30 }],
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attachments: { type: [attachmentSchema], default: [] },
    dueDate: { type: Date, default: null },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    activity: [
      {
        _id: false,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, required: true },
        field: { type: String },
        from: { type: mongoose.Schema.Types.Mixed },
        to: { type: mongoose.Schema.Types.Mixed },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Keep the embedded activity log bounded.
taskSchema.pre('save', function () {
  if (this.activity && this.activity.length > ACTIVITY_LIMIT) {
    this.activity = this.activity.slice(this.activity.length - ACTIVITY_LIMIT);
  }
});

taskSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Task', taskSchema);
