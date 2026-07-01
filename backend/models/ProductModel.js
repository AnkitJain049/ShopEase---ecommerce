import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String, required: false },
    brand: { type: String, required: true },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product; 