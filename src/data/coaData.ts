export interface CoAParameter {
  parameter: string;
  method?: string;
  specification: string;
  result: string;
}

export interface CoASection {
  title: string;
  parameters: CoAParameter[];
}

export interface CoAData {
  title: string;
  productName: string;
  botanicalName?: string;
  batchNo?: string;
  mfgDate?: string;
  expiryDate?: string;
  remarks?: string;
  sections: CoASection[];
}

export const COA_RECORDS: Record<number, CoAData> = {
  // id: 1 -> Moringa Powder
  1: {
    title: "Certificate of Analysis (Finished Goods)",
    productName: "Natural Moringa Leaves Powder",
    botanicalName: "Moringa oleifera",
    batchNo: "MLP-M-2026",
    mfgDate: "January-2026",
    expiryDate: "24 months from MFG",
    remarks: "As Per In-House QC Lab, Above All parameters were passed, Please consider it.",
    sections: [
      {
        title: "Organoleptic Characters",
        parameters: [
          { parameter: "Colour", specification: "Green", result: "Complies" },
          { parameter: "Odour", specification: "Characteristic", result: "Complies" }
        ]
      },
      {
        title: "Physico-Chemical Test",
        parameters: [
          { parameter: "Total ash (% w/w)", specification: "NMT 16%", result: "13.07%" },
          { parameter: "Loss On Drying (% w/w)", specification: "NMT 8%", result: "5.07%" },
          { parameter: "Bulk Density (gm/ml)", specification: "NMT 1gm/ml", result: "0.381gm/ml" },
          { parameter: "Tap Density (gm/ml)", specification: "NMT 1gm/ml", result: "0.486gm/ml" },
          { parameter: "Acid-insoluble ash (% w/w)", specification: "NMT 4%", result: "2.49%" },
          { parameter: "Water-soluble extractive (% w/w)", specification: "NLT 15%", result: "32.37%" },
          { parameter: "Alcohol-soluble extractive (% w/w)", specification: "NLT 5%", result: "19.40%" },
          { parameter: "Material passing through 60# BC/ASTM (% w/w)", specification: "NLT 98%", result: "98.58%" },
          { parameter: "Material passing through 80# BC/ASTM (% w/w)", specification: "NLT 95%", result: "Complies" },
          { parameter: "Material passing through 100# BC/ASTM (% w/w)", specification: "NLT 90%", result: "Complies" }
        ]
      }
    ]
  },
  // id: 2 -> Multani Mitti
  2: {
    title: "Certificate of Analysis (Finished Goods)",
    productName: "Natural Multani Mitti Powder",
    botanicalName: "Fuller's Earth",
    batchNo: "MMP-R-2026",
    mfgDate: "February-2026",
    expiryDate: "36 months from MFG",
    remarks: "As Per In-House QC Lab, Above All parameters were passed, Please consider it.",
    sections: [
      {
        title: "Organoleptic Characters",
        parameters: [
          { parameter: "Colour", specification: "Yellowish", result: "Complies" },
          { parameter: "Odour", specification: "Characteristics", result: "Complies" }
        ]
      },
      {
        title: "Physico-Chemical Test",
        parameters: [
          { parameter: "Loss on drying (% w/w)", specification: "NMT 8%", result: "7.15%" },
          { parameter: "Water-soluble extractive (% w/w)", specification: "NLT 5%", result: "6.63%" },
          { parameter: "Alcohol-soluble extractive (% w/w)", specification: "NLT 2%", result: "2.39%" },
          { parameter: "Bulk Density", specification: "NMT 1gm/ml", result: "0.416gm/ml" },
          { parameter: "Tap Density", specification: "NMT 1gm/ml", result: "0.594gm/ml" },
          { parameter: "Material passing through 60# BC/ASTM (% w/w)", specification: "NLT 98%", result: "98.24%" },
          { parameter: "Material passing through 80# BC/ASTM (% w/w)", specification: "NLT 95%", result: "Complies" },
          { parameter: "Material passing through 100# BC/ASTM (% w/w)", specification: "NLT 90%", result: "Complies" }
        ]
      }
    ]
  },
  // id: 3 -> Ashwagandha Powder
  3: {
    title: "Certificate of Analysis (Finished Goods)",
    productName: "Ashwagandha Powder",
    botanicalName: "Withania somnifera",
    batchNo: "AP-S-2026",
    mfgDate: "January-2026",
    expiryDate: "24 months from MFG",
    remarks: "As Per In-House QC Lab, Above All parameters were passed, Please consider it.",
    sections: [
      {
        title: "Organoleptic Characters",
        parameters: [
          { parameter: "Colour", specification: "Creamish", result: "Complies" },
          { parameter: "Odour", specification: "Characteristic", result: "Complies" }
        ]
      },
      {
        title: "Physico-Chemical Test",
        parameters: [
          { parameter: "Total ash (% w/w)", specification: "NMT 9%", result: "2.24%" },
          { parameter: "Loss On Drying (% w/w)", specification: "NMT 8%", result: "6.47%" },
          { parameter: "Bulk Density", specification: "NMT 1gm/ml", result: "0.369gm/ml" },
          { parameter: "Tap Density", specification: "NMT 1gm/ml", result: "0.516gm/ml" },
          { parameter: "Acid-insoluble ash (% w/w)", specification: "NMT 2%", result: "0.93%" },
          { parameter: "Water-soluble extractive (% w/w)", specification: "NLT 15%", result: "30.25%" },
          { parameter: "Alcohol-soluble extractive (% w/w)", specification: "NLT 5%", result: "17.48%" },
          { parameter: "Material passing through 60# BC/ASTM (% w/w)", specification: "NLT 98%", result: "98.42%" },
          { parameter: "Material passing through 80# BC/ASTM (% w/w)", specification: "NLT 95%", result: "Complies" },
          { parameter: "Material passing through 100# BC/ASTM (% w/w)", specification: "NLT 90%", result: "Complies" }
        ]
      }
    ]
  },
  // id: 4 -> Turmeric Powder
  4: {
    title: "Certificate of Analysis",
    productName: "Turmeric Powder",
    botanicalName: "Curcuma longa",
    batchNo: "STP0123",
    mfgDate: "March-2026",
    expiryDate: "24 Months from MFG",
    remarks: "In the opinion of undersigned the sample referred to above is of standard Quality as defined in the act and rules made there under for reason(s) given below complies with above test IP/API/ In-House Specification.",
    sections: [
      {
        title: "Physical Parameters",
        parameters: [
          { parameter: "Particle Size", specification: "80 Mesh", result: "Complies" },
          { parameter: "Odor", specification: "Characteristic", result: "Characteristic" },
          { parameter: "Taste", specification: "Characteristic", result: "Characteristic" },
          { parameter: "Colour", specification: "Yellowish Orange", result: "Complies" }
        ]
      },
      {
        title: "Chemical Parameters",
        parameters: [
          { parameter: "Moisture", specification: "NMT 10.0 %", result: "4.51%" },
          { parameter: "pH", specification: "NMT 10.0 %", result: "5.90" },
          { parameter: "Ash content", specification: "NMT 12.0 %", result: "7.02%" }
        ]
      },
      {
        title: "Impurities",
        parameters: [
          { parameter: "Arsenic", specification: "<1.0 ppm", result: "Complies" },
          { parameter: "Lead", specification: "<2.0 ppm", result: "0.16 ppm" },
          { parameter: "Cadmium", specification: "<1.0 ppm", result: "Complies" },
          { parameter: "Mercury", specification: "<0.1 ppm", result: "Complies" }
        ]
      },
      {
        title: "Microbial Parameter",
        parameters: [
          { parameter: "Total Plate count", specification: "< 100,000 cfu/g", result: "3.0 X 10³ cfu/g" },
          { parameter: "Total Yeast count", specification: "< 200 cfu/g", result: "<10 cfu/g" },
          { parameter: "Total moulds", specification: "< 200 cfu/g", result: "Complies" },
          { parameter: "Escherichia coli", specification: "< 20 cfu/g", result: "Complies" },
          { parameter: "Salmonella", specification: "Absent", result: "Complies" }
        ]
      }
    ]
  },
  // id: 6 -> Neem Powder
  6: {
    title: "Certificate of Analysis (Finished Goods)",
    productName: "Natural Neem Leaves Powder",
    botanicalName: "Azadirachta indica",
    batchNo: "NLP-N-2026",
    mfgDate: "February-2026",
    expiryDate: "24 months from MFG",
    remarks: "As Per In-House QC Lab, Above All parameters were passed, Please consider it.",
    sections: [
      {
        title: "Organoleptic Characters",
        parameters: [
          { parameter: "Colour", specification: "Green", result: "Complies" },
          { parameter: "Odour", specification: "Characteristic", result: "Complies" }
        ]
      },
      {
        title: "Physico-Chemical Test",
        parameters: [
          { parameter: "Total ash (% w/w)", specification: "NMT 9%", result: "4.14%" },
          { parameter: "Loss On Drying (% w/w)", specification: "NMT 8%", result: "3.72%" },
          { parameter: "Bulk Density", specification: "NMT 1gm/ml", result: "0.460gm/ml" },
          { parameter: "Tap Density", specification: "NMT 1gm/ml", result: "0.578gm/ml" },
          { parameter: "Acid-insoluble ash (% w/w)", specification: "NMT 2%", result: "1.15%" },
          { parameter: "Water-soluble extractive (% w/w)", specification: "NLT 15%", result: "36.42%" },
          { parameter: "Alcohol-soluble extractive (% w/w)", specification: "NLT 5%", result: "18.96%" },
          { parameter: "Material passing through 60# BC/ASTM (% w/w)", specification: "NLT 98%", result: "98.42%" },
          { parameter: "Material passing through 80# BC/ASTM (% w/w)", specification: "NLT 95%", result: "Complies" },
          { parameter: "Material passing through 100# BC/ASTM (% w/w)", specification: "NLT 90%", result: "Complies" }
        ]
      }
    ]
  },
  // id: 9 -> Spinach Powder
  9: {
    title: "Test Report",
    productName: "Spinach Powder",
    botanicalName: "Spinacia oleracea",
    batchNo: "SE-MFM-2026",
    mfgDate: "May-2026",
    expiryDate: "24 months from MFG",
    remarks: "As Per In-House QC Lab, Above All parameters were passed. Premium dehydrated green spinach superfood quality.",
    sections: [
      {
        title: "Physico/Chemical Report",
        parameters: [
          { parameter: "Moisture", method: "IS:1797-1985 RA2003", specification: "6.00%", result: "4.54%" },
          { parameter: "Total Ash", method: "IS:1797-1985 RA2003", specification: "6.00%", result: "5.15%" },
          { parameter: "Acid insoluble ash", method: "IS:1797-1985 RA2003", specification: "1.00%", result: "0.43%" },
          { parameter: "Foreign Particles", specification: "Nil", result: "Nil" },
          { parameter: "Color/Appearance", specification: "Characteristic", result: "Characteristic (Complies)" },
          { parameter: "Stone/Dust particle", specification: "Nil", result: "Nil" },
          { parameter: "Live Worms/Insects", specification: "Nil", result: "Nil" },
          { parameter: "Aflatoxin", specification: "2ppb max.", result: "Nil" },
          { parameter: "Pesticide Residual", specification: "Nil", result: "Nil" }
        ]
      }
    ]
  },
  // id: 10 -> Spirulina Powder
  10: {
    title: "Certificate Of Analysis",
    productName: "Spirulina plantasis Powder",
    botanicalName: "Arthrospira plantasis",
    batchNo: "25SP - SPOP65 - 06B",
    mfgDate: "15-05-2026",
    expiryDate: "2 Years From DOM",
    remarks: "Sheena Enterprise Laboratory. Sourced with 100% purity from Ahmedabad, Gujarat facilities.",
    sections: [
      {
        title: "Organoleptic Characteristic",
        parameters: [
          { parameter: "Appearance", method: "Visual", specification: "Fine Powder", result: "Fine Powder" },
          { parameter: "Colour", method: "Visual", specification: "Dark Green ~ Light Green", result: "Complies" },
          { parameter: "Flavour", method: "Sensorial", specification: "Characteristic", result: "Complies" },
          { parameter: "Odour", method: "Sensorial", specification: "Characteristic / Algae", result: "Complies" }
        ]
      },
      {
        title: "Physical Appearance",
        parameters: [
          { parameter: "Microscopic Appearance", specification: "Fine Powder", result: "Fine Powder" },
          { parameter: "Medium", specification: "Natural Medium", result: "Complies" },
          { parameter: "Moisture", specification: "NMT 9.0%", result: "6.08%" },
          { parameter: "Colour Match", specification: "Dark Green Colour", result: "Dark Green Colour" },
          { parameter: "Sieve Analysis", specification: "100% Through 80 MESH", result: "100% Passed" },
          { parameter: "Bulk Cell Density", specification: "0.65 - 0.85 gm/cc", result: "0.72 gm/cc" },
          { parameter: "Smell of Culture", specification: "Typical Algae", result: "Complies" },
          { parameter: "Loss on Drying %", specification: "Max 9.0%", result: "4.30%" },
          { parameter: "Ash Content", specification: "NMT 12.0%", result: "6.67%" }
        ]
      },
      {
        title: "Dry Cell Content Analysis",
        parameters: [
          { parameter: "Protein (g/100g)", specification: "58% - 64%", result: "60.18%" },
          { parameter: "Fat (g/100g)", specification: "2 - 10%", result: "4.8g" },
          { parameter: "Carbohydrates (g/100g)", specification: "15 - 25%", result: "17.3g" },
          { parameter: "Chlorophyll (mg/g)", specification: ">5 mg", result: "8.9 mg" },
          { parameter: "Phycobiliprotein (mg/g)", specification: "100 - 200 mg", result: "163 mg" },
          { parameter: "Phycocyanin (mg/g)", specification: "NLT 100 mg", result: "132 mg" },
          { parameter: "Carotenoids (mg/g)", specification: ">2 mg", result: "2.6 mg" }
        ]
      }
    ]
  },
  // id: 11 -> Beetroot Powder
  11: {
    title: "Test Report",
    productName: "Beetroot Powder",
    botanicalName: "Beta vulgaris",
    batchNo: "SE-BFI-2026",
    mfgDate: "January-2026",
    expiryDate: "24 months from MFG",
    remarks: "Trial Sample Approved. Product contains exceptionally rich, pure beetroot with natural pinkish-red color.",
    sections: [
      {
        title: "Physico/Chemical Report",
        parameters: [
          { parameter: "Moisture", method: "IS:1797-1985 RA2003", specification: "6.00%", result: "4.66%" },
          { parameter: "Total Ash", method: "IS:1797-1985 RA2003", specification: "6.00%", result: "5.00%" },
          { parameter: "Acid insoluble ash", method: "IS:1797-1985 RA2003", specification: "1.00%", result: "0.41%" },
          { parameter: "Color", specification: "Natural Pinkish Red in color", result: "Complies" },
          { parameter: "Taste", specification: "Pure Natural Beetroot taste", result: "Complies" }
        ]
      }
    ]
  },
  // id: 12 -> Amla Powder
  12: {
    title: "Certificate of Analysis (Finished Goods)",
    productName: "Natural Amla Powder",
    botanicalName: "Phyllanthus emblica",
    batchNo: "AP-A-2026",
    mfgDate: "March-2026",
    expiryDate: "24 months from MFG",
    remarks: "As Per In-House QC Lab, Above All parameters were passed, Please consider it.",
    sections: [
      {
        title: "Organoleptic Characters",
        parameters: [
          { parameter: "Colour", specification: "Light Brown", result: "Complies" },
          { parameter: "Odour", specification: "Characteristics", result: "Complies" }
        ]
      },
      {
        title: "Physico-Chemical Test",
        parameters: [
          { parameter: "Loss on drying (% w/w)", specification: "NMT 8%", result: "3.47%" },
          { parameter: "Total Ash value (% w/w)", specification: "NMT 9%", result: "3.89%" },
          { parameter: "Acid-insoluble ash (% w/w)", specification: "NMT 2%", result: "0.92%" },
          { parameter: "Water-soluble extractive (% w/w)", specification: "NLT 15%", result: "31.82%" },
          { parameter: "Alcohol-soluble extractive (% w/w)", specification: "NLT 5%", result: "16.26%" },
          { parameter: "Bulk Density", specification: "NMT 1gm/ml", result: "0.369gm/ml" },
          { parameter: "Tap Density", specification: "NMT 1gm/ml", result: "0.431gm/ml" },
          { parameter: "Material passing through 60# BC/ASTM (% w/w)", specification: "NLT 98%", result: "98.56%" },
          { parameter: "Material passing through 80# BC/ASTM (% w/w)", specification: "NLT 95%", result: "Complies" },
          { parameter: "Material passing through 100# BC/ASTM (% w/w)", specification: "NLT 90%", result: "Complies" }
        ]
      }
    ]
  }
};
