const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    // sparse unique: legacy documents without a key are skipped by the index
    key: { type: String, required: true, unique: true, sparse: true, uppercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 600, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    taskSeq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

projectSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Project', projectSchema);
