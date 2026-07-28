import React, { useState, useEffect, useRef } from "react";
import {
  Sprout,
  ShieldCheck,
  Cpu,
  Globe,
  Search,
  Calculator,
  MessageSquare,
  FileText,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  X,
  Check,
  Briefcase,
  Scale,
  Anchor,
  Truck,
  Send,
  Database,
  Lock,
  Unlock,
  Building,
  Menu,
  Heart,
  User,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HERBAL_PRODUCTS, EXPORTER_CONTACT, QUALITY_STANDARDS, HerbalProduct } from "./data/products";
import { COA_RECORDS } from "./data/coaData";
// @ts-ignore
import heroImage from "./assets/images/herbal_export_hero_1784589481051.jpg";

export default function App() {
  const [activeTab, setActiveTab] = useState<"catalog" | "chat" | "rfq" | "standards" | "admin">("catalog");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<HerbalProduct | null>(null);
  const [activeDialogTab, setActiveDialogTab] = useState<"details" | "coa">("details");

  // RFQ quantities state (product.id -> quantity in kg)
  const [rfqQuantities, setRfqQuantities] = useState<Record<number, number>>({
    1: 500, // Pre-fill Moringa with 500kg
    4: 250, // Pre-fill Turmeric with 250kg
  });

  // RFQ Submission form state
  const [buyerForm, setBuyerForm] = useState({
    buyerName: "",
    companyName: "",
    country: "",
    email: "",
    phone: "",
    whatsapp: "",
    shippingTerms: "FOB" as "FOB" | "CIF",
    destinationPort: "",
    notes: ""
  });
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiryResult, setInquiryResult] = useState<{ success: boolean; id?: string; error?: string } | null>(null);

  // Admin section: inquiries state
  const [inquiriesList, setInquiriesList] = useState<any[]>([]);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [selectedAdminInquiry, setSelectedAdminInquiry] = useState<any | null>(null);

  // Chatbot state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; content: string }>>([
    {
      role: "model",
      content: `Hello! I am your **AI Export & Herbal Advisor**. I can provide details on active compound percentages (like Curcumin or Withanolides), phytosanitary paperwork, export packaging, shipping times, or Ayurveda parameters for our 13 certified herbal powders. How can I help you import from India today?`
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  // Load inquiries for admin on mount & whenever tab changes to admin
  const fetchInquiries = async () => {
    try {
      const res = await fetch("/api/inquiries");
      if (res.ok) {
        const data = await res.json();
        setInquiriesList(data.inquiries || []);
      }
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [activeTab]);

  // Filter products by category & search query
  const filteredProducts = HERBAL_PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.benefits.some(b => b.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", "Immunity & Vitality", "Skin & Beauty", "Digestion & Detox", "Wellness & Strength"];

  // Chat helper: ask chatbot a pre-defined question
  const askPredefinedQuestion = (question: string) => {
    handleSendChatMessage(question);
  };

  const handleSendChatMessage = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    if (!textToSend) {
      setChatInput("");
    }

    const newUserMessage = { role: "user" as const, content: query };
    const updatedHistory = [...chatMessages, newUserMessage];
    setChatMessages(updatedHistory);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: updatedHistory }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [...prev, { role: "model", content: data.text }]);
      } else {
        const errData = await response.json();
        setChatMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: `**System Notice:** I couldn't connect to our server. Error: ${errData.error || "Unknown response"}. Please make sure your GEMINI_API_KEY is configured in the secrets menu.`
          }
        ]);
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "**System Notice:** Network request failed. Please check if the development server is running correctly."
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // RFQ functions
  const handleQuantityChange = (productId: number, val: number) => {
    if (val < 0) return;
    setRfqQuantities((prev) => {
      const next = { ...prev };
      if (val === 0) {
        delete next[productId];
      } else {
        next[productId] = val;
      }
      return next;
    });
  };

  const addProductToRfq = (product: HerbalProduct) => {
    setRfqQuantities((prev) => ({
      ...prev,
      [product.id]: prev[product.id] ? prev[product.id] + 100 : 100
    }));
    setActiveTab("rfq");
    // Scroll to the calculator container
    setTimeout(() => {
      document.getElementById("rfq-calculator")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const calculateTotalRfqWeight = (): number => {
    return (Object.values(rfqQuantities) as number[]).reduce((acc: number, curr: number) => acc + curr, 0);
  };

  const getRecommendedShippingMode = (weight: number) => {
    if (weight === 0) return { name: "No items selected", desc: "Select products above to determine shipping" };
    if (weight < 150) return { name: "Air Express (DHL / FedEx)", desc: "Best for high-value urgent samples under 150 kg." };
    if (weight < 1000) return { name: "Air Cargo (FOB/CIF)", desc: "Recommended for batches from 150 kg to 1 Metric Ton. Fast delivery." };
    if (weight < 5000) return { name: "LCL Sea Freight (Less Container Load)", desc: "Most cost-effective for shipments of 1 to 5 Tons." };
    return { name: "FCL Sea Freight (Full Container Load)", desc: "Optimal wholesale delivery for 5+ Metric Tons or multiple full pallets." };
  };

  // Submission of RFQ
  const handleRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalWeight = calculateTotalRfqWeight();
    if (totalWeight === 0) {
      alert("Please add at least one product with a quantity greater than 0 kg before submitting.");
      return;
    }

    setIsSubmittingInquiry(true);
    setInquiryResult(null);

    const productsData = Object.entries(rfqQuantities).map(([pId, qty]) => {
      const prod = HERBAL_PRODUCTS.find(p => p.id === Number(pId));
      return {
        productId: Number(pId),
        productName: prod ? prod.name : `Product #${pId}`,
        quantityKg: qty
      };
    });

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...buyerForm,
          products: productsData,
          totalWeight
        })
      });

      if (response.ok) {
        const data = await response.json();
        setInquiryResult({ success: true, id: data.inquiryId });
        // Clear quantities & form
        setRfqQuantities({});
        setBuyerForm({
          buyerName: "",
          companyName: "",
          country: "",
          email: "",
          phone: "",
          whatsapp: "",
          shippingTerms: "FOB",
          destinationPort: "",
          notes: ""
        });
        // refresh inquiries for admin view
        fetchInquiries();
      } else {
        const errData = await response.json();
        setInquiryResult({ success: false, error: errData.error || "Inquiry submission failed." });
      }
    } catch (err: any) {
      setInquiryResult({ success: false, error: "Network error occurred. Please try again." });
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // Admin login handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode.toLowerCase() === "admin" || adminPasscode === "7806990108") {
      setIsAdminAuthenticated(true);
      setAdminError("");
    } else {
      setAdminError("Invalid passcode. Use 'admin' or contact phone number for access.");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminPasscode("");
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1A3A34] font-sans selection:bg-[#1A3A34]/10 selection:text-[#1A3A34]">
      {/* Top Professional Header Info Bar */}
      <div className="bg-[#1A3A34] text-[#E8EDEA] py-2.5 px-4 text-xs md:text-sm font-medium border-b border-[#1A3A34]/10 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#E8EDEA] text-[#1A3A34] text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border border-[#1A3A34]/10">Bulk Exporter</span>
            <span className="opacity-90 font-light">Sourced Directly From Trusted Indian Farms & GMP Facilities</span>
          </div>
          <div className="flex items-center gap-4 text-[#E8EDEA]/90">
            <a href={`tel:${EXPORTER_CONTACT.phone}`} className="hover:text-white transition flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#E8EDEA]/70" /> {EXPORTER_CONTACT.phone} (Chaitanya Patel)
            </a>
            <span className="opacity-30">|</span>
            <a href={`https://wa.me/${EXPORTER_CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1 font-bold text-emerald-300">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> WhatsApp Support
            </a>
          </div>
        </div>
      </div>

      {/* Hero Header Presentation */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#1A3A34] to-[#112622] text-white">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src={heroImage}
            alt="Organic Indian Herbal Powders"
            className="w-full h-full object-cover filter brightness-75 scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0e1f1c] opacity-75 z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E8EDEA]/10 backdrop-blur-md rounded-full text-[#E8EDEA] text-xs font-bold tracking-widest uppercase mb-5 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" /> GLOBAL PHARMACEUTICAL GRADE
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-3">
            Pransh <span className="italic font-normal text-[#E8EDEA]">Export</span>
          </h1>
          <p className="font-serif italic text-white/80 text-lg md:text-2xl mb-8 tracking-wide">
            "Sourcing rare botanical species from certified organic plantations"
          </p>

          <p className="text-white/75 max-w-2xl mx-auto text-sm md:text-base mb-10 leading-relaxed font-light">
            We export a wide range of premium, high-potency herbal powders processed at optimal temperatures to retain bioavailability. 100% pure, ethically sourced, and laboratory-verified.
          </p>

          {/* Quick Pillar Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md shadow-sm">
              <Check className="w-5 h-5 mx-auto text-emerald-300 mb-1.5" />
              <div className="text-xs font-bold text-white">100% Natural</div>
              <div className="text-[10px] uppercase opacity-60 font-bold tracking-tighter">Zero Additives</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md shadow-sm">
              <ShieldCheck className="w-5 h-5 mx-auto text-[#E8EDEA] mb-1.5" />
              <div className="text-xs font-bold text-white">99.8% Purity</div>
              <div className="text-[10px] uppercase opacity-60 font-bold tracking-tighter">COA Dispatch</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md shadow-sm">
              <Sprout className="w-5 h-5 mx-auto text-emerald-300 mb-1.5" />
              <div className="text-xs font-bold text-white">Rich Nutrients</div>
              <div className="text-[10px] uppercase opacity-60 font-bold tracking-tighter">Bioactive Potency</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md shadow-sm">
              <Heart className="w-5 h-5 mx-auto text-rose-300 mb-1.5" />
              <div className="text-xs font-bold text-white">52+ Destinations</div>
              <div className="text-[10px] uppercase opacity-60 font-bold tracking-tighter">Global Shipping</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md shadow-sm col-span-2 md:col-span-1">
              <Globe className="w-5 h-5 mx-auto text-blue-300 mb-1.5" />
              <div className="text-xs font-bold text-white">Sustainable</div>
              <div className="text-[10px] uppercase opacity-60 font-bold tracking-tighter">Ethical Trade</div>
            </div>
          </div>

          {/* Interactive Navigation Menu tabs */}
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 bg-white/5 p-2 rounded-full max-w-3xl mx-auto border border-white/10 backdrop-blur-md shadow-sm">
            <button
              onClick={() => { setActiveTab("catalog"); setSelectedProduct(null); }}
              className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-full transition flex items-center gap-1.5 ${
                activeTab === "catalog"
                  ? "bg-white text-[#1A3A34] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sprout className="w-4 h-4" /> Herbal Catalog
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-full transition flex items-center gap-1.5 relative ${
                activeTab === "chat"
                  ? "bg-white text-[#1A3A34] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
            >
              <MessageSquare className="w-4 h-4" /> AI Export Advisor
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab("rfq")}
              className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-full transition flex items-center gap-1.5 ${
                activeTab === "rfq"
                  ? "bg-white text-[#1A3A34] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calculator className="w-4 h-4" /> Export Quote Calc
              {calculateTotalRfqWeight() > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {calculateTotalRfqWeight()}kg
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("standards")}
              className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-full transition flex items-center gap-1.5 ${
                activeTab === "standards"
                  ? "bg-white text-[#1A3A34] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Global Quality
            </button>

            <button
              onClick={() => setActiveTab("admin")}
              className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-full transition flex items-center gap-1.5 ${
                activeTab === "admin"
                  ? "bg-[#1A3A34] text-white border border-white/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Exporter Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Stage */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* ======================= TAB 1: PRODUCT CATALOG ======================= */}
        {activeTab === "catalog" && (
          <div id="product-catalog-section" className="space-y-8 animate-fade-in">
            {/* Catalog Introduction */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[#1A3A34]/10 shadow-sm">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-light text-[#1A3A34] mb-1">
                  Organic Herbal Powder Range
                </h2>
                <p className="text-[#1A3A34]/70 text-sm">
                  We export 13 premium varieties carefully standardized and packed for export. Sourced fresh.
                </p>
              </div>

              {/* Sourcing Badge */}
              <div className="flex items-center gap-2 bg-[#E8EDEA] border border-[#1A3A34]/10 px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4 text-[#1A3A34]" />
                <span className="text-xs font-bold text-[#1A3A34]">FOB India Ports (Mundra, Mumbai)</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#1A3A34]/50" />
                <input
                  type="text"
                  placeholder="Search botanical name, benefits, or active compounds (e.g. Curcumin, Ashwagandha...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white pl-12 pr-4 py-3 rounded-full border border-[#1A3A34]/10 text-sm focus:outline-none focus:border-[#1A3A34] focus:ring-1 focus:ring-[#1A3A34] transition shadow-xs text-[#1A3A34] placeholder-[#1A3A34]/40"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A3A34]/50 hover:text-[#1A3A34]">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Horizontal Filter Scroller */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? "bg-[#1A3A34] text-white shadow-sm"
                        : "bg-white text-[#1A3A34]/70 border border-[#1A3A34]/10 hover:bg-[#E8EDEA]/50 hover:text-[#1A3A34]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#1A3A34]/10 p-8 shadow-sm">
                <AlertTriangle className="w-12 h-12 text-[#1A3A34]/60 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-[#1A3A34] mb-1">No herbal powders found</h3>
                <p className="text-[#1A3A34]/70 text-sm max-w-md mx-auto">
                  We couldn't find any products matching "{searchQuery}". Try searching for active constituents or check another category.
                </p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                  className="mt-4 px-5 py-2.5 bg-[#1A3A34] text-white text-xs font-bold rounded-full hover:opacity-95 transition"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Products Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, idx) => {
                const isSelected = selectedProduct?.id === product.id;
                const activeQty = rfqQuantities[product.id] || 0;

                return (
                  <motion.div
                    key={product.id}
                    layoutId={`product-card-${product.id}`}
                    onClick={() => { setSelectedProduct(product); setActiveDialogTab("details"); }}
                    className="group bg-white rounded-2xl border border-[#1A3A34]/10 hover:border-[#1A3A34]/30 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col shadow-sm"
                  >
                    {/* Visual Card Header */}
                    <div className="p-5 pb-3 flex justify-between items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[#1A3A34] font-mono text-xs font-bold bg-[#E8EDEA] px-2 py-0.5 rounded-md">
                            #{product.id.toString().padStart(2, "0")}
                          </span>
                          <span className="text-[10px] font-bold text-[#1A3A34]/65 uppercase tracking-widest bg-[#E8EDEA]/40 px-2.5 py-0.5 rounded-full">
                            {product.category}
                          </span>
                          {COA_RECORDS[product.id] && (
                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 animate-pulse" /> CoA Lab Tested
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#1A3A34] group-hover:opacity-85 transition-opacity">
                          {product.name}
                        </h3>
                        <p className="text-xs italic text-[#1A3A34]/60">
                          {product.scientificName}
                        </p>
                      </div>

                      {/* Export Ratio Meter */}
                      <div className="text-center bg-[#E8EDEA]/40 border border-[#1A3A34]/5 p-2 rounded-xl">
                        <div className="text-xs font-mono font-bold text-[#1A3A34]">{product.exportRatio}%</div>
                        <div className="text-[8px] uppercase font-bold text-[#1A3A34]/50 tracking-wider">Export Ratio</div>
                      </div>
                    </div>

                    {/* Compact Description */}
                    <div className="px-5 py-2 flex-1">
                      <p className="text-[#1A3A34]/75 text-xs leading-relaxed line-clamp-3 mb-4">
                        {product.description}
                      </p>

                      {/* Quick benefits bullets */}
                      <div className="space-y-1.5 mb-4">
                        {product.benefits.map((benefit, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-1.5 text-xs text-[#1A3A34]/80">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Product Specifications Badge Ribbon */}
                    <div className="bg-[#FDFCF9] border-t border-[#1A3A34]/10 p-3.5 px-5 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="text-[#1A3A34]/50">Standard: </span>
                        <span className="font-bold text-[#1A3A34]/80">{product.grade.split(" (")[0]}</span>
                      </div>
                      {activeQty > 0 && (
                        <div className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                          {activeQty} kg in Quote
                        </div>
                      )}
                    </div>

                    {/* Hover Trigger Details Action */}
                    <div className="bg-[#1A3A34] p-3 text-center text-white text-xs font-bold transition-all duration-300 translate-y-full group-hover:translate-y-0 flex justify-center items-center gap-1">
                      Explore Technical Specifications & Order <ArrowRight className="w-4 h-4 text-[#E8EDEA]" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Product Quick-View Dialog Overlay */}
            <AnimatePresence>
              {selectedProduct && (
                <div className="fixed inset-0 bg-[#1A3A34]/40 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="bg-[#FDFCF9] rounded-2xl max-w-2xl w-full border border-[#1A3A34]/15 overflow-hidden shadow-2xl my-8 text-[#1A3A34]"
                  >
                    {/* Dialog Header */}
                    <div className="bg-[#1A3A34] text-white p-6 relative">
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-[#E8EDEA] text-[#1A3A34] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
                          {selectedProduct.category}
                        </span>
                        <span className="text-white/80 text-xs font-mono">
                          Standard Export Ratio: {selectedProduct.exportRatio}%
                        </span>
                      </div>

                      <h3 className="font-serif text-3xl font-light text-white mb-1">
                        {selectedProduct.name}
                      </h3>
                      <p className="text-[#E8EDEA] italic text-sm font-serif">
                        Botanical Name: {selectedProduct.scientificName}
                      </p>
                    </div>

                    {/* Tab Navigation (Pinned) */}
                    <div className="flex border-b border-[#1A3A34]/10 bg-[#FDFCF9] px-6">
                      <button
                        onClick={() => setActiveDialogTab("details")}
                        className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition ${
                          activeDialogTab === "details"
                            ? "border-[#1A3A34] text-[#1A3A34]"
                            : "border-transparent text-[#1A3A34]/50 hover:text-[#1A3A34]"
                        }`}
                      >
                        <Info className="w-4.5 h-4.5" /> Technical Specifications
                      </button>
                      <button
                        onClick={() => setActiveDialogTab("coa")}
                        className={`flex items-center gap-1.5 py-3 ml-6 text-xs font-bold border-b-2 transition ${
                          activeDialogTab === "coa"
                            ? "border-[#1A3A34] text-[#1A3A34]"
                            : "border-transparent text-[#1A3A34]/50 hover:text-[#1A3A34]"
                        }`}
                      >
                        <FileText className="w-4.5 h-4.5" /> Lab CoA Sheet
                        {COA_RECORDS[selectedProduct.id] && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1.5 animate-pulse">
                            Certified
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Dialog Content */}
                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                      {activeDialogTab === "coa" ? (
                        <div className="space-y-6">
                          {COA_RECORDS[selectedProduct.id] ? (
                            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-5 text-stone-800 shadow-xs relative overflow-hidden">
                              {/* Passed Banner */}
                              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-widest px-8 py-1.5 rotate-45 translate-x-6 translate-y-3 shadow-xs">
                                QC PASS
                              </div>

                              {/* Certificate Header */}
                              <div className="text-center pb-4 border-b-2 border-double border-stone-200">
                                <h4 className="font-serif text-lg font-bold text-[#1A3A34] uppercase tracking-wide">
                                  {COA_RECORDS[selectedProduct.id].title}
                                </h4>
                                <p className="text-[9px] text-[#1A3A34]/60 tracking-wider uppercase font-bold mt-0.5">
                                  Pransh Export • Quality Control Laboratory
                                </p>
                              </div>

                              {/* Certificate Metadata Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs py-1 border-b border-stone-100 pb-3">
                                <div className="flex justify-between sm:justify-start gap-2">
                                  <span className="text-stone-400">Product Name: </span>
                                  <strong className="text-[#1A3A34]">{COA_RECORDS[selectedProduct.id].productName}</strong>
                                </div>
                                <div className="flex justify-between sm:justify-start gap-2">
                                  <span className="text-stone-400">Batch No: </span>
                                  <strong className="text-stone-700 font-mono">{COA_RECORDS[selectedProduct.id].batchNo}</strong>
                                </div>
                                {COA_RECORDS[selectedProduct.id].botanicalName && (
                                  <div className="flex justify-between sm:justify-start gap-2">
                                    <span className="text-stone-400">Botanical Name: </span>
                                    <strong className="text-[#1A3A34] italic">{COA_RECORDS[selectedProduct.id].botanicalName}</strong>
                                  </div>
                                )}
                                <div className="flex justify-between sm:justify-start gap-2">
                                  <span className="text-stone-400">Mfg. Date: </span>
                                  <strong className="text-stone-700">{COA_RECORDS[selectedProduct.id].mfgDate}</strong>
                                </div>
                                <div className="flex justify-between sm:justify-start gap-2">
                                  <span className="text-stone-400">Best Before: </span>
                                  <strong className="text-stone-700">{COA_RECORDS[selectedProduct.id].expiryDate}</strong>
                                </div>
                                <div className="flex justify-between sm:justify-start gap-2 items-center">
                                  <span className="text-stone-400">Analysis Status: </span>
                                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 animate-pulse" /> COMPLIANT
                                  </span>
                                </div>
                              </div>

                              {/* Sections of Parameters */}
                              <div className="space-y-5">
                                {COA_RECORDS[selectedProduct.id].sections.map((section, sIdx) => (
                                  <div key={sIdx} className="space-y-2">
                                    <h5 className="text-[10px] uppercase font-bold text-[#1A3A34]/50 tracking-wider">
                                      {section.title}
                                    </h5>
                                    <div className="border border-stone-200/80 rounded-xl overflow-hidden shadow-2xs">
                                      {/* Table Header */}
                                      <div className="grid grid-cols-12 bg-stone-50 border-b border-stone-200/80 text-[10px] font-bold text-stone-500 p-2 px-3">
                                        <div className="col-span-5">Test Parameter</div>
                                        <div className="col-span-3">Standard Limit</div>
                                        <div className="col-span-4 text-right">Observation Result</div>
                                      </div>
                                      {/* Table Body */}
                                      <div className="divide-y divide-stone-100 text-xs">
                                        {section.parameters.map((param, pIdx) => (
                                          <div key={pIdx} className="grid grid-cols-12 p-2 px-3 items-center hover:bg-stone-50/40">
                                            <div className="col-span-5 font-medium text-stone-700">
                                              {param.parameter}
                                              {param.method && (
                                                <span className="block text-[9px] text-stone-400 font-light">Method: {param.method}</span>
                                              )}
                                            </div>
                                            <div className="col-span-3 text-stone-500 font-mono text-[11px]">{param.specification}</div>
                                            <div className="col-span-4 text-right">
                                              <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                                                param.result === "Complies" || param.result.includes("Complies") || param.result.includes("Passed") || param.result.includes("Compliant")
                                                  ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100"
                                                  : "bg-stone-100 text-stone-800 font-medium"
                                              }`}>
                                                {param.result}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Remarks Section */}
                              {COA_RECORDS[selectedProduct.id].remarks && (
                                <div className="bg-[#E8EDEA]/30 border border-[#1A3A34]/10 rounded-xl p-3 text-[11px] text-[#1A3A34]/80 leading-relaxed italic">
                                  <strong>Remarks:</strong> {COA_RECORDS[selectedProduct.id].remarks}
                                </div>
                              )}

                              {/* Certificate Stamp & Signatures */}
                              <div className="pt-4 border-t border-dashed border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-xs text-stone-400">
                                <div>
                                  <p>Laboratory Standards: <strong>GMP & ISO 9001:2015</strong></p>
                                  <p className="text-[10px] mt-0.5">Reference ID: PHG-LAB-2026-{selectedProduct.id.toString().padStart(3, "0")}</p>
                                </div>
                                <div className="text-right flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
                                  {/* Seal Stamp */}
                                  <div className="relative flex items-center justify-center w-14 h-14 border-2 border-double border-emerald-600/35 rounded-full text-[9px] text-emerald-600 font-bold uppercase select-none pointer-events-none transform -rotate-12">
                                    <div className="text-center leading-none">
                                      <div className="text-[8px] font-extrabold">APPROVED</div>
                                      <div className="text-[7px] opacity-75">QC LAB</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[#1A3A34] font-serif italic text-sm leading-none">Chaitanya Patel</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* CoA on Request state */
                            <div className="bg-white rounded-2xl border border-dashed border-[#1A3A34]/20 p-8 text-center space-y-4">
                              <div className="mx-auto w-12 h-12 bg-[#E8EDEA] rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-[#1A3A34]" />
                              </div>
                              <div className="space-y-1.5">
                                <h4 className="font-serif text-lg font-bold text-[#1A3A34]">CoA Certificate on Request</h4>
                                <p className="text-xs text-[#1A3A34]/70 max-w-sm mx-auto leading-relaxed">
                                  The batch testing report for <strong>{selectedProduct.name}</strong> is completely verified and stored securely in our compliance system. Standard testing covers heavy metals, microbiological limits, and moisture under 7%.
                                </p>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                                <a
                                  href={`https://wa.me/17806990108?text=Hello%20Pransh%20Export%2C%20I%20would%20like%20to%20request%20the%20latest%20lab%20Certificate%20of%20Analysis%20(CoA)%20for%20${encodeURIComponent(selectedProduct.name)}%20(${encodeURIComponent(selectedProduct.scientificName)})`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition shadow-xs"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Request CoA on WhatsApp
                                </a>
                                <button
                                  onClick={() => {
                                    setSelectedProduct(null);
                                    setActiveTab("chat");
                                    setTimeout(() => {
                                      askPredefinedQuestion(`Can you provide full sourcing and specifications details about ${selectedProduct.name} (${selectedProduct.scientificName})?`);
                                    }, 100);
                                  }}
                                  className="px-5 py-2.5 bg-[#E8EDEA] hover:bg-[#E8EDEA]/80 text-[#1A3A34] text-xs font-bold rounded-full transition"
                                >
                                  Ask AI about specifications
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Quote Action Addition */}
                          <div className="bg-[#E8EDEA]/20 border border-[#1A3A34]/10 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div>
                              <div className="text-xs font-bold text-[#1A3A34]/70">Add {selectedProduct.name} to your shipment?</div>
                              <div className="text-[11px] text-[#1A3A34]/60">Select custom quantities up to multi-ton FCL shipments.</div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              <button
                                onClick={() => {
                                  addProductToRfq(selectedProduct);
                                  setSelectedProduct(null);
                                }}
                                className="w-full sm:w-auto px-5 py-2.5 bg-[#1A3A34] text-white hover:opacity-95 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition"
                              >
                                <Calculator className="w-4 h-4 text-[#E8EDEA]" /> Add to Quote Calculator
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Description */}
                          <div>
                            <h4 className="text-xs uppercase font-extrabold text-[#1A3A34]/55 tracking-wider mb-2">Botanical & Farm Sourcing</h4>
                            <p className="text-[#1A3A34]/80 text-sm leading-relaxed bg-white p-4 rounded-2xl border border-[#1A3A34]/10 shadow-sm">
                              {selectedProduct.description}
                            </p>
                          </div>

                          {/* Specifications Table */}
                          <div className="bg-white rounded-2xl border border-[#1A3A34]/10 overflow-hidden shadow-sm">
                            <div className="grid grid-cols-3 border-b border-[#1A3A34]/5 p-3 text-xs bg-[#E8EDEA]/30">
                              <div className="font-bold text-[#1A3A34]/60">Specification</div>
                              <div className="col-span-2 font-bold text-[#1A3A34]/80">Export Standard Details</div>
                            </div>

                            <div className="grid grid-cols-3 border-b border-[#1A3A34]/5 p-3 text-xs">
                              <div className="font-bold text-[#1A3A34]/60">Quality Grade</div>
                              <div className="col-span-2 text-[#1A3A34] font-medium">{selectedProduct.grade}</div>
                            </div>

                            <div className="grid grid-cols-3 border-b border-[#1A3A34]/5 p-3 text-xs">
                              <div className="font-bold text-[#1A3A34]/60">Active Bioactives</div>
                              <div className="col-span-2 text-[#1A3A34] font-mono font-bold bg-[#E8EDEA] px-2 py-0.5 rounded w-fit">{selectedProduct.activeCompounds}</div>
                            </div>

                            <div className="grid grid-cols-3 p-3 text-xs">
                              <div className="font-bold text-[#1A3A34]/60">Standard Packaging</div>
                              <div className="col-span-2 text-[#1A3A34]">{selectedProduct.packaging}</div>
                            </div>
                          </div>

                          {/* Benefits Section */}
                          <div>
                            <h4 className="text-xs uppercase font-extrabold text-[#1A3A34]/55 tracking-wider mb-2">Core Health & Utility Benefits</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {selectedProduct.benefits.map((benefit, bIdx) => (
                                <div key={bIdx} className="bg-[#E8EDEA]/35 border border-[#1A3A34]/10 p-3 rounded-xl flex items-start gap-2">
                                  <Check className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                                  <span className="text-xs text-[#1A3A34]/85 font-semibold">{benefit}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Quote Action Addition */}
                          <div className="bg-[#E8EDEA]/20 border border-[#1A3A34]/10 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div>
                              <div className="text-xs font-bold text-[#1A3A34]/70">Need this in your bulk shipment?</div>
                              <div className="text-[11px] text-[#1A3A34]/60">We ship from 100 kg to multi-ton FCL shipments.</div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              <button
                                onClick={() => {
                                  addProductToRfq(selectedProduct);
                                  setSelectedProduct(null);
                                }}
                                className="w-full sm:w-auto px-5 py-2.5 bg-[#1A3A34] text-white hover:opacity-95 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition"
                              >
                                <Calculator className="w-4 h-4 text-[#E8EDEA]" /> Add to Quote Calculator
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Dialog Footer */}
                    <div className="bg-white p-4 px-6 flex justify-between items-center border-t border-[#1A3A34]/10">
                      <button
                        onClick={() => {
                          setSelectedProduct(null);
                          setActiveTab("chat");
                          setTimeout(() => {
                            askPredefinedQuestion(`Can you provide full sourcing and specifications details about ${selectedProduct.name} (${selectedProduct.scientificName})?`);
                          }, 100);
                        }}
                        className="text-[#1A3A34] hover:opacity-75 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <MessageSquare className="w-4 h-4" /> Ask AI about this product
                      </button>

                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="px-5 py-2.5 bg-[#E8EDEA] hover:bg-[#E8EDEA]/85 text-[#1A3A34] text-xs font-bold rounded-full transition"
                      >
                        Close Specifications
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ======================= TAB 2: AI EXPORT ADVISOR ======================= */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
            {/* Sidebar with Sourcing and FAQ guide */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <h3 className="font-serif text-lg font-bold text-[#1C3F24] mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-[#C19A5B]" /> Advisor Sourcing
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed mb-4">
                  Our intelligence is trained directly on our catalog specifications, Indian Ayurvedic standards, export guidelines, and phytosanitary certificate structures.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <span>Chemical constituents</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <span>Packing options</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <span>FOB & CIF logistics</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <span>COA & Lab test records</span>
                  </div>
                </div>
              </div>

              {/* Pre-defined Sourcing Prompts */}
              <div className="bg-[#FAF9F5] border border-[#C19A5B]/30 p-5 rounded-2xl">
                <h4 className="text-xs uppercase font-extrabold text-stone-600 tracking-wider mb-3">
                  Suggested Buyer Inquiries
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => askPredefinedQuestion("Which powders are best for premium organic cosmetics and skin clear formulations?")}
                    className="w-full text-left bg-white hover:bg-stone-50 border border-stone-200 p-2.5 rounded-xl text-xs text-stone-700 font-medium transition hover:border-[#1C3F24]/50"
                  >
                    "Best powders for organic cosmetics?"
                  </button>
                  <button
                    onClick={() => askPredefinedQuestion("What standard documents and certificates (like CoA, Phytosanitary) are included in our sea freight bulk exports?")}
                    className="w-full text-left bg-white hover:bg-stone-50 border border-stone-200 p-2.5 rounded-xl text-xs text-stone-700 font-medium transition hover:border-[#1C3F24]/50"
                  >
                    "What documents are included for shipping?"
                  </button>
                  <button
                    onClick={() => askPredefinedQuestion("Can you explain the Withanolides percentage in Ashwagandha and active Curcumin in Turmeric?")}
                    className="w-full text-left bg-white hover:bg-stone-50 border border-stone-200 p-2.5 rounded-xl text-xs text-stone-700 font-medium transition hover:border-[#1C3F24]/50"
                  >
                    "Explain active bioactives in Turmeric/Ashwagandha"
                  </button>
                  <button
                    onClick={() => askPredefinedQuestion("What is the standard packaging shelf life and MOQ for private-label superfood export?")}
                    className="w-full text-left bg-white hover:bg-stone-50 border border-stone-200 p-2.5 rounded-xl text-xs text-stone-700 font-medium transition hover:border-[#1C3F24]/50"
                  >
                    "MOQs and shelf life guidelines?"
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Sandbox Display */}
            <div className="lg:col-span-3 flex flex-col h-[650px] bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              {/* Chat Title bar */}
              <div className="bg-[#1C3F24] text-white p-4 px-6 flex justify-between items-center border-b border-[#234d2c]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center border border-[#C19A5B]/30">
                    <Sprout className="w-5 h-5 text-[#C19A5B]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm md:text-base">AI Export & Botanical Advisor</h3>
                    <p className="text-[10px] text-emerald-300">Powered by Gemini 3.5 Flash • Multi-lingual support</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[11px] text-emerald-100 font-bold">Online Sourcing Agent</span>
                </div>
              </div>

              {/* Chat Content Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FAF9F6] space-y-4">
                {chatMessages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={index}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-xs leading-relaxed ${
                          isUser
                            ? "bg-[#1C3F24] text-white rounded-tr-none"
                            : "bg-white text-stone-800 border border-stone-200 rounded-tl-none"
                        }`}
                      >
                        {/* Message Sender Title */}
                        <div className={`text-[10px] font-bold mb-1 opacity-65 ${isUser ? "text-emerald-200 text-right" : "text-[#C19A5B]"}`}>
                          {isUser ? "Prospective Importer" : "AI Sourcing Specialist"}
                        </div>

                        {/* Message content */}
                        <div className="whitespace-pre-line prose max-w-none text-xs md:text-sm">
                          {/* Parse bold strings simple format for readability */}
                          {msg.content.split("**").map((chunk, cIdx) => (
                            cIdx % 2 === 1 ? <strong key={cIdx} className="font-extrabold text-[#C19A5B]">{chunk}</strong> : chunk
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none p-4 text-sm shadow-xs max-w-[80%] flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-200"></span>
                      </div>
                      <span className="text-xs text-stone-500 font-medium">Analyzing botanical export standards...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Send Form */}
              <div className="p-4 bg-white border-t border-stone-150">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about active compounds, certificates, custom packaging, FOB pricing, or shipping times..."
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1C3F24] transition"
                    disabled={isChatLoading}
                  />
                  <button
                    type="submit"
                    className="bg-[#1C3F24] text-white hover:bg-[#122b18] px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-1 shrink-0 disabled:opacity-50"
                    disabled={isChatLoading || !chatInput.trim()}
                  >
                    Send <Send className="w-4 h-4 text-[#C19A5B]" />
                  </button>
                </form>

                <div className="mt-2 text-center text-[10px] text-stone-400 font-semibold flex justify-center items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-stone-400" />
                  Wholesale prices are custom formulated. You can immediately generate a Request for Quote in the next tab.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: RFQ & EXPORT CALCULATOR ======================= */}
        {activeTab === "rfq" && (
          <div id="rfq-calculator" className="space-y-8 animate-fade-in">
            {/* Introductory Guide */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1C3F24] mb-2 flex items-center gap-2">
                <Calculator className="w-7 h-7 text-[#C19A5B]" /> RFQ & Export Shipment Weight Calculator
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed max-w-4xl">
                Configure your wholesale container list by selecting products and adjusting requested weights in kilograms (MOQ is 100 kg per product). The calculator dynamically determines shipment parameters, recommended transport modes, and compares your request ratios against India's standard export ratios.
              </p>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left & Center: Products Quantities adjustment */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-xs">
                  <h3 className="font-serif text-lg font-bold text-[#1C3F24] border-b border-stone-100 pb-2">
                    Adjust Required Volume (Kg)
                  </h3>

                  {/* List of 13 Products in compact adjust list */}
                  <div className="divide-y divide-stone-100 max-h-[500px] overflow-y-auto pr-2 space-y-3">
                    {HERBAL_PRODUCTS.map((product) => {
                      const qty = rfqQuantities[product.id] || 0;

                      return (
                        <div key={product.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-stone-100 text-[#1C3F24] flex items-center justify-center font-mono text-[11px] font-bold">
                              {product.id}
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-stone-800">{product.name}</h4>
                              <p className="text-[11px] italic text-stone-400">{product.scientificName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            {/* Preset Buttons */}
                            <div className="flex items-center gap-1 mr-2">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, 0)}
                                className={`px-2 py-1 text-[10px] rounded font-bold transition ${
                                  qty === 0
                                    ? "bg-stone-100 text-stone-400"
                                    : "bg-stone-100 text-rose-600 hover:bg-rose-50"
                                }`}
                              >
                                Clear
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, 100)}
                                className="px-2 py-1 bg-[#1C3F24]/5 hover:bg-[#1C3F24]/10 text-[#1C3F24] text-[10px] rounded font-bold transition"
                              >
                                100 kg
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, 500)}
                                className="px-2 py-1 bg-[#1C3F24]/5 hover:bg-[#1C3F24]/10 text-[#1C3F24] text-[10px] rounded font-bold transition"
                              >
                                500 kg
                              </button>
                            </div>

                            {/* Manual adjustments */}
                            <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, Math.max(0, qty - 50))}
                                className="px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-extrabold transition"
                              >
                                -50
                              </button>
                              <input
                                type="number"
                                value={qty || ""}
                                onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                                className="w-16 text-center text-xs font-bold font-mono focus:outline-none focus:ring-0 focus:border-transparent py-1"
                                placeholder="0"
                              />
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, qty + 50)}
                                className="px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-extrabold transition"
                              >
                                +50
                              </button>
                            </div>
                            <span className="text-xs font-bold text-stone-500 font-mono w-6">kg</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sourcing Comparison visualization ratio */}
                {calculateTotalRfqWeight() > 0 && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
                    <h3 className="font-serif text-lg font-bold text-[#1C3F24] mb-3">
                      Order Weight Ratio Comparison
                    </h3>
                    <p className="text-stone-500 text-xs mb-4">
                      Compare the weight ratios of your selected powders relative to our standard annual export demand levels shown in the picture:
                    </p>

                    <div className="space-y-3">
                      {Object.entries(rfqQuantities).map(([pId, qty]) => {
                        const prod = HERBAL_PRODUCTS.find(p => p.id === Number(pId));
                        const qtyNum = Number(qty);
                        if (!prod || qtyNum === 0) return null;
                        const yourRatio = Math.round((qtyNum / calculateTotalRfqWeight()) * 100);

                        return (
                          <div key={pId} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-stone-700">{prod.name}</span>
                              <span className="font-mono text-stone-500">
                                Your Ratio: <strong className="text-[#1C3F24]">{yourRatio}%</strong> | Standard: <strong className="text-[#C19A5B]">{prod.exportRatio}%</strong>
                              </span>
                            </div>

                            {/* Dual Bar Graphic */}
                            <div className="space-y-1 bg-[#FAF9F6] p-2 rounded-lg border border-stone-100">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-stone-400 w-16 uppercase">Your Request</span>
                                <div className="flex-1 bg-stone-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-[#1C3F24] h-full rounded-full transition-all" style={{ width: `${Math.min(100, yourRatio)}%` }}></div>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-stone-600 w-6 text-right">{yourRatio}%</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-stone-400 w-16 uppercase">India Export</span>
                                <div className="flex-1 bg-stone-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-[#C19A5B] h-full rounded-full transition-all" style={{ width: `${prod.exportRatio}%` }}></div>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-[#C19A5B] w-6 text-right">{prod.exportRatio}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar: RFQ Invoice Form & submission */}
              <div className="space-y-6">
                {/* Dynamic Weight Summary Card */}
                <div className="bg-[#1C3F24] text-white p-6 rounded-2xl border border-stone-800 shadow-md">
                  <h3 className="font-serif text-lg font-bold text-[#C19A5B] mb-4 border-b border-white/10 pb-2">
                    Cargo Shipment Parameters
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-300 text-sm">Combined Shipment Weight</span>
                      <span className="font-mono text-lg font-extrabold text-white">
                        {calculateTotalRfqWeight().toLocaleString()} <span className="text-xs text-[#C19A5B]">KG</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-stone-300 text-sm">Equivalent Metric Tons</span>
                      <span className="font-mono text-lg font-extrabold text-white">
                        {(calculateTotalRfqWeight() / 1000).toFixed(3)} <span className="text-xs text-[#C19A5B]">Tons</span>
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2 mt-4">
                      <div className="flex items-center gap-1.5 text-[#C19A5B] font-bold text-xs uppercase tracking-wider">
                        <Truck className="w-4 h-4 text-emerald-400" /> Logistics Recommendation
                      </div>
                      <div className="text-sm font-bold text-white">
                        {getRecommendedShippingMode(calculateTotalRfqWeight()).name}
                      </div>
                      <div className="text-xs text-stone-300 leading-relaxed">
                        {getRecommendedShippingMode(calculateTotalRfqWeight()).desc}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RFQ Input Form */}
                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
                  <h3 className="font-serif text-lg font-bold text-[#1C3F24] mb-4 border-b border-stone-100 pb-2 flex items-center gap-1.5">
                    <FileText className="w-5 h-5 text-[#C19A5B]" /> Importer Contact Details
                  </h3>

                  <form onSubmit={handleRfqSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                        Buyer / Contact Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={buyerForm.buyerName}
                        onChange={(e) => setBuyerForm({ ...buyerForm, buyerName: e.target.value })}
                        placeholder="John Smith"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1C3F24]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                        Company Name / Legal Entity
                      </label>
                      <input
                        type="text"
                        value={buyerForm.companyName}
                        onChange={(e) => setBuyerForm({ ...buyerForm, companyName: e.target.value })}
                        placeholder="Botanicals Ltd."
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1C3F24]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                          Destination Country *
                        </label>
                        <input
                          type="text"
                          required
                          value={buyerForm.country}
                          onChange={(e) => setBuyerForm({ ...buyerForm, country: e.target.value })}
                          placeholder="United States"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1C3F24]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                          Destination Port
                        </label>
                        <input
                          type="text"
                          value={buyerForm.destinationPort}
                          onChange={(e) => setBuyerForm({ ...buyerForm, destinationPort: e.target.value })}
                          placeholder="Port of LA / Rotterdam"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1C3F24]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={buyerForm.email}
                        onChange={(e) => setBuyerForm({ ...buyerForm, email: e.target.value })}
                        placeholder="buyer@botanicalsltd.com"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1C3F24]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                          Business Phone
                        </label>
                        <input
                          type="text"
                          value={buyerForm.phone}
                          onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })}
                          placeholder="+1 555-0199"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1C3F24]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                          WhatsApp (For fast updates)
                        </label>
                        <input
                          type="text"
                          value={buyerForm.whatsapp}
                          onChange={(e) => setBuyerForm({ ...buyerForm, whatsapp: e.target.value })}
                          placeholder="+1 555-0199"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1C3F24]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                        Shipping Delivery Terms
                      </label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setBuyerForm({ ...buyerForm, shippingTerms: "FOB" })}
                          className={`py-2 text-xs font-bold rounded-lg transition border ${
                            buyerForm.shippingTerms === "FOB"
                              ? "bg-[#1C3F24] text-white border-[#1C3F24]"
                              : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                          }`}
                        >
                          FOB (Free on Board)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBuyerForm({ ...buyerForm, shippingTerms: "CIF" })}
                          className={`py-2 text-xs font-bold rounded-lg transition border ${
                            buyerForm.shippingTerms === "CIF"
                              ? "bg-[#1C3F24] text-white border-[#1C3F24]"
                              : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                          }`}
                        >
                          CIF (Insurance & Freight)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                        Custom specifications / Notes
                      </label>
                      <textarea
                        value={buyerForm.notes}
                        onChange={(e) => setBuyerForm({ ...buyerForm, notes: e.target.value })}
                        placeholder="Request specific mesh sizes, custom packaging drums, private labeling requests, or target pricing..."
                        rows={3}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1C3F24]"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingInquiry || calculateTotalRfqWeight() === 0}
                      className="w-full bg-[#C19A5B] hover:bg-[#a68147] text-stone-950 font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
                    >
                      {isSubmittingInquiry ? "Submitting Sourcing RFQ..." : "Request Wholesale Price Quote"}
                    </button>
                  </form>

                  {/* RFQ Submission Result Modal or Banner */}
                  <AnimatePresence>
                    {inquiryResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`mt-4 p-4 rounded-xl text-xs space-y-2 border ${
                          inquiryResult.success
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          {inquiryResult.success ? (
                            <>
                              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                              <span>RFQ Successfully Submitted!</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
                              <span>Submission Error</span>
                            </>
                          )}
                        </div>

                        <p className="leading-relaxed">
                          {inquiryResult.success
                            ? `Your Request for Quote has been logged into our database. Your ticket ID is: ${inquiryResult.id}. Our export specialist Chaitanya Patel will review your custom blend ratios and email you a formalized contract quote shortly.`
                            : inquiryResult.error}
                        </p>

                        {inquiryResult.success && (
                          <div className="pt-1.5 flex gap-2">
                            <a
                              href={`https://wa.me/${EXPORTER_CONTACT.whatsapp}?text=Hi Chaitanya, I just submitted RFQ ${inquiryResult.id} on your website. Please check and let me know.`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-md hover:bg-emerald-700 transition"
                            >
                              Follow up on WhatsApp
                            </a>
                            <button
                              onClick={() => setInquiryResult(null)}
                              className="text-[10px] font-bold text-stone-500 hover:text-stone-700"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 4: GLOBAL QUALITY STANDARDS ======================= */}
        {activeTab === "standards" && (
          <div className="space-y-12 animate-fade-in">
            {/* Certifications and Pillars Display */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="bg-[#C19A5B]/10 text-[#C19A5B] font-mono text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-[#C19A5B]/20">
                Uncompromising Quality
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#1C3F24] leading-tight">
                Our 4 Pillars of Export Excellence
              </h2>
              <p className="text-stone-600 text-sm md:text-base leading-relaxed">
                Indian herbs are prized globally for their phytochemical profiles. We protect this natural gift through rigorous standardizations at every phase.
              </p>
            </div>

            {/* Quality Standard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {QUALITY_STANDARDS.map((standard, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-[#1C3F24]/50 shadow-xs hover:shadow-md transition duration-300">
                  <div className="w-12 h-12 bg-[#1C3F24]/10 rounded-xl flex items-center justify-center mb-4 border border-[#C19A5B]/20">
                    {standard.icon === "Sprout" && <Sprout className="w-6 h-6 text-[#1C3F24]" />}
                    {standard.icon === "ShieldCheck" && <ShieldCheck className="w-6 h-6 text-[#1C3F24]" />}
                    {standard.icon === "Cpu" && <Cpu className="w-6 h-6 text-[#1C3F24]" />}
                    {standard.icon === "Globe" && <Globe className="w-6 h-6 text-[#1C3F24]" />}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#1C3F24] mb-2">{standard.title}</h3>
                  <p className="text-stone-500 text-xs leading-relaxed">{standard.description}</p>
                </div>
              ))}
            </div>

            {/* Custom Interactive Section: Certification of Analysis mockup */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-3 space-y-4">
                <span className="text-xs uppercase tracking-widest font-extrabold text-[#C19A5B]">Phytosanitary Compliance</span>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#1C3F24]">
                  Standard Export Documentation Pack
                </h3>
                <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
                  We supply a comprehensive suite of laboratory certifications and logistical documents with every custom container to guarantee effortless clearance through customs worldwide:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-stone-700 bg-stone-50 border border-stone-150 p-3 rounded-xl font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Certificate of Analysis (CoA)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700 bg-stone-50 border border-stone-150 p-3 rounded-xl font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Phytosanitary Certificate</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700 bg-stone-50 border border-stone-150 p-3 rounded-xl font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Non-GMO Verification Form</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700 bg-stone-50 border border-stone-150 p-3 rounded-xl font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Material Safety Data Sheets (MSDS)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="px-4 py-2 bg-[#1C3F24] hover:bg-[#122b18] text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                  >
                    Ask AI about documentation limits <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 bg-[#FAF9F5] border border-stone-200 p-6 rounded-2xl space-y-4">
                <h4 className="font-serif font-bold text-stone-800 border-b border-stone-200 pb-2 flex items-center gap-1.5">
                  <FileText className="w-5 h-5 text-[#C19A5B]" /> Spec Verification Mockup
                </h4>

                <div className="space-y-3 font-mono text-[10px] text-stone-600">
                  <div className="flex justify-between border-b border-stone-150 pb-1">
                    <span>Exporter:</span>
                    <span className="font-bold text-[#1C3F24]">Pransh Export</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-150 pb-1">
                    <span>Batch Code:</span>
                    <span>IN-MNG-2026-07</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-150 pb-1">
                    <span>Moisture Content:</span>
                    <span className="text-emerald-700 font-bold">&lt; 6.5% (Conforms)</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-150 pb-1">
                    <span>Mesh Size Standard:</span>
                    <span>80 - 100 mesh</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-150 pb-1">
                    <span>Heavy Metals Assay:</span>
                    <span className="text-emerald-700 font-bold">Non-detectable</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salmonella / E. Coli:</span>
                    <span className="text-emerald-700 font-bold">Absent in 25g</span>
                  </div>
                </div>

                <div className="text-[10px] text-stone-400 italic leading-relaxed text-center mt-2 border-t border-stone-200 pt-2">
                  *This conforms to standards set by APEDA (Agricultural and Processed Food Products Export Development Authority), Govt of India.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 5: ADMIN INQUIRIES PORTAL ======================= */}
        {activeTab === "admin" && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {/* Authenticated Admin Dashboard Display */}
            {isAdminAuthenticated ? (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1C3F24] flex items-center gap-2">
                      <Database className="w-6 h-6 text-[#C19A5B]" /> Exporter CRM Inquiries Log
                    </h2>
                    <p className="text-stone-500 text-xs">
                      Logged in as Exporter Lead. Reviewing Request for Quotes (RFQs) and shipping inquiries.
                    </p>
                  </div>
                  <button
                    onClick={handleAdminLogout}
                    className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
                  >
                    <Unlock className="w-3.5 h-3.5" /> Logout Dashboard
                  </button>
                </div>

                {/* Inquiries table/list */}
                {inquiriesList.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-stone-100 p-8">
                    <InboxIcon className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                    <h3 className="font-serif text-lg font-bold text-stone-700">No Inquiries Found</h3>
                    <p className="text-stone-400 text-xs max-w-sm mx-auto mt-1">
                      No export RFQs have been submitted yet. Try creating a request in the "Export Quote Calc" tab, then return here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Panel: List */}
                    <div className="md:col-span-1 space-y-3 max-h-[550px] overflow-y-auto pr-1">
                      {inquiriesList.map((inq) => (
                        <div
                          key={inq.id}
                          onClick={() => setSelectedAdminInquiry(inq)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                            selectedAdminInquiry?.id === inq.id
                              ? "bg-[#1C3F24]/5 border-[#1C3F24] shadow-xs"
                              : "bg-white border-stone-200 hover:border-stone-400"
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] text-stone-400 font-bold mb-1">
                            <span className="font-mono text-[#C19A5B]">{inq.id}</span>
                            <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-bold text-xs text-stone-800 line-clamp-1">{inq.buyerName}</h4>
                          <div className="text-[10px] text-stone-500 font-semibold flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3" /> {inq.companyName}
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-stone-100">
                            <span className="bg-[#1C3F24]/10 text-[#1C3F24] text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                              {inq.country}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-stone-700">{inq.totalWeight} kg</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Panel: Detail view */}
                    <div className="md:col-span-2">
                      {selectedAdminInquiry ? (
                        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 text-left shadow-xs">
                          {/* Details Header */}
                          <div className="flex justify-between items-start border-b border-stone-100 pb-4">
                            <div>
                              <div className="text-[10px] font-mono font-bold text-stone-400 mb-1">
                                TICKET ID: {selectedAdminInquiry.id} • RECEIVED: {new Date(selectedAdminInquiry.createdAt).toLocaleString()}
                              </div>
                              <h3 className="font-serif text-2xl font-bold text-[#1C3F24]">
                                {selectedAdminInquiry.buyerName}
                              </h3>
                              <p className="text-xs text-stone-500 font-bold flex items-center gap-1.5 mt-1">
                                <Building className="w-4 h-4 text-[#C19A5B]" /> {selectedAdminInquiry.companyName} ({selectedAdminInquiry.country})
                              </p>
                            </div>

                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                              {selectedAdminInquiry.status}
                            </span>
                          </div>

                          {/* Contact information */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF9F5] p-4 rounded-xl border border-stone-150">
                            <div className="text-xs space-y-1">
                              <div className="font-bold text-stone-400 uppercase tracking-wider text-[9px]">Email Coordinates</div>
                              <a href={`mailto:${selectedAdminInquiry.email}`} className="font-bold text-[#1C3F24] hover:underline block">
                                {selectedAdminInquiry.email}
                              </a>
                            </div>

                            <div className="text-xs space-y-1">
                              <div className="font-bold text-stone-400 uppercase tracking-wider text-[9px]">Phone / WhatsApp</div>
                              <div className="font-bold text-stone-800">
                                {selectedAdminInquiry.phone || "No direct phone"} {selectedAdminInquiry.whatsapp && `(WA: ${selectedAdminInquiry.whatsapp})`}
                              </div>
                            </div>

                            <div className="text-xs space-y-1 col-span-1 sm:col-span-2 border-t border-stone-200 pt-2">
                              <div className="font-bold text-stone-400 uppercase tracking-wider text-[9px]">Shipping Terms requested</div>
                              <div className="font-bold text-stone-800 uppercase flex items-center gap-1.5 mt-0.5">
                                <Anchor className="w-4 h-4 text-emerald-600" />
                                {selectedAdminInquiry.shippingTerms} {selectedAdminInquiry.destinationPort && `to Port of ${selectedAdminInquiry.destinationPort}`}
                              </div>
                            </div>
                          </div>

                          {/* Requested Products list */}
                          <div>
                            <h4 className="font-bold text-xs text-stone-500 uppercase tracking-wider mb-2">Requested Herbal Inventory List</h4>
                            <div className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-stone-100 text-stone-600 font-bold uppercase text-[9px]">
                                  <tr>
                                    <th className="p-3">Powder Item</th>
                                    <th className="p-3 text-right">Requested Weight</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200 font-medium text-stone-800">
                                  {selectedAdminInquiry.products.map((p: any) => (
                                    <tr key={p.productId}>
                                      <td className="p-3">{p.productName}</td>
                                      <td className="p-3 text-right font-mono font-bold">{p.quantityKg.toLocaleString()} kg</td>
                                    </tr>
                                  ))}
                                  <tr className="bg-stone-100 font-bold text-stone-900 border-t-2 border-stone-300">
                                    <td className="p-3">Combined Order Weight</td>
                                    <td className="p-3 text-right font-mono text-sm">{selectedAdminInquiry.totalWeight.toLocaleString()} kg</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Special notes */}
                          {selectedAdminInquiry.notes && (
                            <div>
                              <h4 className="font-bold text-xs text-stone-500 uppercase tracking-wider mb-1">Buyer Sourcing Specifications</h4>
                              <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl text-xs text-stone-700 leading-relaxed font-mono whitespace-pre-wrap">
                                {selectedAdminInquiry.notes}
                              </div>
                            </div>
                          )}

                          {/* Action controls */}
                          <div className="pt-2 flex gap-2 border-t border-stone-100">
                            <a
                              href={`mailto:${selectedAdminInquiry.email}?subject=Export Quote Ticket ${selectedAdminInquiry.id} - Pransh Export&body=Dear ${selectedAdminInquiry.buyerName}, Thank you for your inquiry on our website. Sourcing ${selectedAdminInquiry.totalWeight} kg. Sincere regards, Chaitanya Patel`}
                              className="px-4 py-2 bg-[#1C3F24] hover:bg-[#122b18] text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                            >
                              <Mail className="w-4 h-4 text-[#C19A5B]" /> Send Email Quote Quote
                            </a>
                            <a
                              href={`https://wa.me/${selectedAdminInquiry.whatsapp || selectedAdminInquiry.phone}?text=Hi ${selectedAdminInquiry.buyerName}, This is Chaitanya Patel from Pransh Export. Sourcing ticket ${selectedAdminInquiry.id}. Let us coordinate.`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                            >
                              <Phone className="w-4 h-4" /> Message WhatsApp
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 p-8">
                          <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">
                            Select an Inquiry Ticket from the left pane to view full parameters
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 max-w-md mx-auto text-center shadow-md space-y-6">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-[#C19A5B]">
                  <Lock className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif text-xl font-bold text-[#1C3F24]">Exporter Portal Authorization</h3>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    This section is restricted for Chaitanya Patel to review submitted RFQ requests. Use passcode <strong className="font-mono text-stone-700 bg-stone-100 px-1 rounded">admin</strong> or phone number to unlock.
                  </p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-3">
                  <input
                    type="password"
                    placeholder="Enter Passcode..."
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-center text-sm focus:outline-none focus:border-[#1C3F24]"
                  />
                  {adminError && <p className="text-rose-600 text-[11px] font-bold">{adminError}</p>}
                  <button
                    type="submit"
                    className="w-full bg-[#1C3F24] hover:bg-[#122b18] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
                  >
                    Authorize Access
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Trust & Guarantee Section bottom ribbon */}
      <section className="bg-[#E8EDEA]/40 border-y border-[#1A3A34]/10 py-12 px-4 mt-16 text-[#1A3A34]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider opacity-60">Export Sourcing</h4>
            <p className="text-xs text-[#1A3A34]/80 leading-relaxed font-light">
              We source directly from chemical-free farmers in pristine agrarian regions including Rajasthan, Gujarat, Salem, and high-altitude Himalayan valleys.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider opacity-60">Purity Guarantee</h4>
            <p className="text-xs text-[#1A3A34]/80 leading-relaxed font-light">
              Our botanical powders undergo micro-milling in clean facilities to match exact specifications, certified with Certificate of Analysis (CoA) records.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider opacity-60">Moisture & Storage</h4>
            <p className="text-xs text-[#1A3A34]/80 leading-relaxed font-light">
              Standard moisture remains under 7% across all batches. Stored in climate-controlled warehouses to retain natural biological integrity.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider opacity-60">Logistics Routing</h4>
            <p className="text-xs text-[#1A3A34]/80 leading-relaxed font-light">
              Export shipments route through Mumbai (JNPT) or Mundra ports. Air express routing is also available for bulk samples and urgent custom batches.
            </p>
          </div>
        </div>
      </section>

      {/* Premium Elegant Footer */}
      <footer className="bg-[#1A3A34] text-[#E8EDEA] py-16 px-4 border-t border-[#1A3A34]/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-3">
            <h3 className="font-serif text-2xl font-light text-white flex items-center justify-center md:justify-start gap-1.5">
              <Sprout className="w-5 h-5 text-[#E8EDEA]" /> Pransh <span className="italic font-normal text-white/90">Export</span>
            </h3>
            <p className="text-xs text-white/70 max-w-sm leading-relaxed font-light">
              Trusted global exporter of premium Ayurvedic herbal powders from Gujarat, India.
            </p>
            <p className="text-[10px] text-white/50">
              Lead Officer: <strong className="text-white">Chaitanya Patel</strong> (WhatsApp/Phone: +1 780-699-0108)
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3 text-xs">
            <div className="flex items-center gap-4 text-white/80">
              <button onClick={() => { setActiveTab("catalog"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-white transition">Product Range</button>
              <span>•</span>
              <button onClick={() => { setActiveTab("chat"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-white transition">AI Sourcing Advisor</button>
              <span>•</span>
              <button onClick={() => { setActiveTab("rfq"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-white transition">Quote Calculator</button>
            </div>
            <div className="text-[10px] text-white/40 font-mono">
              © {new Date().getFullYear()} Pransh Export. All rights reserved. Sourced with Care. Delivered with Trust.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Fallback Inbox icon if not loaded properly
function InboxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}
