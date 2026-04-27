import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  color: {
    type: String,
    default: '#ffffff',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
