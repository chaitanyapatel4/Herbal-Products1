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
}

export const EXPORTER_CONTACT = {
  name: "Chaitanya Patel",
  phone: "+1 780-699-0108",
  whatsapp: "+17806990108",
  email: "chaitanyapatel4@gmail.com",
  location: "Gujarat, India",
  website: "www.pranshexport.com"
};

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
    bgAccent: "emerald-50"
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
    bgAccent: "amber-50"
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
    bgAccent: "orange-50"
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
    bgAccent: "yellow-50"
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
    bgAccent: "purple-50"
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
    bgAccent: "lime-50"
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
    bgAccent: "stone-100"
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
    bgAccent: "stone-200"
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
    bgAccent: "green-50"
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
    bgAccent: "teal-50"
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
    bgAccent: "rose-50"
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
    bgAccent: "emerald-100"
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
    bgAccent: "amber-100"
  }
];
