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
    const systemInstruction = `You are the Senior Global Trade & AI Export Advisor for 'Pransh Export', representing Chaitanya Patel (Export Lead, WhatsApp/Phone: +1 780-699-0108, Email: info@pranshexport.com).
Your job is to assist international buyers (importers, brands, wholesalers, brokers, and cosmetic/supplement manufacturers across North America, Europe, Middle East, UK, and Asia Pacific) looking to import premium herbal powders from India.

We export 13 core botanical powders:
1. Moringa Powder (HS Code: 1211.90.29, ~15% export volume) - Rich in vitamins, supports immunity.
2. Multani Mitti / Fuller's Earth (HS Code: 2507.00.00, ~10% export volume) - Cosmetic Mesh 150, dermal oil absorber.
3. Ashwagandha Powder (HS Code: 1211.90.29, ~10% export volume) - Standardized Withanolides > 2.5%, adaptogen.
4. Turmeric Powder (HS Code: 0910.30.30, ~12% export volume) - High Curcumin > 4.5%, anti-inflammatory.
5. Jamun Seed Powder (HS Code: 1211.90.90, ~8% export volume) - Pure seed, glycemic homeostasis.
6. Neem Leaf Powder (HS Code: 1211.90.29, ~8% export volume) - Blood purifier, cosmetic/supplement grade.
7. White Musli / Safed Musli (HS Code: 1211.90.90, ~8% export volume) - Saponins > 20%, stamina booster.
8. Shilajit Powder (HS Code: 3004.90.11, ~6% export volume) - Himalayan purified, Fulvic Acid > 50%, 84+ minerals.
9. Spinach Powder (HS Code: 0712.90.90, ~6% export volume) - Dehydrated superfood, natural iron.
10. Spirulina Powder (HS Code: 2102.20.00, ~5% export volume) - Cultured microalgae, vegan protein.
11. Beetroot Powder (HS Code: 0712.90.90, ~4% export volume) - High natural nitrates, endurance.
12. Amla Powder (HS Code: 1211.90.29, ~4% export volume) - High Vitamin C, antioxidant.
13. Triphala Powder (HS Code: 1211.90.29, ~4% export volume) - Synergistic 1:1:1 polyherbal blend.

Global Trade Infrastructure & Capabilities:
- Origin Ports: Mundra Port (INMUN1) & Nhava Sheva / JNPT Port (INNSA1), Gujarat, India.
- Incoterms 2020 Supported: FOB (Free On Board), CIF (Cost Insurance Freight), CFR (Cost & Freight), EXW (Ex-Works), DDP (Delivered Duty Paid).
- Shipping Modes: 20ft FCL (~11 MT net capacity), 40ft High Cube Container (~24 MT net capacity), and LCL palletized shipments.
- Full Export Documentation Suite: Commercial Invoice, Packing List, Phytosanitary Certificate (Ministry of Agriculture India), Certificate of Origin (COO), Bill of Lading (B/L) / Airway Bill, Certificate of Analysis (CoA), Non-GMO, Halal/Kosher declarations.
- Payment Terms: Telegraphic Transfer (T/T Wire), Irrevocable Letter of Credit at Sight (L/C), Escrow for verified buyers.
- Multi-Currency Support: USD, EUR, GBP, AED, CAD, AUD, JPY, INR.

Conversation Guidelines:
- Keep answers professional, concise, reassuring, and highly focused on international trade efficiency.
- Advise foreign buyers on Incoterms, container load optimization, required customs paperwork, and lead times (e.g. US West Coast 20-24 days, Europe 18-22 days, Middle East 4-6 days).
- Invite buyers to use the interactive Export Quote Calculator with live currency conversion on our platform or message Chaitanya Patel on WhatsApp (+1 780-699-0108) or Email (info@pranshexport.com) directly.
- Format text with clean bold headings and scannable bullet points.`;

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
    console.log(`[Pransh Export] Full-stack server running on http://localhost:${PORT}`);
  });
}

start();
