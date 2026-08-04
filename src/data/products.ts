export interface HerbalProduct {
  id: number;
  name: string;
  scientificName: string;
  benefits: string[];
  description: string;
  exportRatio: number;
  grade: string;
  activeCompounds: string;
  packaging: string;
  category: "Immunity & Vitality" | "Skin & Beauty" | "Digestion & Detox" | "Wellness & Strength";
  color: string; // Tailwind color accent
  bgAccent: string; // Tailwind background accent
  hsCode: string; // Harmonized System Customs Code
  fobPriceUsdPerKg: number; // Base FOB Price in USD / kg for trade calculations
}

export const EXPORTER_CONTACT = {
  name: "Chaitanya Patel",
  phone: "+1 780-699-0108",
  whatsapp: "+17806990108",
  email: "info@pranshexport.com",
  location: "Gujarat, India",
  website: "www.pranshexport.com",
  originPorts: ["Mundra Port (INMUN1)", "Nhava Sheva / JNPT Port (INNSA1)"]
};

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rateToUsd: number; // 1 USD = rateToUsd in target currency
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", rateToUsd: 1.0, flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", rateToUsd: 0.92, flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", rateToUsd: 0.78, flag: "🇬🇧" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", rateToUsd: 3.67, flag: "🇦🇪" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rateToUsd: 1.38, flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rateToUsd: 1.52, flag: "🇦🇺" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rateToUsd: 155.0, flag: "🇯🇵" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rateToUsd: 83.5, flag: "🇮🇳" }
];

export interface TradePort {
  country: string;
  portName: string;
  code: string;
  transitDays: string;
  region: string;
  flag: string;
  cifEstPerKgUsd: number; // Avg freight + marine insurance surcharge per kg
}

export const GLOBAL_PORTS: TradePort[] = [
  { country: "United States", portName: "Port of Los Angeles / Long Beach", code: "USLAX", transitDays: "20-24 Days", region: "North America", flag: "🇺🇸", cifEstPerKgUsd: 0.45 },
  { country: "United States", portName: "Port of New York & New Jersey", code: "USNYC", transitDays: "24-28 Days", region: "North America", flag: "🇺🇸", cifEstPerKgUsd: 0.55 },
  { country: "Netherlands", portName: "Port of Rotterdam", code: "NLRTM", transitDays: "18-22 Days", region: "Europe", flag: "🇪🇺", cifEstPerKgUsd: 0.40 },
  { country: "Germany", portName: "Port of Hamburg", code: "DEHAM", transitDays: "19-23 Days", region: "Europe", flag: "🇩🇪", cifEstPerKgUsd: 0.42 },
  { country: "United Arab Emirates", portName: "Jebel Ali Port (Dubai)", code: "AEJEA", transitDays: "4-6 Days", region: "Middle East", flag: "🇦🇪", cifEstPerKgUsd: 0.20 },
  { country: "United Kingdom", portName: "Port of Felixstowe / London Gateway", code: "GBFXT", transitDays: "20-24 Days", region: "United Kingdom", flag: "🇬🇧", cifEstPerKgUsd: 0.48 },
  { country: "Singapore", portName: "Port of Singapore", code: "SGSIN", transitDays: "8-12 Days", region: "Asia Pacific", flag: "🇸🇬", cifEstPerKgUsd: 0.30 },
  { country: "Canada", portName: "Port of Vancouver", code: "CAVAN", transitDays: "22-26 Days", region: "North America", flag: "🇨🇦", cifEstPerKgUsd: 0.50 },
  { country: "Australia", portName: "Port of Sydney / Melbourne", code: "AUSYD", transitDays: "18-22 Days", region: "Oceania", flag: "🇦🇺", cifEstPerKgUsd: 0.45 },
  { country: "Japan", portName: "Port of Yokohama / Tokyo", code: "JPYOK", transitDays: "14-18 Days", region: "Asia Pacific", flag: "🇯🇵", cifEstPerKgUsd: 0.38 }
];

export const INCOTERMS_DETAILS = {
  FOB: {
    name: "FOB - Free On Board",
    description: "Pransh Export handles packaging, inland transit, export customs clearance, and loading onto vessel at Indian origin port (Mundra/Nhava Sheva). Buyer manages ocean freight, marine insurance, and import duties.",
    recommendedFor: "Experienced importers with established freight forwarders."
  },
  CIF: {
    name: "CIF - Cost, Insurance & Freight",
    description: "Pransh Export covers packaging, origin export customs, ocean freight maritime transport, and marine risk insurance directly to your specified destination port.",
    recommendedFor: "Hassle-free maritime delivery directly to your regional port."
  },
  CFR: {
    name: "CFR - Cost & Freight",
    description: "Pransh Export covers origin costs and maritime transport to your destination port. Buyer arranges marine insurance coverage independently.",
    recommendedFor: "Buyers who maintain global corporate umbrella marine insurance."
  },
  EXW: {
    name: "EXW - Ex-Works Factory",
    description: "Goods made ready at our GMP manufacturing facility in Gujarat. Buyer arranges pickup, origin haulage, customs, and transport.",
    recommendedFor: "Local buying agents and buyers with integrated global logistics networks."
  },
  DDP: {
    name: "DDP - Delivered Duty Paid",
    description: "Door-to-door delivery. Pransh Export manages full end-to-end transport, origin and destination customs, and import tariff clearance to your warehouse.",
    recommendedFor: "Brands and manufacturers requiring turnkey warehouse delivery."
  }
};

export const CONTAINER_LOADS = [
  { type: "20ft FCL (Full Container Load)", netWeightKg: 11000, description: "Optimal for high-volume single or mixed herbal shipments (~11 Metric Tons)" },
  { type: "40ft High Cube Container", netWeightKg: 24000, description: "Maximum ocean economy for bulk wholesale orders (~24 Metric Tons)" },
  { type: "Standard Pallet LCL (Less Container Load)", netWeightKg: 1000, description: "Palletized consolidated shipment for trial batches and smaller distributors (~1 Metric Ton)" }
];

export const TRADE_DOCUMENTS = [
  { name: "Commercial Invoice & Packing List", description: "Detailed line-item invoice with HS codes, batch numbers, net/gross weights, and port details.", code: "INV-PKL" },
  { name: "Phytosanitary Certificate", description: "Issued by the Ministry of Agriculture India confirming plant health, pest-free processing, and quarantine clearance.", code: "PHYTO" },
  { name: "Certificate of Origin (COO)", description: "Official export origin document issued by the Chamber of Commerce India for preferential customs duty treatment.", code: "COO" },
  { name: "Bill of Lading (B/L) / Airway Bill", description: "Official negotiable document of title issued by shipping lines (Maersk, MSC, CMA CGM, Hapag-Lloyd).", code: "BL" },
  { name: "Certificate of Analysis (CoA)", description: "Batch-specific laboratory report detailing active compound percentages, heavy metals, microbial limits, and moisture.", code: "COA" },
  { name: "Non-GMO & Halal/Kosher Declarations", description: "Compliance declarations for international religious, dietary, and organic retail standards.", code: "CERT" }
];

export const QUALITY_STANDARDS = [
  {
    title: "100% Natural Sourcing",
    description: "Sourced directly from verified sustainable farms across India. Free from any additives, fillers, or artificial preservatives.",
    icon: "Sprout"
  },
  {
    title: "Rigorous Lab Testing",
    description: "Every batch undergoes rigorous microbial, heavy metal, and active ingredient profiling in certified labs to ensure raw potency.",
    icon: "ShieldCheck"
  },
  {
    title: "Hygienic processing",
    description: "Dehydrated and milled at optimal temperatures in GMP-compliant, state-of-the-art facilities to retain complete bioavailability.",
    icon: "Cpu"
  },
  {
    title: "Global Compliance",
    description: "Compliant with international phytosanitary certificates, food safety guidelines, and robust custom regulations for seamless imports.",
    icon: "Globe"
  }
];

export const HERBAL_PRODUCTS: HerbalProduct[] = [
  {
    id: 1,
    name: "Moringa Powder",
    scientificName: "Moringa oleifera",
    benefits: [
      "Rich in nutrients & antioxidants",
      "Supports immunity",
      "Boosts energy & vitality"
    ],
    description: "Known as the 'Miracle Tree', Moringa is loaded with essential amino acids, iron, calcium, and Vitamins A & C, making it one of nature's ultimate daily superfoods.",
    exportRatio: 15,
    grade: "Premium Organic A-Grade",
    activeCompounds: "Isothiocyanates, Quercetin, Chlorogenic acid",
    packaging: "25kg double-walled food-grade LDPE bags inside fiber drums, or custom retail packs.",
    category: "Immunity & Vitality",
    color: "emerald-600",
    bgAccent: "emerald-50",
    hsCode: "1211.90.29",
    fobPriceUsdPerKg: 3.80
  },
  {
    id: 2,
    name: "Multani Mitti",
    scientificName: "Fuller's Earth",
    benefits: [
      "Deep cleanses skin",
      "Controls oil & acne",
      "Natural skin brightener"
    ],
    description: "A rich mineral clay sourced from the desert beds of Rajasthan, India. Highly celebrated for absorbing sebum, tightening pores, and restoring natural dermal radiance.",
    exportRatio: 10,
    grade: "Cosmetic Grade Super-Fine (Mesh 150)",
    activeCompounds: "Hydrated Aluminum Silicates, Montmorillonite",
    packaging: "Bulk paper sacks, heavy HDPE bags, or custom private-label cosmetics jars.",
    category: "Skin & Beauty",
    color: "amber-600",
    bgAccent: "amber-50",
    hsCode: "2507.00.00",
    fobPriceUsdPerKg: 1.20
  },
  {
    id: 3,
    name: "Ashwagandha Powder",
    scientificName: "Withania somnifera",
    benefits: [
      "Reduces stress & anxiety",
      "Improves stamina & focus",
      "Supports overall wellness"
    ],
    description: "The premier adaptogen of Ayurveda, also referred to as 'Indian Ginseng'. It moderates cortisol levels, helps the nervous system adapt to stress, and builds core physical stamina.",
    exportRatio: 10,
    grade: "Premium Standardized (Withanolides > 2.5%)",
    activeCompounds: "Withanolides, Somniferine, Alkaloids",
    packaging: "Vacuum-sealed barrier bags to protect bioactive compounds, in reinforced cartons.",
    category: "Wellness & Strength",
    color: "amber-700",
    bgAccent: "orange-50",
    hsCode: "1211.90.29",
    fobPriceUsdPerKg: 7.50
  },
  {
    id: 4,
    name: "Turmeric Powder",
    scientificName: "Curcuma longa",
    benefits: [
      "Powerful anti-inflammatory",
      "Boosts immunity",
      "Supports skin health"
    ],
    description: "The gold-standard Indian spice, containing highly concentrated Curcumin. We source from the finest curcumin-rich crops of Salem and Sangli to ensure elite potency.",
    exportRatio: 12,
    grade: "Premium Culinary & Pharma Grade (Curcumin > 4.5%)",
    activeCompounds: "Curcuminoids (Curcumin, Demethoxycurcumin)",
    packaging: "Multi-layer UV-protective sacks inside moisture-barrier export drums.",
    category: "Immunity & Vitality",
    color: "yellow-600",
    bgAccent: "yellow-50",
    hsCode: "0910.30.30",
    fobPriceUsdPerKg: 3.20
  },
  {
    id: 5,
    name: "Jamun Powder",
    scientificName: "Syzygium cumini",
    benefits: [
      "Supports healthy blood sugar levels",
      "Aids digestion & gut flora",
      "Rich in protective antioxidants"
    ],
    description: "Formulated from the sun-dried seeds of the Jamun berry (black plum). It contains active constituents that aid glycemic homeostasis and optimize metabolic pathways.",
    exportRatio: 8,
    grade: "Pure Seed Extract / Powder Grade A",
    activeCompounds: "Jamboline, Jambosine, Ellagic Acid",
    packaging: "Aluminum vacuum bags inside food-grade export boxes.",
    category: "Wellness & Strength",
    color: "purple-600",
    bgAccent: "purple-50",
    hsCode: "1211.90.90",
    fobPriceUsdPerKg: 4.50
  },
  {
    id: 6,
    name: "Neem Powder",
    scientificName: "Azadirachta indica",
    benefits: [
      "Purifies blood",
      "Supports clear, glowing skin",
      "Natural detoxifier"
    ],
    description: "A bitter leaf powder with immense antimicrobial, antifungal, and blood-cleansing benefits. Widely exported for both wellness supplements and organic cosmetic formulations.",
    exportRatio: 8,
    grade: "Organic Leaf Powder A-Grade",
    activeCompounds: "Azadirachtin, Nimbin, Gedunin",
    packaging: "Standard multi-layer craft paper bags with PE inner lining.",
    category: "Digestion & Detox",
    color: "lime-600",
    bgAccent: "lime-50",
    hsCode: "1211.90.29",
    fobPriceUsdPerKg: 2.90
  },
  {
    id: 7,
    name: "White Musli Powder",
    scientificName: "Chlorophytum borivilianum",
    benefits: [
      "Improves strength & stamina",
      "Supports reproductive health",
      "Natural energy booster"
    ],
    description: "Known as 'Safed Musli', this rare and highly prized tuberous root acts as a natural revitalizer, enhancing muscle mass, physical vigor, and cellular endurance.",
    exportRatio: 8,
    grade: "Elite Root Extract (Saponins > 20%)",
    activeCompounds: "Saponins, Natural Mucilage, Alkaloids",
    packaging: "Vacuum-sealed bags in sturdy fiber drums.",
    category: "Wellness & Strength",
    color: "yellow-800",
    bgAccent: "stone-100",
    hsCode: "1211.90.90",
    fobPriceUsdPerKg: 18.50
  },
  {
    id: 8,
    name: "Shilajit Powder",
    scientificName: "Asphaltum punjabianum",
    benefits: [
      "Boosts energy & endurance",
      "Supports cognitive function",
      "Rich in minerals & fulvic acid"
    ],
    description: "Sourced from high-altitude Himalayan rock fissures and purified using traditional Shodhana methods. Contains over 84 trace minerals and concentrated fulvic acid.",
    exportRatio: 6,
    grade: "Purified Gold-Grade Shilajit (Fulvic Acid > 50%)",
    activeCompounds: "Fulvic Acid, Humic Acid, Trace Minerals",
    packaging: "Airtight, light-proof pharmaceutical glass containers or foil packs.",
    category: "Wellness & Strength",
    color: "stone-800",
    bgAccent: "stone-200",
    hsCode: "3004.90.11",
    fobPriceUsdPerKg: 42.00
  },
  {
    id: 9,
    name: "Spinach Powder",
    scientificName: "Spinacia oleracea",
    benefits: [
      "Rich in iron & folate",
      "Supports bone & eye health",
      "Natural source of green nutrients"
    ],
    description: "Finest farm-grown Indian spinach leaves, cold-dehydrated to retain complete vitamin and mineral integrity. An excellent natural supplement for superfood blends.",
    exportRatio: 6,
    grade: "Dehydrated Superfood Grade",
    activeCompounds: "Chlorophyll, Lutein, Zeaxanthin, Iron",
    packaging: "Sealed light-blocking vacuum bags in carton boxes.",
    category: "Immunity & Vitality",
    color: "green-700",
    bgAccent: "green-50",
    hsCode: "0712.90.90",
    fobPriceUsdPerKg: 4.20
  },
  {
    id: 10,
    name: "Spirulina Powder",
    scientificName: "Arthrospira platensis",
    benefits: [
      "High in vegan protein & nutrients",
      "Detoxifies heavy metals",
      "Supports healthy immunity"
    ],
    description: "A premium blue-green microalgae grown in sun-drenched Indian cultivation farms. Sourced under strict food safety conditions, providing deep cellular detox.",
    exportRatio: 5,
    grade: "Premium Organic Cultured Grade",
    activeCompounds: "Phycocyanin, Beta-Carotene, GLA",
    packaging: "High-barrier vacuum bags in fiber drums.",
    category: "Digestion & Detox",
    color: "teal-600",
    bgAccent: "teal-50",
    hsCode: "2102.20.00",
    fobPriceUsdPerKg: 9.80
  },
  {
    id: 11,
    name: "Beetroot Powder",
    scientificName: "Beta vulgaris",
    benefits: [
      "Supports cardiovascular health",
      "Improves athletic stamina",
      "Rich in iron & antioxidants"
    ],
    description: "Dehydrated red beetroots, containing rich natural nitrates which convert to nitric oxide inside the body, dilating blood vessels and boosting oxygen delivery.",
    exportRatio: 4,
    grade: "Food & Beverage Grade, High-Nitrate",
    activeCompounds: "Nitrates, Betalains, Betanin",
    packaging: "Hermetically sealed moisture-proof bags.",
    category: "Immunity & Vitality",
    color: "rose-700",
    bgAccent: "rose-50",
    hsCode: "0712.90.90",
    fobPriceUsdPerKg: 3.50
  },
  {
    id: 12,
    name: "Amla Powder",
    scientificName: "Phyllanthus emblica",
    benefits: [
      "Extremely rich in Vitamin C",
      "Boosts overall immunity",
      "Supports healthy hair & skin"
    ],
    description: "Commonly known as Indian Gooseberry. Sourced from organic groves, it is a magnificent source of antioxidants and stable Vitamin C that survives high temperatures.",
    exportRatio: 4,
    grade: "A-Grade Organic Fruit Powder",
    activeCompounds: "Ascorbic Acid (Vitamin C), Tannins, Ellagic Acid",
    packaging: "Double-poly lined woven sacks or custom paper stand-up pouches.",
    category: "Skin & Beauty",
    color: "emerald-700",
    bgAccent: "emerald-100",
    hsCode: "1211.90.29",
    fobPriceUsdPerKg: 3.10
  },
  {
    id: 13,
    name: "Triphala Powder",
    scientificName: "Amla + Haritaki + Bibhitaki",
    benefits: [
      "Supports robust digestion",
      "Deeply detoxifies the GI tract",
      "Promotes overall tissue health"
    ],
    description: "The crown jewel of Ayurvedic intestinal health. A precise 1:1:1 synergistic blend of three super-fruits that gently cleanses the colon and encourages standard absorption.",
    exportRatio: 4,
    grade: "Standardized Ayurvedic Polyherbal Grade",
    activeCompounds: "Gallic Acid, Tannins, Vitamin C",
    packaging: "Tight-seal moisture-proof bags inside drums.",
    category: "Digestion & Detox",
    color: "amber-800",
    bgAccent: "amber-100",
    hsCode: "1211.90.29",
    fobPriceUsdPerKg: 3.60
  }
];

