import express from "express";
import path from "path";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Inquiries file path
const INQUIRIES_FILE = path.join(process.cwd(), "src", "data", "inquiries.json");

// Ensure inquiries file exists
async function initInquiriesFile() {
  try {
    await fs.mkdir(path.dirname(INQUIRIES_FILE), { recursive: true });
    try {
      await fs.access(INQUIRIES_FILE);
    } catch {
      await fs.writeFile(INQUIRIES_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error("Failed to initialize inquiries storage:", error);
  }
}
initInquiriesFile();

// Lazy initialize Gemini client to avoid crashes if API key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Submit export inquiry / quote request
app.post("/api/inquiry", async (req, res) => {
  try {
    const { buyerName, companyName, country, email, phone, whatsapp, products, notes, totalWeight } = req.body;

    if (!buyerName || !email || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Missing required fields. Buyer name, email, and at least one product selection are required." });
    }

    const newInquiry = {
      id: "RFQ-" + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      buyerName,
      companyName: companyName || "Independent Trader",
      country: country || "Not Specified",
      email,
      phone: phone || "",
      whatsapp: whatsapp || "",
      products, // Array of { productId: number, productName: string, quantityKg: number }
      totalWeight: totalWeight || 0,
      notes: notes || "",
      status: "Pending Review",
    };

    let inquiries = [];
    try {
      const data = await fs.readFile(INQUIRIES_FILE, "utf-8");
      inquiries = JSON.parse(data);
    } catch {
      inquiries = [];
    }

    inquiries.unshift(newInquiry);
    await fs.writeFile(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2));

    res.status(201).json({ success: true, message: "Inquiry submitted successfully", inquiryId: newInquiry.id });
  } catch (error: any) {
    console.error("Error submitting inquiry:", error);
    res.status(500).json({ error: error.message || "Failed to submit inquiry" });
  }
});

// API: Get all inquiries (for exporter admin dashboard)
app.get("/api/inquiries", async (req, res) => {
  try {
    let inquiries = [];
    try {
      const data = await fs.readFile(INQUIRIES_FILE, "utf-8");
      inquiries = JSON.parse(data);
    } catch {
      inquiries = [];
    }
    res.json({ inquiries });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to read inquiries" });
  }
});

// API: AI Product and Export Advisor Chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { history } = req.body;

    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: "Chat history must be provided as an array." });
    }

    const ai = getGeminiClient();

    // Sourced compact product data to keep prompt size optimized
    const systemInstruction = `You are the Expert AI Export Advisor for 'Pure Herbal Goodness India', representing Chaitanya Patel (Export Lead, WhatsApp/Phone: +1 780-699-0108, Email: chaitanyapatel4@gmail.com).
Your job is to assist international buyers (importers, brands, wholesalers, and cosmetic/supplement manufacturers) looking to import premium herbal powders from India.

We export 13 core powders:
1. Moringa Powder (Moringa oleifera) - 15% export ratio. Rich in vitamins, supports immunity, energy.
2. Multani Mitti (Fuller's Earth) - 10% export ratio. Deep dermal cleanses, oil control, cosmetic grade (Mesh 150).
3. Ashwagandha Powder (Withania somnifera) - 10% export ratio. Adapotegen, reduces stress, enhances stamina. Standardized (Withanolides > 2.5%).
4. Turmeric Powder (Curcuma longa) - 12% export ratio. Powerful anti-inflammatory, high Curcumin (> 4.5%).
5. Jamun Powder (Syzygium cumini) - 8% export ratio. Pure seed powder, supports glycemic health and digestion.
6. Neem Powder (Azadirachta indica) - 8% export ratio. Blood purification, skin care, anti-microbial leaf powder.
7. White Musli Powder (Chlorophytum borivilianum) - 8% export ratio. Tuberous roots, extreme strength, vitality and stamina builder.
8. Shilajit Powder (Asphaltum punjabianum) - 6% export ratio. Himalayan rock extract, purified gold grade (Fulvic Acid > 50%), 84+ minerals.
9. Spinach Powder (Spinacia oleracea) - 6% export ratio. Rich in natural organic iron, lutein, folate, dehydrate grade.
10. Spirulina Powder (Arthrospira platensis) - 5% export ratio. Nutrient-dense superfood, high vegan protein, blue-green microalgae.
11. Beetroot Powder (Beta vulgaris) - 4% export ratio. High natural nitrates, athletic vascular stamina booster.
12. Amla Powder (Phyllanthus emblica) - 4% export ratio. Extreme Vitamin C content, immune defense, Ayurvedic hair/skin nutrient.
13. Triphala Powder (Amla + Haritaki + Bibhitaki 1:1:1) - 4% export ratio. Legendary colon cleaner, digestion and detoxifier.

Key Quality & Logistics Pillars:
- 100% Pure & Natural: No fillers, chemicals, or artificial preservatives.
- Lab-Certified Purity: Standardized active components, heavy metals, and microbiological reports (CoA) are pre-loaded and viewable on-site for 9 products (Moringa, Multani Mitti, Ashwagandha, Turmeric, Neem, Spinach, Spirulina, Beetroot, Amla). Direct users to click any product card and navigate to the "Lab CoA Sheet" tab to inspect the authentic test results. Other products can have CoAs requested on demand.
- Hygienic processing: Standardized milling to 80-100 mesh, packaged in double-poly lined bags inside robust 25kg fiber drums, or customized retail pouch packaging.
- global shipping: Sourced from pristine Indian farms, exported worldwide with Phytosanitary and customs clearances.

Conversation Guidelines:
- Keep answers professional, concise, reassuring, and highly business-focused.
- If asked about pricing, explain that bulk prices vary depending on order volume (kg/tons), shipment terms (FOB/CIF), air vs sea cargo, and private labeling. Always invite them to submit an inquiry through our interactive Export Quote calculator or contact Chaitanya Patel on WhatsApp (+1 780-699-0108) or Email (chaitanyapatel4@gmail.com) directly.
- Emphasize documentation (CoA, Phytosanitary, MSDS) to build trusts with foreign importers.
- Format text with clear bold subtitles or bullet points. Avoid clinical jargon, but show deep botanical and export expertise.`;

    // Map history to the format expected by the GoogleGenAI SDK
    // The SDK expects contents in the form of { role: 'user'|'model', parts: [{ text: '...' }] }
    const formattedContents = history.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content || msg.text || "" }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in AI Chat advisor:", error);
    res.status(500).json({ error: error.message || "AI Advisor is temporarily unavailable." });
  }
});

// Start server and handle Vite / Production routing
async function start() {
  if (process.env.NODE_ENV !== "production") {
    // Serve Vite dev server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Pure Herbal Goodness] Full-stack server running on http://localhost:${PORT}`);
  });
}

start();
