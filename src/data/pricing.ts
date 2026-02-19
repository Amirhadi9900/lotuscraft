export type Service = {
  id: string;
  price: number;
  priceMax?: number;
};

export type Category = {
  id: string;
  services: Service[];
  unit?: "m2" | "kg";
};

// ─── Sewing & Alterations ──────────────────────────────────────────

export const sewingCategories: Category[] = [
  {
    id: "general",
    services: [
      { id: "sleeve_shortening", price: 40 },
      { id: "sleeve_lengthening", price: 45 },
      { id: "narrowing_shoulders", price: 60 },
      { id: "jacket_narrowing", price: 40 },
      { id: "pocket_repair", price: 13 },
      { id: "pocket_replacement", price: 25 },
    ],
  },
  {
    id: "jackets_dresses",
    services: [
      { id: "jacket_zipper", price: 45 },
      { id: "long_jacket_zipper", price: 55 },
      { id: "leather_jacket_zipper", price: 65 },
      { id: "down_jacket_zipper", price: 48 },
      { id: "skirt_shortening", price: 18 },
      { id: "formal_dress_repair", price: 35 },
      { id: "evening_wedding_dress", price: 80 },
      { id: "evening_gown_tailoring", price: 100 },
    ],
  },
  {
    id: "trousers",
    services: [
      { id: "trouser_shortening", price: 25 },
      { id: "back_seam_adjustment", price: 25 },
      { id: "side_seam_adjustment", price: 30 },
      { id: "leather_trouser_zipper", price: 35 },
      { id: "leather_trouser_shortening", price: 30 },
    ],
  },
  {
    id: "jeans",
    services: [
      { id: "patching", price: 15 },
      { id: "standard_shortening", price: 15 },
      { id: "tapering", price: 20 },
      { id: "jeans_zipper", price: 20 },
      { id: "jeans_button", price: 10 },
      { id: "narrowing_leg_openings", price: 15 },
    ],
  },
];

// ─── Laundry & Dry Cleaning ────────────────────────────────────────

export const laundryCategories: Category[] = [
  {
    id: "rug_washing",
    unit: "m2",
    services: [
      { id: "thin_rug", price: 16 },
      { id: "durrie_rug", price: 16 },
      { id: "nomad_rug", price: 16 },
      { id: "hallway_runner", price: 16 },
      { id: "rag_rug", price: 16 },
      { id: "plush_rug", price: 16 },
      { id: "cotton_thick_rug", price: 19 },
      { id: "paper_yarn_thick_rug", price: 19 },
      { id: "persian_rug", price: 19 },
      { id: "linen_rug", price: 19 },
      { id: "coconut_coir_rug", price: 19 },
      { id: "shag_pile_rug", price: 19 },
      { id: "sisal_rug", price: 19 },
      { id: "jute_rug", price: 19 },
      { id: "wool_handwoven_rug", price: 31 },
      { id: "ryijy_rug", price: 31 },
      { id: "hand_knotted_silk_rug", price: 31 },
      { id: "tufted_moroccan_rug", price: 31 },
      { id: "fur_rug", price: 31 },
      { id: "hide_kilim_leather_rug", price: 31 },
    ],
  },
  {
    id: "everyday_garments",
    services: [
      { id: "suit_cleaning", price: 42 },
      { id: "blazer_cleaning", price: 24 },
      { id: "trousers_cleaning", price: 20 },
      { id: "shirt_cleaning", price: 10 },
      { id: "shorts_cleaning", price: 16 },
      { id: "vest_waistcoat", price: 14 },
      { id: "tie_bowtie", price: 14 },
      { id: "blouse_cleaning", price: 15 },
      { id: "decorative_blouse", price: 18 },
      { id: "skirt_cleaning", price: 20, priceMax: 28 },
      { id: "pleated_skirt", price: 32 },
      { id: "dress_cleaning", price: 36 },
      { id: "childs_suit", price: 35 },
      { id: "knit_sweater", price: 16, priceMax: 19 },
      { id: "wool_beanie_cap", price: 16 },
      { id: "six_shirt_package", price: 48 },
    ],
  },
  {
    id: "outerwear_jackets",
    services: [
      { id: "overcoat", price: 37, priceMax: 45 },
      { id: "down_jacket_cleaning", price: 38, priceMax: 44 },
      { id: "faux_fur_coat_short", price: 40 },
      { id: "faux_fur_coat_long", price: 52 },
      { id: "fur_trim_jacket_short", price: 42 },
      { id: "fur_trim_jacket_long", price: 49 },
      { id: "premium_brand_jacket", price: 58, priceMax: 68 },
      { id: "down_vest_outdoor", price: 25, priceMax: 28 },
      { id: "goretex_clothing", price: 40 },
      { id: "ski_jacket_pants", price: 55 },
      { id: "ski_overalls", price: 45 },
      { id: "scarf_neckwarmer", price: 16, priceMax: 25 },
    ],
  },
  {
    id: "formal_silk",
    services: [
      { id: "party_dress_cleaning", price: 48, priceMax: 58 },
      { id: "evening_gown_cleaning", price: 55, priceMax: 78 },
      { id: "wedding_dress_cleaning", price: 110, priceMax: 155 },
      { id: "christening_gown", price: 28 },
      { id: "tuxedo_suit", price: 50 },
      { id: "tuxedo_shirt", price: 12 },
      { id: "silk_suit_womens", price: 55 },
      { id: "silk_jacket_short", price: 30 },
      { id: "silk_jacket_long", price: 38 },
      { id: "silk_dress", price: 45, priceMax: 60 },
      { id: "silk_blouse", price: 19 },
      { id: "silk_skirt", price: 30 },
      { id: "silk_trousers", price: 32 },
      { id: "silk_scarf", price: 12 },
    ],
  },
  {
    id: "bedding_home",
    services: [
      { id: "down_duvet", price: 30, priceMax: 40 },
      { id: "standard_duvet", price: 29, priceMax: 38 },
      { id: "down_pillow", price: 15, priceMax: 20 },
      { id: "standard_pillow", price: 12, priceMax: 20 },
      { id: "mattress_protector", price: 35, priceMax: 45 },
      { id: "bedspread", price: 32, priceMax: 42 },
      { id: "bed_skirt", price: 40 },
      { id: "blanket_throw", price: 20 },
      { id: "sleeping_bag_standard", price: 30 },
      { id: "sleeping_bag_down", price: 40 },
      { id: "curtains_cleaning", price: 25 },
      { id: "lined_curtains", price: 48 },
      { id: "tablecloth_large", price: 25 },
      { id: "tablecloth_small", price: 20 },
      { id: "sofa_frame_cover", price: 45, priceMax: 65 },
      { id: "sofa_cushion_cover", price: 18 },
      { id: "sheets_per_kg", price: 7.5 },
      { id: "placemat", price: 3 },
      { id: "flag_cleaning", price: 14 },
      { id: "linen_surcharge", price: 7 },
    ],
  },
];

// Backward compatibility alias
export const pricingCategories = sewingCategories;
