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
  { categoryIds: string[]; images: { src: string; alt: string }[] }
> = {
  korjausompelu: {
    categoryIds: ["general", "jackets_dresses", "trousers", "jeans"],
    images: [
      { src: "/images/sew-1.jpeg", alt: "i21" },
      { src: "/images/sew-2.jpeg", alt: "i22" },
      { src: "/images/sew-3.jpeg", alt: "i23" },
      { src: "/images/sew-4.jpeg", alt: "i24" },
    ],
  },
  mattopesu: {
    categoryIds: ["rug_washing"],
    images: [
      { src: "/images/rug-1.jpeg", alt: "i1" },
      { src: "/images/rug-3.jpeg", alt: "i3" },
      { src: "/images/rug-6.jpeg", alt: "i6" },
    ],
  },
  kuivapesu: {
    categoryIds: ["everyday_garments", "outerwear_jackets", "formal_silk"],
    images: [],
  },
  hotellipesula: {
    categoryIds: ["bedding_home"],
    images: [],
  },
};

export function servicePageCategories(key: ServicePageKey): Category[] {
  return servicePageConfig[key]
    .categoryIds.map((id) =>
      allCategories.find((category) => category.id === id)
    )
    .filter((category): category is Category => category !== undefined);
}
