import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    // required: true,
  },
  username: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  events: {
    type: Array,
    default: [],
  },
});

export default mongoose.model('User', UserSchema);
