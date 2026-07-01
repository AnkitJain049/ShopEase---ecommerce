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

    // Add user message to history
    chatHistory.conversation.push({
      sender: 'user',
      text: message,
      timestamp: new Date()
    });

    // Generate AI response
    const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });
    
    const prompt = `You are a helpful customer service assistant for ShopEase, an e-commerce platform. 
    You help customers with:
    - Product inquiries
    - Order status
    - Payment issues
    - General shopping questions
    - Technical support
    
    Keep responses friendly, helpful, and concise. If you don't know something specific about ShopEase, 
    provide general e-commerce advice or ask the user to contact support.
    
    User message: ${message}`;

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