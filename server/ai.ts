import { GoogleGenAI } from "@google/genai";
import { db } from "./db";

// Handle lazy initialization and safety for the Gemini API key
let aiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured. Please add it to Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function askAssistant(
  query: string, 
  history: ChatMessage[] = [], 
  userId?: string
): Promise<{ reply: string; action?: { type: string; payload: any } }> {
  try {
    const ai = getGemini();

    // 1. Fetch live contextual data from DB
    const products = db.getProducts().filter(p => p.isActive);
    const categories = db.getCategories();
    const brands = db.getBrands();
    const coupons = db.getCoupons().filter(c => c.isActive);
    const faqs = db.getFAQs();
    
    // Fetch orders for the specific logged-in user to check status
    let userOrders = [];
    let userInfo = "Guest Customer";
    if (userId) {
      const users = db.getUsers();
      const user = users.find(u => u.id === userId);
      if (user) {
        userInfo = `Name: ${user.name}, Email: ${user.email}, Address: ${user.address || 'N/A'}`;
      }
      userOrders = db.getOrders().filter(o => o.userId === userId);
    }

    // 2. Format database context for the AI
    const dbContext = `
=== LIVE TECHMART STORE DATABASE (REAL-TIME INFO) ===
[Current User]: ${userInfo}
[User's Orders]: ${JSON.stringify(userOrders, null, 2)}
[Categories Available]: ${categories.map(c => `${c.name} (${c.slug})`).join(', ')}
[Brands Available]: ${brands.map(b => b.name).join(', ')}
[Available Coupons]: ${JSON.stringify(coupons, null, 2)}
[FAQ knowledgebase]: ${JSON.stringify(faqs, null, 2)}

[Products Catalog]:
${products.map(p => `
- Name: ${p.name}
  ID: ${p.id}
  Brand: ${p.brand}
  Category: ${p.category}
  SKU: ${p.sku}
  Model: ${p.model}
  Price: $${p.price}
  Discount: ${p.discount}% (Effective Price: $${(p.price * (1 - p.discount/100)).toFixed(2)})
  Stock: ${p.availableStock} units (${p.availableStock > 0 ? 'IN STOCK' : 'OUT OF STOCK'})
  Specs: ${JSON.stringify(p.technicalSpecifications)}
  Warranty: ${p.warranty}
  Delivery: ${p.deliveryInfo}
  Return Policy: ${p.returnPolicy}
`).join('\n')}
==================================================
`;

    // 3. Build system prompt
    const systemInstruction = `
You are TechMart's Elite AI Shopping Assistant—a professional, courteous, and knowledgeable consumer electronics expert.
Your goal is to guide TechMart customers through their e-commerce journey with premium expertise.

CRITICAL INSTRUCTIONS:
1. Always base product descriptions, prices, discounts, stock levels, and order status directly on the LIVE TECHMART STORE DATABASE provided in the context.
2. If a customer asks to "recommend products based on budget" or "compare laptops", use the active catalog prices, apply the discount dynamically, and compare their technical specifications clearly in a table format.
3. If they ask about their order status (e.g. "Where is my order?"), inspect the User's Orders from the database. Summarize their order status ('pending', 'processing', 'shipped', 'delivered'), list the items purchased, show final amount, and provide the tracking number if shipped.
4. If a product is out of stock, recommend similar available products.
5. If they mention issues like "product arrived damaged" or "want to return", explain our policy from the FAQ context and guide them to file a support ticket or offer to open one.
6. Offer to suggest relevant accessories (e.g., if they look at laptops, suggest headphones, chargers, or mouse).
7. Keep responses professionally warm, concise, and easy to read using clean markdown.
8. If the user explicitly asks to "create a ticket", "apply coupon", or "add product to cart", explain they can use the UI buttons provided on the screen, or summarize how to do so.
9. Keep every response between 5 and 15 lines unless the user explicitly asks for a detailed explanation.
10. Give direct answers and avoid unnecessary introductions or long paragraphs.
11. Recommend a maximum of 3 products with a one-line reason for each.
12. Use bullet points instead of long paragraphs whenever possible.
`;

    // 4. Set up message history content for Gemini
    const contents: any[] = [];
    
    // Inject the DB Context as a user-like system guidance or systemInstruction
    // To keep history clean, we append history first
    history.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });

    // Add current user query with the injected live context
    contents.push({
      role: 'user',
      parts: [
        { text: `${dbContext}\n\nUser Question: ${query}` }
      ]
    });

      // 5. Query Gemini
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

    const reply = response.text || "I am here to assist you with TechMart's elite electronics. Could you please rephrase your request?";

    // 6. Log chat history in background
    const chatLogs = db.getChatHistory();
    chatLogs.push({
      id: `chat-${Date.now()}`,
      userId,
      userName: userId ? (db.getUsers().find(u => u.id === userId)?.name || 'User') : 'Guest',
      query,
      response: reply,
      createdAt: new Date().toISOString()
    });
    db.saveChatHistory(chatLogs);

    return { reply };
  } catch (error: any) {
    console.error("Gemini Assistant Error:", error);
    return { 
      reply: `I apologize, but I am currently having difficulty connecting to my AI core (${error.message || 'Key missing'}). You can still browse our live catalog, add products to your cart, and place orders smoothly!`
    };
  }
}
