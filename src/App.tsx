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
  Info,
  Ship,
  Coins,
  Container,
  Clock,
  FileCheck,
  ChevronDown,
  ArrowUpRight,
  PackageCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  HERBAL_PRODUCTS,
  EXPORTER_CONTACT,
  QUALITY_STANDARDS,
  HerbalProduct,
  CURRENCIES,
  GLOBAL_PORTS,
  INCOTERMS_DETAILS,
  CONTAINER_LOADS,
  TRADE_DOCUMENTS,
  Currency,
  TradePort
} from "./data/products";
import { COA_RECORDS } from "./data/coaData";
// @ts-ignore
import heroImage from "./assets/images/herbal_export_hero_1784589481051.jpg";

interface InquiryRecord {
  id: string;
  buyerName: string;
  companyName: string;
  email: string;
  phone: string;
  whatsapp: string;
  country: string;
  destinationPort: string;
  shippingTerms: string;
  currencyCode: string;
  notes: string;
  products: { productId: number; productName: string; quantityKg: number; unitFobUsd: number }[];
  totalWeight: number;
  estTotalPriceUsd: number;
  createdAt: string;
  status: string;
}

export function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"catalog" | "trade-routes" | "chat" | "rfq" | "standards" | "admin">("catalog");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Currency selection
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  // Selected product modal
  const [selectedProduct, setSelectedProduct] = useState<HerbalProduct | null>(null);
  const [activeDialogTab, setActiveDialogTab] = useState<"details" | "coa">("details");

  // Documentation viewer modal
  const [viewingDocModal, setViewingDocModal] = useState<typeof TRADE_DOCUMENTS[0] | null>(null);

  // RFQ Calculator State
  const [rfqQuantities, setRfqQuantities] = useState<{ [key: number]: number }>({
    1: 500, // Default 500kg Moringa
    3: 200  // Default 200kg Ashwagandha
  });
  const [selectedPort, setSelectedPort] = useState<TradePort>(GLOBAL_PORTS[0]);
  const [buyerForm, setBuyerForm] = useState({
    buyerName: "",
    companyName: "",
    email: "",
    phone: "",
    whatsapp: "",
    country: "United States",
    destinationPort: "Port of Los Angeles / Long Beach",
    shippingTerms: "CIF" as "FOB" | "CIF" | "CFR" | "EXW" | "DDP",
    notes: ""
  });
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiryResult, setInquiryResult] = useState<{ success: boolean; id?: string; error?: string } | null>(null);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; content: string }>>([
    {
      role: "model",
      content: `Welcome to **Pransh Export** - Global Trade & Herbal Export Portal. I am your Senior Export Advisor.

We export 13 premium botanical powders directly from Gujarat, India to importers, brands, and pharmaceutical manufacturers worldwide.

**How can I assist your trade inquiry today?**
• Check HS Codes, active bioactives, or mesh sizes
• Calculate CIF / FOB freight estimations to your destination port
• Inquire about Phytosanitary Certificates & CoA compliance
• Configure custom container loads (20ft FCL / 40ft HQ / LCL)`
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Admin Dashboard State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [adminError, setAdminError] = useState("");
  const [inquiriesList, setInquiriesList] = useState<InquiryRecord[]>([]);
  const [selectedAdminInquiry, setSelectedAdminInquiry] = useState<InquiryRecord | null>(null);

  // Categories list
  const categories = ["All", "Immunity & Vitality", "Skin & Beauty", "Digestion & Detox", "Wellness & Strength"];

  // Filter products by search and category
  const filteredProducts = HERBAL_PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.activeCompounds.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.hsCode.includes(searchQuery) ||
      product.benefits.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Scroll chat to bottom on updates
  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  // Load admin inquiries when admin tab is accessed
  useEffect(() => {
    if (activeTab === "admin" && isAdminAuthenticated) {
      fetchAdminInquiries();
    }
  }, [activeTab, isAdminAuthenticated]);

  const fetchAdminInquiries = async () => {
    try {
      const res = await fetch("/api/inquiries");
      if (res.ok) {
        const data = await res.json();
        setInquiriesList(data);
        if (data.length > 0 && !selectedAdminInquiry) {
          setSelectedAdminInquiry(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin inquiries", err);
    }
  };

  // Helper currency conversion formatter
  const formatPrice = (usdAmount: number) => {
    const converted = usdAmount * selectedCurrency.rateToUsd;
    if (selectedCurrency.code === "JPY" || selectedCurrency.code === "INR") {
      return `${selectedCurrency.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${selectedCurrency.symbol}${converted.toFixed(2)}`;
  };

  // Calculate RFQ weight
  const calculateTotalRfqWeight = (): number => {
    return (Object.values(rfqQuantities) as number[]).reduce((acc: number, curr: number) => acc + (Number(curr) || 0), 0);
  };

  // Calculate estimated total FOB price in USD
  const calculateTotalFobUsd = (): number => {
    return (Object.entries(rfqQuantities) as [string, number][]).reduce((acc: number, [pId, qty]) => {
      const prod = HERBAL_PRODUCTS.find((p) => p.id === Number(pId));
      if (!prod || !qty) return acc;
      return acc + prod.fobPriceUsdPerKg * Number(qty);
    }, 0);
  };

  // Calculate estimated CIF cost in USD
  const calculateTotalCifUsd = (): number => {
    const totalFob = calculateTotalFobUsd();
    const totalKg = calculateTotalRfqWeight();
    const oceanFreightAndInsurance = totalKg * selectedPort.cifEstPerKgUsd;
    return totalFob + oceanFreightAndInsurance;
  };

  // Recommended shipping mode helper
  const getRecommendedShippingMode = (weightKg: number) => {
    if (weightKg <= 0) return { name: "No cargo selected", desc: "Select quantities to calculate" };
    if (weightKg < 2000) return { name: "LCL Consolidated Pallet Shipment", desc: "Consolidated sea freight with moisture barrier palletization." };
    if (weightKg < 18000) return { name: "20ft FCL Full Container Load", desc: "Dedicated 20ft ocean container (~11 to 18 MT net capacity)." };
    return { name: "40ft High Cube FCL Container", desc: "Maximum ocean economy for bulk wholesale orders (~24 MT net capacity)." };
  };

  // Handle quantity changes in RFQ
  const handleQuantityChange = (productId: number, qty: number) => {
    setRfqQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, qty)
    }));
  };

  // Add product to RFQ
  const addProductToRfq = (product: HerbalProduct) => {
    setRfqQuantities((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 100
    }));
    setActiveTab("rfq");
  };

  // Handle Chat Message Send
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user" as const, content: userMessage }];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: newMessages.slice(0, -1)
        })
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      setChatMessages((prev) => [
        ...prev,
        { role: "model", content: data.text || "I apologize, I am temporarily unable to fetch specifications." }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Connection temporary error. Please contact **Chaitanya Patel** directly on WhatsApp at **+1 780-699-0108** or email **info@pranshexport.com**."
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Pre-defined question trigger
  const askPredefinedQuestion = (qText: string) => {
    setChatInput(qText);
    setTimeout(() => {
      handleSendChatMessage();
    }, 100);
  };

  // Handle RFQ Form Submission
  const handleRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalWeight = calculateTotalRfqWeight();

    if (totalWeight <= 0) {
      alert("Please specify at least 100 kg for one product before requesting a quote.");
      return;
    }

    setIsSubmittingInquiry(true);
    setInquiryResult(null);

    const productPayload = Object.entries(rfqQuantities)
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([pId, qty]) => {
        const prod = HERBAL_PRODUCTS.find((p) => p.id === Number(pId));
        return {
          productId: Number(pId),
          productName: prod?.name || `Product #${pId}`,
          quantityKg: Number(qty),
          unitFobUsd: prod?.fobPriceUsdPerKg || 0
        };
      });

    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...buyerForm,
          currencyCode: selectedCurrency.code,
          destinationPort: selectedPort.portName,
          products: productPayload,
          totalWeight,
          estTotalPriceUsd: buyerForm.shippingTerms === "FOB" ? calculateTotalFobUsd() : calculateTotalCifUsd()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInquiryResult({ success: true, id: data.inquiryId });
      } else {
        setInquiryResult({ success: false, error: data.error || "Failed to log inquiry" });
      }
    } catch (err: any) {
      setInquiryResult({ success: false, error: err.message || "Network error submitting inquiry" });
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // Admin Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === "admin" || adminPasscode === "7806990108") {
      setIsAdminAuthenticated(true);
      setAdminError("");
    } else {
      setAdminError("Invalid exporter passcode. Please try 'admin' or contact Chaitanya Patel.");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminPasscode("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-slate-800 selection:text-amber-300">
      {/* GLOBAL TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 text-slate-800 border-b border-slate-200 shadow-xs backdrop-blur-md">
        {/* Top Ticker Ribbon */}
        <div className="bg-slate-100 text-slate-600 text-xs py-2 px-4 border-b border-slate-200">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-3 text-[11px] overflow-x-auto whitespace-nowrap scrollbar-none w-full sm:w-auto">
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                <Ship className="w-3.5 h-3.5 text-emerald-600" /> Origin Ports: Mundra (INMUN1) & Nhava Sheva (INNSA1)
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-700 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Incoterms 2020: FOB • CIF • CFR • EXW • DDP
              </span>
            </div>

            {/* Direct Contact & Currency Selector */}
            <div className="flex items-center gap-4 text-[11px]">
              <a
                href={`https://wa.me/${EXPORTER_CONTACT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-700 transition flex items-center gap-1 font-bold text-slate-800"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> +1 780-699-0108
              </a>

              {/* Currency Dropdown Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-900 px-2.5 py-1 rounded border border-slate-300 font-mono font-bold transition text-[11px] shadow-xs"
                >
                  <span>{selectedCurrency.flag}</span>
                  <span>{selectedCurrency.code} ({selectedCurrency.symbol})</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                <AnimatePresence>
                  {isCurrencyDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 text-slate-800"
                    >
                      <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                        Select Pricing Currency
                      </div>
                      {CURRENCIES.map((curr) => (
                        <button
                          key={curr.code}
                          onClick={() => {
                            setSelectedCurrency(curr);
                            setIsCurrencyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-100 transition ${
                            selectedCurrency.code === curr.code ? "bg-amber-50 text-amber-900 font-bold" : "text-slate-700"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{curr.flag}</span>
                            <span>{curr.code}</span>
                          </span>
                          <span className="font-mono text-slate-500 text-[10px]">{curr.symbol}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Main Branding & Navigation Header */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/10 border border-amber-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                  Pransh <span className="text-amber-600">Export</span>
                </h1>
                <span className="bg-blue-50 text-blue-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-blue-200">
                  Global B2B Trade
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Bulk Organic Botanical Exporter • Gujarat, India • Lead Officer: Chaitanya Patel
              </p>
            </div>
          </div>

          {/* Navigation Tab Pills */}
          <nav className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "catalog"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <Sprout className="w-4 h-4" /> Products Range
            </button>

            <button
              onClick={() => setActiveTab("trade-routes")}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "trade-routes"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <Ship className="w-4 h-4" /> Shipping & Ports
            </button>

            <button
              onClick={() => setActiveTab("rfq")}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 relative ${
                activeTab === "rfq"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <Calculator className="w-4 h-4" /> Quote Calc
              {calculateTotalRfqWeight() > 0 && (
                <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  {(calculateTotalRfqWeight() / 1000).toFixed(1)}T
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "chat"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600" /> AI Trade Advisor
            </button>

            <button
              onClick={() => setActiveTab("standards")}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "standards"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Quality Standards
            </button>

            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "admin"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Admin
            </button>
          </nav>
        </div>
      </header>

      {/* HERO BANNER SECTION */}
      <section className="relative bg-gradient-to-r from-slate-50 via-amber-50/40 to-blue-50/50 text-slate-900 overflow-hidden py-12 md:py-16 px-4 border-b border-slate-200">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-100/90 border border-emerald-300 text-emerald-900 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-emerald-700" /> India's Premier Botanical Export House
            </div>

            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light text-slate-900 leading-tight">
              Sourced in India. <br />
              <span className="font-bold text-amber-700 underline decoration-amber-400/80 underline-offset-8">
                Trusted Across 40+ Nations.
              </span>
            </h1>

            <p className="text-slate-700 text-sm md:text-base leading-relaxed max-w-2xl font-normal">
              Pransh Export specializes in international bulk shipments of 100% pure, lab-certified botanical powders. Sourced from sustainable farms in Gujarat and Rajasthan, micro-milled under GMP standards, and shipped with full phytosanitary clearance.
            </p>

            {/* Global Trade Feature Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/90 border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="text-amber-700 font-mono font-bold text-lg">13 Core</div>
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Botanical Powders</div>
              </div>
              <div className="bg-white/90 border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="text-emerald-700 font-mono font-bold text-lg">100% CoA</div>
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Lab Certified</div>
              </div>
              <div className="bg-white/90 border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="text-blue-700 font-mono font-bold text-lg">FCL / LCL</div>
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Container Ocean</div>
              </div>
              <div className="bg-white/90 border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="text-amber-800 font-mono font-bold text-lg">4-24 Days</div>
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Global Port Transit</div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setActiveTab("rfq")}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" /> Calculate Shipping & Quote
              </button>
              <button
                onClick={() => setActiveTab("trade-routes")}
                className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3 rounded-xl text-xs transition border border-slate-300 shadow-xs flex items-center gap-2"
              >
                <Ship className="w-4 h-4 text-blue-600" /> View Global Shipping Routes
              </button>
            </div>
          </div>

          {/* Hero Media Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl group bg-white">
              <img
                src={heroImage}
                alt="Pransh Export - Global Botanical Trade Logistics"
                className="w-full h-[320px] md:h-[380px] object-cover transform group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

              {/* Overlay Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 text-slate-900 shadow-xl space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Export Standard
                  </span>
                  <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold border border-slate-200">
                    APEDA & Phytosanitary
                  </span>
                </div>
                <p className="text-slate-600 text-xs font-normal leading-relaxed">
                  Bulk packaging in 25kg double-walled food-grade LDPE liners inside fiber export drums.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ======================= TAB 1: PRODUCT CATALOG ======================= */}
        {activeTab === "catalog" && (
          <div id="product-catalog-section" className="space-y-8 animate-fade-in">
            {/* Catalog Introduction */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-900">
                    Botanical Export Catalog
                  </h2>
                  <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                    13 Active Products
                  </span>
                </div>
                <p className="text-slate-600 text-sm">
                  Displaying unit FOB price estimates in <strong className="text-amber-600 font-mono">{selectedCurrency.code} ({selectedCurrency.symbol})</strong>.
                  All items are available in 25kg fiber drums up to multi-ton FCL shipments.
                </p>
              </div>

              {/* Sourcing Badge */}
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">Origin: Mundra & Nhava Sheva Ports, India</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search botanical name, HS Code, or active compounds (e.g. 1211.90.29, Curcumin, Ashwagandha...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition shadow-xs text-slate-800 placeholder-slate-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? "bg-amber-400 text-slate-950 shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-slate-800 mb-1">No herbal powders found</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  We couldn't find any products matching "{searchQuery}". Try searching for active constituents or check another category.
                </p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                  className="mt-4 px-5 py-2.5 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-300 transition"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const activeQty = rfqQuantities[product.id] || 0;

                return (
                  <motion.div
                    key={product.id}
                    layoutId={`product-card-${product.id}`}
                    onClick={() => { setSelectedProduct(product); setActiveDialogTab("details"); }}
                    className="group bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col shadow-xs"
                  >
                    {/* Visual Card Header */}
                    <div className="p-5 pb-3 flex justify-between items-start border-b border-slate-100">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="text-slate-700 font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded">
                            HS {product.hsCode}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
                            {product.category}
                          </span>
                          {COA_RECORDS[product.id] && (
                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Lab Certified
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-amber-800 transition">
                          {product.name}
                        </h3>
                        <p className="text-xs italic text-slate-500 font-serif">
                          {product.scientificName}
                        </p>
                      </div>

                      {/* FOB Price Badge */}
                      <div className="text-right bg-slate-50 border border-slate-200 p-2 rounded-xl">
                        <div className="text-xs font-mono font-extrabold text-slate-900">
                          {formatPrice(product.fobPriceUsdPerKg)}
                        </div>
                        <div className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Est. FOB / kg</div>
                      </div>
                    </div>

                    {/* Compact Description */}
                    <div className="p-5 py-3 flex-1">
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-3">
                        {product.description}
                      </p>

                      {/* Benefits bullets */}
                      <div className="space-y-1 mb-3">
                        {product.benefits.map((benefit, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-1.5 text-xs text-slate-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Specifications Ribbon */}
                    <div className="bg-slate-50 border-t border-slate-200 p-3 px-5 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="text-slate-400">Bioactive: </span>
                        <span className="font-bold text-slate-800">{product.activeCompounds}</span>
                      </div>
                      {activeQty > 0 && (
                        <div className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 text-[10px]">
                          {activeQty} kg in Quote
                        </div>
                      )}
                    </div>

                    {/* Hover Trigger Details Action */}
                    <div className="bg-slate-100 p-3 text-center text-slate-800 font-bold text-xs transition-all duration-300 flex justify-center items-center gap-1 group-hover:bg-amber-400 group-hover:text-slate-950 border-t border-slate-200">
                      View Technical Specs & CoA <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Product Quick-View Dialog Overlay */}
            <AnimatePresence>
              {selectedProduct && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 overflow-hidden shadow-2xl my-8 text-slate-800"
                  >
                    {/* Dialog Header */}
                    <div className="bg-slate-900 text-white p-6 relative">
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-amber-400 text-slate-950 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full">
                          {selectedProduct.category}
                        </span>
                        <span className="text-slate-300 text-xs font-mono">
                          HS Code: {selectedProduct.hsCode}
                        </span>
                      </div>

                      <h3 className="font-serif text-3xl font-bold text-white mb-1">
                        {selectedProduct.name}
                      </h3>
                      <p className="text-amber-300 italic text-sm font-serif">
                        Botanical Name: {selectedProduct.scientificName}
                      </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-200 bg-slate-50 px-6">
                      <button
                        onClick={() => setActiveDialogTab("details")}
                        className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition ${
                          activeDialogTab === "details"
                            ? "border-slate-900 text-slate-900"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Info className="w-4.5 h-4.5" /> Technical Specifications
                      </button>
                      <button
                        onClick={() => setActiveDialogTab("coa")}
                        className={`flex items-center gap-1.5 py-3 ml-6 text-xs font-bold border-b-2 transition ${
                          activeDialogTab === "coa"
                            ? "border-slate-900 text-slate-900"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <FileText className="w-4.5 h-4.5" /> Lab CoA Sheet
                        {COA_RECORDS[selectedProduct.id] && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1.5">
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
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 text-slate-800 shadow-xs relative overflow-hidden">
                              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-widest px-8 py-1.5 rotate-45 translate-x-6 translate-y-3 shadow-xs">
                                QC PASS
                              </div>

                              <div className="text-center pb-4 border-b-2 border-double border-slate-200">
                                <h4 className="font-serif text-lg font-bold text-slate-900 uppercase tracking-wide">
                                  {COA_RECORDS[selectedProduct.id].title}
                                </h4>
                                <p className="text-[9px] text-slate-500 tracking-wider uppercase font-bold mt-0.5">
                                  Pransh Export • Quality Control Laboratory
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs py-1 border-b border-slate-100 pb-3">
                                <div className="flex justify-between sm:justify-start gap-2">
                                  <span className="text-slate-400">Product Name: </span>
                                  <strong className="text-slate-900">{COA_RECORDS[selectedProduct.id].productName}</strong>
                                </div>
                                <div className="flex justify-between sm:justify-start gap-2">
                                  <span className="text-slate-400">Batch No: </span>
                                  <strong className="text-slate-700 font-mono">{COA_RECORDS[selectedProduct.id].batchNo}</strong>
                                </div>
                                <div className="flex justify-between sm:justify-start gap-2">
                                  <span className="text-slate-400">HS Customs Code: </span>
                                  <strong className="text-slate-800 font-mono">{selectedProduct.hsCode}</strong>
                                </div>
                                <div className="flex justify-between sm:justify-start gap-2">
                                  <span className="text-slate-400">Mfg. Date: </span>
                                  <strong className="text-slate-700">{COA_RECORDS[selectedProduct.id].mfgDate}</strong>
                                </div>
                              </div>

                              {/* Sections of Parameters */}
                              <div className="space-y-4">
                                {COA_RECORDS[selectedProduct.id].sections.map((section, sIdx) => (
                                  <div key={sIdx} className="space-y-1.5">
                                    <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                      {section.title}
                                    </h5>
                                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                                      <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 p-2 px-3">
                                        <div className="col-span-5">Test Parameter</div>
                                        <div className="col-span-3">Standard Limit</div>
                                        <div className="col-span-4 text-right">Observation Result</div>
                                      </div>
                                      <div className="divide-y divide-slate-100 text-xs">
                                        {section.parameters.map((param, pIdx) => (
                                          <div key={pIdx} className="grid grid-cols-12 p-2 px-3 items-center">
                                            <div className="col-span-5 font-medium text-slate-800">{param.parameter}</div>
                                            <div className="col-span-3 text-slate-500 font-mono text-[11px]">{param.specification}</div>
                                            <div className="col-span-4 text-right font-mono text-[11px] text-emerald-700 font-bold">
                                              {param.result}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-4">
                              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                              <h4 className="font-serif text-lg font-bold text-slate-900">CoA Certificate Available On Demand</h4>
                              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                                Standard testing covers heavy metals, microbial assay, and moisture under 7%.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div>
                            <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2">Botanical Sourcing & Profile</h4>
                            <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                              {selectedProduct.description}
                            </p>
                          </div>

                          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
                            <div className="grid grid-cols-3 border-b border-slate-100 p-3 bg-slate-50 font-bold text-slate-500">
                              <div>Specification</div>
                              <div className="col-span-2">Export Standard</div>
                            </div>
                            <div className="grid grid-cols-3 border-b border-slate-100 p-3">
                              <div className="text-slate-400 font-semibold">Harmonized HS Code</div>
                              <div className="col-span-2 text-slate-900 font-mono font-bold">{selectedProduct.hsCode}</div>
                            </div>
                            <div className="grid grid-cols-3 border-b border-slate-100 p-3">
                              <div className="text-slate-400 font-semibold">Quality Grade</div>
                              <div className="col-span-2 text-slate-900 font-medium">{selectedProduct.grade}</div>
                            </div>
                            <div className="grid grid-cols-3 border-b border-slate-100 p-3">
                              <div className="text-slate-400 font-semibold">Bioactive Concentration</div>
                              <div className="col-span-2 text-slate-900 font-mono font-bold">{selectedProduct.activeCompounds}</div>
                            </div>
                            <div className="grid grid-cols-3 p-3">
                              <div className="text-slate-400 font-semibold">Export Packaging</div>
                              <div className="col-span-2 text-slate-900">{selectedProduct.packaging}</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Dialog Footer */}
                    <div className="bg-slate-50 p-4 px-6 flex justify-between items-center border-t border-slate-200">
                      <button
                        onClick={() => {
                          addProductToRfq(selectedProduct);
                          setSelectedProduct(null);
                        }}
                        className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5"
                      >
                        <Calculator className="w-4 h-4" /> Add to Quote Calculator
                      </button>

                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ======================= TAB 2: GLOBAL TRADE & SHIPPING ROUTES ======================= */}
        {activeTab === "trade-routes" && (
          <div className="space-y-10 animate-fade-in">
            {/* Intro Header */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
                    <Ship className="w-4 h-4" /> Maritime Logistics Hub
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-900">
                    Global Shipping Routes & Incoterms 2020
                  </h2>
                  <p className="text-slate-600 text-sm mt-1 max-w-3xl">
                    Pransh Export dispatches containerized shipments from Mundra Port (INMUN1) and Nhava Sheva JNPT Port (INNSA1). Review transit estimates, container specifications, and required trade documents below.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("rfq")}
                  className="px-5 py-2.5 bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 shadow-xs"
                >
                  <Calculator className="w-4 h-4" /> Calculate Destination Freight
                </button>
              </div>
            </div>

            {/* Ports Matrix Grid */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                <Anchor className="w-5 h-5 text-blue-600" /> Major Destination Ports & Estimated Transit
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {GLOBAL_PORTS.map((port) => (
                  <div
                    key={port.code}
                    onClick={() => {
                      setSelectedPort(port);
                      setBuyerForm((prev) => ({ ...prev, country: port.country, destinationPort: port.portName }));
                      setActiveTab("rfq");
                    }}
                    className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl">{port.flag}</span>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                          {port.code}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition leading-snug">
                        {port.portName}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{port.country}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" /> {port.transitDays}
                      </span>
                      <span className="text-blue-600 font-bold group-hover:underline">Select Port</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incoterms 2020 Grid */}
            <div className="bg-gradient-to-br from-amber-50/60 via-white to-blue-50/50 text-slate-900 rounded-2xl p-6 md:p-8 space-y-6 border border-slate-200 shadow-xs">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700">Incoterms 2020 Standard</span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mt-1">Flexible Commercial Shipping Terms</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(INCOTERMS_DETAILS).map(([code, details]) => (
                  <div key={code} className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm font-extrabold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded border border-amber-200">
                        {code}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{details.name.split(" - ")[1]}</span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed font-normal">{details.description}</p>
                    <div className="text-[10px] text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      <strong>Recommended for:</strong> {details.recommendedFor}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Container Load Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CONTAINER_LOADS.map((load, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center font-bold">
                    <Container className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{load.type}</h4>
                  <div className="text-xl font-mono font-extrabold text-blue-700">
                    {(load.netWeightKg / 1000).toFixed(0)} Metric Tons Capacity
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">{load.description}</p>
                </div>
              ))}
            </div>

            {/* Trade Documentation Suite Section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" /> Complete Export Documentation Suite
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Every container shipment leaves with a verified, legalized document package to ensure instant customs clearance.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TRADE_DOCUMENTS.map((doc) => (
                  <div
                    key={doc.code}
                    onClick={() => setViewingDocModal(doc)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition cursor-pointer bg-slate-50 hover:bg-white group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        {doc.code}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 mb-1">{doc.name}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{doc.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentation Modal */}
            <AnimatePresence>
              {viewingDocModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        DOCUMENT CODE: {viewingDocModal.code}
                      </span>
                      <button onClick={() => setViewingDocModal(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-slate-900">{viewingDocModal.name}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{viewingDocModal.description}</p>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                      <div className="text-slate-500 font-bold uppercase text-[10px]">Standard Attributes</div>
                      <div className="text-slate-700">• Issued under Govt of India APEDA regulations</div>
                      <div className="text-slate-700">• Includes HS Codes, batch codes, net/gross weights</div>
                      <div className="text-slate-700">• Legalized for international bank L/C negotiations</div>
                    </div>

                    <button
                      onClick={() => setViewingDocModal(null)}
                      className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs"
                    >
                      Close Preview
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ======================= TAB 3: EXPORT QUOTE CALCULATOR ======================= */}
        {activeTab === "rfq" && (
          <div id="rfq-calculator" className="space-y-8 animate-fade-in">
            {/* Guide Header */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-7 h-7 text-amber-500" /> Export Quote & Freight Calculator
                </h2>
                <p className="text-slate-600 text-sm mt-1 max-w-3xl">
                  Adjust requested quantities per product (MOQ 100 kg). Prices dynamically calculate FOB or CIF costs in <strong className="text-amber-600 font-mono">{selectedCurrency.code} ({selectedCurrency.symbol})</strong> with live freight estimations to your destination port.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-bold">Currency:</span>
                <span className="font-mono text-xs font-extrabold text-slate-900">{selectedCurrency.flag} {selectedCurrency.code}</span>
              </div>
            </div>

            {/* Calculator Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Products Quantities Selector */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                  <h3 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Select Herbal Quantities (Kilograms)
                  </h3>

                  {/* List of 13 Products */}
                  <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-2 space-y-3">
                    {HERBAL_PRODUCTS.map((product) => {
                      const qty = rfqQuantities[product.id] || 0;
                      const lineFobUsd = product.fobPriceUsdPerKg * qty;

                      return (
                        <div key={product.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[11px] font-bold">
                              #{product.id}
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-slate-900">{product.name}</h4>
                              <p className="text-[11px] italic text-slate-400 font-serif">
                                HS {product.hsCode} • {formatPrice(product.fobPriceUsdPerKg)}/kg FOB
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <div className="flex items-center gap-1 mr-2">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, 0)}
                                className="px-2 py-1 text-[10px] rounded font-bold transition bg-slate-100 text-slate-500 hover:bg-slate-200"
                              >
                                Clear
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, 100)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] rounded font-bold transition"
                              >
                                100 kg
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, 500)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] rounded font-bold transition"
                              >
                                500 kg
                              </button>
                            </div>

                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, Math.max(0, qty - 50))}
                                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-extrabold transition"
                              >
                                -50
                              </button>
                              <input
                                type="number"
                                value={qty || ""}
                                onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                                className="w-16 text-center text-xs font-bold font-mono py-1 focus:outline-none"
                                placeholder="0"
                              />
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, qty + 50)}
                                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-extrabold transition"
                              >
                                +50
                              </button>
                            </div>
                            <span className="text-xs font-bold text-slate-500 font-mono w-6">kg</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Panel: Invoice Summary & RFQ Submission */}
              <div className="space-y-6">
                {/* Dynamic Summary Card */}
                <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex justify-between items-center">
                    <span>Export Cargo Valuation</span>
                    <span className="text-xs font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">{selectedCurrency.code}</span>
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Combined Net Weight</span>
                      <span className="font-mono text-base font-extrabold text-slate-900">
                        {calculateTotalRfqWeight().toLocaleString()} kg ({ (calculateTotalRfqWeight() / 1000).toFixed(2) } MT)
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total FOB India Cost</span>
                      <span className="font-mono text-base font-extrabold text-amber-800">
                        {formatPrice(calculateTotalFobUsd())}
                      </span>
                    </div>

                    {buyerForm.shippingTerms === "CIF" && (
                      <div className="flex justify-between items-center text-xs text-slate-600 border-t border-slate-100 pt-2">
                        <span>Ocean Freight & Marine Insurance ({selectedPort.code})</span>
                        <span className="font-mono font-bold text-slate-800">
                          +{formatPrice(calculateTotalRfqWeight() * selectedPort.cifEstPerKgUsd)}
                        </span>
                      </div>
                    )}

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1 text-xs">
                      <div className="text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Truck className="w-4 h-4 text-emerald-600" /> Mode: {getRecommendedShippingMode(calculateTotalRfqWeight()).name}
                      </div>
                      <p className="text-slate-600">{getRecommendedShippingMode(calculateTotalRfqWeight()).desc}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-base font-bold">
                      <span className="text-slate-800 uppercase tracking-wider text-xs">Est. Total ({buyerForm.shippingTerms})</span>
                      <span className="font-mono text-2xl font-black text-emerald-700">
                        {formatPrice(buyerForm.shippingTerms === "FOB" ? calculateTotalFobUsd() : calculateTotalCifUsd())}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RFQ Submission Form */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <h3 className="font-serif text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <FileText className="w-5 h-5 text-amber-500" /> Importer Contact Details
                  </h3>

                  <form onSubmit={handleRfqSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Buyer Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={buyerForm.buyerName}
                        onChange={(e) => setBuyerForm({ ...buyerForm, buyerName: e.target.value })}
                        placeholder="John Smith"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Company Name / Legal Entity
                      </label>
                      <input
                        type="text"
                        value={buyerForm.companyName}
                        onChange={(e) => setBuyerForm({ ...buyerForm, companyName: e.target.value })}
                        placeholder="Global Botanicals LLC"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={buyerForm.email}
                        onChange={(e) => setBuyerForm({ ...buyerForm, email: e.target.value })}
                        placeholder="import@globalbotanicals.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Destination Port *
                        </label>
                        <select
                          value={selectedPort.code}
                          onChange={(e) => {
                            const p = GLOBAL_PORTS.find((p) => p.code === e.target.value);
                            if (p) setSelectedPort(p);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-slate-800 font-bold"
                        >
                          {GLOBAL_PORTS.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.flag} {p.portName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Shipping Terms
                        </label>
                        <select
                          value={buyerForm.shippingTerms}
                          onChange={(e: any) => setBuyerForm({ ...buyerForm, shippingTerms: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-slate-800 font-bold"
                        >
                          <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                          <option value="FOB">FOB (Free On Board Origin)</option>
                          <option value="CFR">CFR (Cost & Freight)</option>
                          <option value="EXW">EXW (Ex-Works Factory)</option>
                          <option value="DDP">DDP (Delivered Duty Paid)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        WhatsApp / Phone (For fast updates)
                      </label>
                      <input
                        type="text"
                        value={buyerForm.whatsapp}
                        onChange={(e) => setBuyerForm({ ...buyerForm, whatsapp: e.target.value })}
                        placeholder="+1 555-0199"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Special Packaging / Private Labeling Notes
                      </label>
                      <textarea
                        value={buyerForm.notes}
                        onChange={(e) => setBuyerForm({ ...buyerForm, notes: e.target.value })}
                        placeholder="Request specific mesh sizes, custom packaging drums, private labeling requests, or target pricing..."
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingInquiry || calculateTotalRfqWeight() === 0}
                      className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isSubmittingInquiry ? "Submitting RFQ..." : "Submit Formal Wholesale Quote Request"}
                    </button>
                  </form>

                  {/* Submission Result */}
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
                              <span>RFQ Logged! Ticket ID: {inquiryResult.id}</span>
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
                            ? `Your Request for Quote has been logged into our database. Our export specialist Chaitanya Patel will review your custom blend ratios and email you a formalized contract quote shortly.`
                            : inquiryResult.error}
                        </p>

                        {inquiryResult.success && (
                          <div className="pt-1 flex gap-2">
                            <a
                              href={`https://wa.me/${EXPORTER_CONTACT.whatsapp}?text=Hi Chaitanya, I just submitted RFQ ${inquiryResult.id} on your website. Please check.`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-md hover:bg-emerald-700 transition"
                            >
                              Message on WhatsApp
                            </a>
                            <button
                              onClick={() => setInquiryResult(null)}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-700"
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

        {/* ======================= TAB 4: AI EXPORT ADVISOR ======================= */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
            {/* Sidebar Guide */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-amber-500" /> Trade Advisor Sourcing
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Trained on our product specifications, Incoterms 2020, HS customs codes, phytosanitary requirements, and container logistics.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Incoterms & Freight Advice</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Phytosanitary & CoA Records</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Container Load Calculations</span>
                  </div>
                </div>
              </div>

              {/* Prompts list */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <h4 className="text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-3">
                  Suggested Buyer Inquiries
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => askPredefinedQuestion("What are the HS codes and active bioactive percentages for Turmeric and Ashwagandha?")}
                    className="w-full text-left bg-white hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 font-medium transition"
                  >
                    "HS Codes & bioactive percentages?"
                  </button>
                  <button
                    onClick={() => askPredefinedQuestion("How long is maritime transit from Mundra Port to Port of Rotterdam or Los Angeles?")}
                    className="w-full text-left bg-white hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 font-medium transition"
                  >
                    "Shipping transit times to Europe/US?"
                  </button>
                  <button
                    onClick={() => askPredefinedQuestion("What documents are included in the standard export package for customs clearance?")}
                    className="w-full text-left bg-white hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 font-medium transition"
                  >
                    "Documents included for customs?"
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Display */}
            <div className="lg:col-span-3 flex flex-col h-[650px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-bold">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm md:text-base">AI Global Export Advisor</h3>
                    <p className="text-[10px] text-amber-300 font-mono">Gemini 3.5 Flash • Multi-lingual Trade AI</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[11px] text-slate-200 font-bold">Online</span>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 space-y-4">
                {chatMessages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-xs leading-relaxed ${
                          isUser
                            ? "bg-slate-900 text-white rounded-tr-none"
                            : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                        }`}
                      >
                        <div className={`text-[10px] font-bold mb-1 ${isUser ? "text-amber-300 text-right" : "text-amber-600"}`}>
                          {isUser ? "Prospective Importer" : "AI Sourcing Specialist"}
                        </div>
                        <div className="whitespace-pre-line prose max-w-none text-xs md:text-sm">
                          {msg.content.split("**").map((chunk, cIdx) => (
                            cIdx % 2 === 1 ? <strong key={cIdx} className="font-extrabold text-amber-600">{chunk}</strong> : chunk
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 text-sm shadow-xs flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200"></span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">Consulting export regulations & database...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Form */}
              <div className="p-4 bg-white border-t border-slate-200">
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
                    placeholder="Ask about active compounds, HS codes, freight calculations, or port transit times..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-800 transition"
                    disabled={isChatLoading}
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-amber-300 px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-1 shrink-0 disabled:opacity-50"
                    disabled={isChatLoading || !chatInput.trim()}
                  >
                    Send <Send className="w-4 h-4 text-amber-300" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 5: QUALITY STANDARDS ======================= */}
        {activeTab === "standards" && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="bg-amber-100 text-amber-900 font-mono text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-amber-200">
                Quality Verification Framework
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                Our 4 Pillars of Export Excellence
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Indian herbs are prized globally for their phytochemical profiles. We protect this natural gift through rigorous standardizations at every phase.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {QUALITY_STANDARDS.map((standard, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-400 shadow-xs transition">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                    {standard.icon === "Sprout" && <Sprout className="w-6 h-6" />}
                    {standard.icon === "ShieldCheck" && <ShieldCheck className="w-6 h-6" />}
                    {standard.icon === "Cpu" && <Cpu className="w-6 h-6" />}
                    {standard.icon === "Globe" && <Globe className="w-6 h-6" />}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">{standard.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{standard.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB 6: ADMIN PORTAL ======================= */}
        {activeTab === "admin" && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {isAdminAuthenticated ? (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Database className="w-6 h-6 text-amber-500" /> Exporter CRM Inquiries Log
                    </h2>
                    <p className="text-slate-500 text-xs">Reviewing submitted Request for Quotes (RFQs)</p>
                  </div>
                  <button
                    onClick={handleAdminLogout}
                    className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition"
                  >
                    Logout
                  </button>
                </div>

                {inquiriesList.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                    <p className="text-slate-400 text-xs">No export RFQs submitted yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-3 max-h-[500px] overflow-y-auto">
                      {inquiriesList.map((inq) => (
                        <div
                          key={inq.id}
                          onClick={() => setSelectedAdminInquiry(inq)}
                          className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                            selectedAdminInquiry?.id === inq.id ? "bg-slate-100 border-slate-900" : "bg-white border-slate-200"
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                            <span className="font-mono text-amber-600">{inq.id}</span>
                            <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900">{inq.buyerName}</h4>
                          <p className="text-[10px] text-slate-500">{inq.companyName} ({inq.country})</p>
                          <div className="mt-2 text-right font-mono text-xs font-bold text-slate-800">{inq.totalWeight} kg</div>
                        </div>
                      ))}
                    </div>

                    <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                      {selectedAdminInquiry ? (
                        <>
                          <div className="border-b border-slate-100 pb-3">
                            <div className="text-[10px] font-mono text-slate-400">TICKET: {selectedAdminInquiry.id}</div>
                            <h3 className="font-serif text-2xl font-bold text-slate-900">{selectedAdminInquiry.buyerName}</h3>
                            <p className="text-xs text-slate-500">{selectedAdminInquiry.companyName} • {selectedAdminInquiry.country}</p>
                          </div>

                          <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl">
                            <div><strong>Email:</strong> {selectedAdminInquiry.email}</div>
                            <div><strong>WhatsApp:</strong> {selectedAdminInquiry.whatsapp || "N/A"}</div>
                            <div><strong>Terms:</strong> {selectedAdminInquiry.shippingTerms} to {selectedAdminInquiry.destinationPort}</div>
                            <div><strong>Total Weight:</strong> {selectedAdminInquiry.totalWeight} kg</div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Requested Inventory</h4>
                            <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 font-mono">
                              {selectedAdminInquiry.products.map((p) => (
                                <div key={p.productId} className="flex justify-between">
                                  <span>{p.productName}</span>
                                  <strong>{p.quantityKg} kg</strong>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-slate-400 text-xs">Select an inquiry to view details</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto text-center shadow-xs space-y-4">
                <Lock className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-slate-900">Exporter Portal Access</h3>
                <form onSubmit={handleAdminLogin} className="space-y-3">
                  <input
                    type="password"
                    placeholder="Enter Passcode..."
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center text-sm focus:outline-none focus:border-slate-800"
                  />
                  {adminError && <p className="text-rose-600 text-[11px] font-bold">{adminError}</p>}
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase transition"
                  >
                    Login
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER RIBBON */}
      <footer className="bg-slate-100 text-slate-700 py-12 px-4 border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
              <Globe className="w-5 h-5 text-amber-600" /> Pransh <span className="text-amber-600">Export</span>
            </h3>
            <p className="text-xs text-slate-600 max-w-sm">
              Global Supplier & Exporter of Pure Botanical Powders. Sourced from Gujarat, India.
            </p>
            <p className="text-[11px] text-slate-600">
              Export Officer: <strong className="text-slate-900">Chaitanya Patel</strong> (+1 780-699-0108 / info@pranshexport.com)
            </p>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            © {new Date().getFullYear()} Pransh Export. All rights reserved. Registered Export House, India.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
