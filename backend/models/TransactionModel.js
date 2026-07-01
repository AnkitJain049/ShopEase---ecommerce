import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userName: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  status: { type: String, default: 'successful' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema); 