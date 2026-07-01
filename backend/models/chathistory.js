import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conversation: [
    {
      sender: {
        type: String,
        enum: ['user', 'chatbot'],
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory; 