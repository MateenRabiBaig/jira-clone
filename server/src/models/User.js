const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const notificationPrefsSchema = new mongoose.Schema(
  {
    assignedTasks: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true },
    statusChanges: { type: Boolean, default: true },
    invitations: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6, select: false },
        bio: { type: String, trim: true, maxlength: 400, default: '' },
        avatarUrl: { type: String, default: '' },
        notificationPrefs: { type: notificationPrefsSchema, default: () => ({}) },
    },
    { timestamps: true }
)

userSchema.pre('save', async function() {
    if(!this.isModified('password')) return
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = function(candidate) {
    return bcrypt.compare(candidate, this.password)
}

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  },
});

module.exports = mongoose.model('User', userSchema)
