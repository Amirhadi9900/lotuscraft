import {
  laundryCategories,
  sewingCategories,
  type Category,
} from "@/data/pricing";

export const servicePageKeys = [
  "korjausompelu",
  "mattopesu",
  "kuivapesu",
  "hotellipesula",
] as const;

export type ServicePageKey = (typeof servicePageKeys)[number];

const allCategories: Category[] = [
  ...sewingCategories,
  ...laundryCategories,
];

/** Photos only where they genuinely depict the service; no mislabelled imagery. */
export const servicePageConfig: Record<
  ServicePageKey,
  { categoryIds: string[]; images: string[]; altKey: string }
> = {
  korjausompelu: {
    categoryIds: ["general", "jackets_dresses", "trousers", "jeans"],
    images: [
      "/images/sew-1.jpeg",
      "/images/sew-2.jpeg",
      "/images/sew-3.jpeg",
      "/images/sew-4.jpeg",
    ],
    altKey: "sewing_work",
  },
  mattopesu: {
    categoryIds: ["rug_washing"],
    images: ["/images/rug-1.jpeg", "/images/rug-3.jpeg", "/images/rug-6.jpeg"],
    altKey: "rug_washing",
  },
  kuivapesu: {
    categoryIds: ["everyday_garments", "outerwear_jackets", "formal_silk"],
    images: [],
    altKey: "work",
  },
  hotellipesula: {
    categoryIds: ["bedding_home"],
    images: [],
    altKey: "work",
  },
};

export function servicePageCategories(key: ServicePageKey): Category[] {
  return servicePageConfig[key]
    .categoryIds.map((id) =>
      allCategories.find((category) => category.id === id)
    )
    .filter((category): category is Category => category !== undefined);
}
