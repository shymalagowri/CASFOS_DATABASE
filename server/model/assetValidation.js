// models/assetValidation.js
const permanentAssetOptions = [
    "Furniture",
    "Vehicle",
    "Building",
    "Instruments",
    "Sports and Goods",
    "Fabrics",
    "Electrical",
    "Electronics",
    "Photograph Items",
    "Land",
    "ICT Goods",
  ];
  
  const consumableAssetOptions = [
    "Stationery",
    "IT",
    "Electrical",
    "Plumbing",
    "Glassware/Laboratory Items",
    "Sanitory Items",
    "Sports Goods",
    "Fabrics",
    "Instruments",
  ];
  
  const subCategoryOptions = {
    Furniture: ["Wood", "Steel", "Plastic"],
    Vehicle: ["Two-wheeler", "Three-wheeler", "Four-wheeler", "Bus"],
    Building: [
      "Vana Vigyan",
      "Store and Godown Building",
      "Garages",
      "Pavilion",
      "Gym Building",
      "Chandan Hostel",
      "Vana Vatika",
      "Executive Hostel",
      "Ladies Hostel",
      "Officer Trainees Mess",
      "Residential Quarters",
    ],
    Instruments: ["Laboratory", "Field Exercise Instruments", "Garden Instruments"],
    Fabrics: ["Curtains", "Carpets"],
    Electrical: ["Appliance"],
    Electronics: ["Audio/Visual Equipment", "ICT Equipment"],
    Land: ["Land with Building", "Land without Building"],
  };
  
  const itemNameOptions = {
    "Residential Quarters": [
      "Type-A5",
      "Type-A2",
      "Type-5",
      "Type-4",
      "Type-3",
      "Type-2",
      "Type-D",
    ],
    Appliance: [
      "Fan",
      "Light",
      "AC",
      "Water Purifier",
      "Geysers",
      "Fridge",
      "Vacuum Cleaners",
    ],
    "Audio/Visual Equipment": [
      "Camera",
      "Projector",
      "Television",
      "Speakers",
      "Microphone",
      "CCTV",
      "Audio Mixers",
    ],
    "ICT Equipment": [
      "Computer System",
      "Laptop",
      "Printers",
      "Scanners",
      "Xerox Machine",
      "Server",
    ],
  };
  
  const validateAssetCategory = (assetType) => (value) => {
    const validOptions = assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions;
    return validOptions.includes(value);
  };
  
  const validateSubCategory = (assetCategory) => (value) => {
    if (!value || !assetCategory) return true; // Allow empty or undefined if optional
    const validOptions = subCategoryOptions[assetCategory] || [];
    return validOptions.includes(value) || (value && value.trim() !== "");
  };
  
  const validateItemName = (subCategory) => (value) => {
    if (!value || !subCategory) return true; // Allow empty or undefined if optional
    const validOptions = itemNameOptions[subCategory] || [];
    return validOptions.includes(value) || (value && value.trim() !== "");
  };
  
  module.exports = {
    validateAssetCategory,
    validateSubCategory,
    validateItemName,
  };