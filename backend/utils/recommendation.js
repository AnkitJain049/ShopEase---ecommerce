import natural from "natural";
import Product from "../models/ProductModel.js";

const { TfIdf, WordTokenizer } = natural;
const tfidf = new TfIdf();
const tokenizer = new WordTokenizer();

export const searchProducts = async (query, userId) => {
  try {
    const searchQuery = query?.toLowerCase().trim();
    if (!searchQuery) {
      throw new Error("Search query is required.");
    }
    
    const queryTokens = tokenizer.tokenize(searchQuery);
    const result = await Product.find();
    
    if (!result.length) {
      return { products: [], message: "No products found." };
    }

    // Reset TF-IDF documents
    tfidf.documents = [];
    
    // Add documents to TF-IDF
    result.forEach((p, index) => {
      tfidf.addDocument((p.name + " " + p.description).toLowerCase(), index);
    });

    let similarities = [];
    
    // Calculate similarity scores
    result.forEach((product, i) => {
      const productText = (product.name + " " + product.description).toLowerCase();
      let tfidfScore = 0;
      
      tfidf.tfidfs(searchQuery, (index, measure) => {
        if (index === i) tfidfScore = measure;
      });
      
      let exactMatchScore = 0;
      queryTokens.forEach(token => {
        const exactMatchRegex = new RegExp(`\\b${token}\\b`, "i");
        if (exactMatchRegex.test(productText)) {
          exactMatchScore += 5; // Give higher weight to exact term matches
        }
      });
      
      const finalScore = tfidfScore + exactMatchScore;
      similarities.push({ index: i, score: finalScore });
    });

    // Sort by score
    similarities = similarities.sort((a, b) => b.score - a.score);

    // Filter and map results
    const products = similarities
      .filter(s => s.score > 0) // Ignore irrelevant results
      .map(s => result[s.index]);

    return { products, userId };
  } catch (error) {
    console.error("Search Error:", error);
    throw error;
  }
}; 