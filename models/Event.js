import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
    default: [],
  },
  link: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Event', EventSchema);
