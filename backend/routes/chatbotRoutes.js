import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatHistory from '../models/chathistory.js';
import { isAuthenticated } from '../utils/auth.js';

const router = express.Router();

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get chat history
router.get('/history', isAuthenticated, async (req, res) => {
  try {
    let chatHistory = await ChatHistory.findOne({ userId: req.user._id });
    
    if (!chatHistory) {
      chatHistory = new ChatHistory({
        userId: req.user._id,
        conversation: []
      });
      await chatHistory.save();
    }
    
    res.json(chatHistory.conversation);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Send message to chatbot
router.post('/message', isAuthenticated, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create chat history
    let chatHistory = await ChatHistory.findOne({ userId: req.user._id });
    if (!chatHistory) {
      chatHistory = new ChatHistory({
        userId: req.user._id,
        conversation: []
      });
    }

    // Format recent chat history (last 6 messages) for model context
    const historyLimit = 6;
    const historyContext = chatHistory.conversation
      .slice(-historyLimit)
      .map(msg => `${msg.sender === 'user' ? 'Customer' : 'Support Assistant'}: ${msg.text}`)
      .join('\n');

    // Add user message to history
    chatHistory.conversation.push({
      sender: 'user',
      text: message,
      timestamp: new Date()
    });

    // Generate AI response using fast gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a helpful, professional, and friendly customer service assistant for ShopEase, an online e-commerce platform. 
    You help customers with:
    - Product inquiries and specifications
    - Order tracking and transaction statuses
    - General checkout, cart, or payment questions
    - Technical issues on the platform
    
    Keep responses concise (under 3-4 sentences), friendly, and structured. 
    Refer to the conversation history context below to answer follow-up questions accurately.
    
    Conversation History:
    ${historyContext || "No previous messages in this conversation."}
    
    Customer: ${message}
    Support Assistant:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Add AI response to history
    chatHistory.conversation.push({
      sender: 'chatbot',
      text: aiResponse,
      timestamp: new Date()
    });

    await chatHistory.save();

    res.json({
      response: aiResponse,
      conversation: chatHistory.conversation
    });
  } catch (error) {
    console.error('Error processing chatbot message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Clear chat history
router.delete('/history', isAuthenticated, async (req, res) => {
  try {
    await ChatHistory.findOneAndUpdate(
      { userId: req.user._id },
      { conversation: [] },
      { upsert: true }
    );
    
    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

export default router; 