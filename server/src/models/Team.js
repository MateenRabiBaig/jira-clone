const mongoose = require('mongoose');

const TEAM_ROLES = ['owner', 'admin', 'member'];

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 400, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        _id: false,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: TEAM_ROLES, default: 'member' },
      },
    ],
    invites: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        role: { type: String, enum: ['admin', 'member'], default: 'member' },
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

teamSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Team', teamSchema);
module.exports.TEAM_ROLES = TEAM_ROLES;
