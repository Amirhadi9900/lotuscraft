"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Scissors, Droplets, Palette } from "lucide-react";

type GalleryItem = {
  id: number;
  category: string;
  src: string;
  contain?: boolean;
};

const galleryItems: GalleryItem[] = [
  { id: 1, category: "laundry", src: "/images/rug-1.jpeg" },
  { id: 2, category: "laundry", src: "/images/rug-2.jpeg" },
  { id: 3, category: "laundry", src: "/images/rug-3.jpeg" },
  { id: 4, category: "laundry", src: "/images/rug-4.jpeg" },
  { id: 5, category: "laundry", src: "/images/rug-5.jpeg" },
  { id: 6, category: "laundry", src: "/images/rug-6.jpeg" },
  { id: 7, category: "laundry", src: "/images/rug-7.jpeg" },
  { id: 8, category: "laundry", src: "/images/rug-8.jpeg" },
  { id: 9, category: "laundry", src: "/images/rug-9.jpeg" },
  { id: 10, category: "crafts", src: "/images/craft-1.jpeg" },
  { id: 11, category: "crafts", src: "/images/craft-2.jpeg" },
  { id: 12, category: "crafts", src: "/images/craft-3.jpeg" },
  { id: 13, category: "crafts", src: "/images/craft-4.jpeg" },
  { id: 14, category: "crafts", src: "/images/craft-5.jpeg" },
  { id: 15, category: "crafts", src: "/images/craft-6.jpeg" },
  { id: 16, category: "crafts", src: "/images/craft-7.jpeg" },
  { id: 17, category: "crafts", src: "/images/craft-8.jpeg" },
  { id: 18, category: "crafts", src: "/images/craft-9.jpeg" },
  { id: 19, category: "crafts", src: "/images/craft-10.jpeg" },
  { id: 20, category: "crafts", src: "/images/craft-11.jpeg" },
  { id: 21, category: "sewing", src: "/images/sew-1.jpeg", contain: true },
  { id: 22, category: "sewing", src: "/images/sew-2.jpeg", contain: true },
  { id: 23, category: "sewing", src: "/images/sew-3.jpeg", contain: true },
  { id: 24, category: "sewing", src: "/images/sew-4.jpeg", contain: true },
];

const categories = ["all", "sewing", "laundry", "crafts"];

function getCategoryIcon(category: string) {
  switch (category) {
    case "sewing":
      return Scissors;
    case "laundry":
      return Droplets;
    case "crafts":
      return Palette;
    default:
      return Droplets;
  }
}

export default function GalleryClient() {
  const t = useTranslations("gallery");
  const ti = useTranslations("images");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <>
      {/* Page Header */}
      <section className="pt-14 pb-10 sm:pt-20 sm:pb-16 bg-linear-to-b from-charcoal-900 to-charcoal-950">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-white mb-3 sm:mb-4">
            {t("title")}
          </h1>
          <p className="text-charcoal-300 max-w-2xl mx-auto text-sm sm:text-lg">
            {t("subtitle")}
          </p>
          <div className="mt-4 sm:mt-6 w-16 sm:w-24 h-1 bg-gold-500 mx-auto rounded-full" />
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-12 sm:py-24">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div
            role="group"
            aria-label={t("title")}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-16"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
                className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  activeCategory === category
                    ? "bg-gold-700 text-white shadow-lg shadow-gold-600/25"
                    : "bg-white text-charcoal-600 border border-charcoal-200 hover:border-gold-300 hover:text-gold-700"
                }`}
              >
                {t(`categories.${category}`)}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filtered.map((item) => {
              const Icon = getCategoryIcon(item.category);
              return (
                <div
                  key={item.id}
                  className={`group relative aspect-4/3 rounded-xl sm:rounded-2xl overflow-hidden border border-gold-200 hover:shadow-xl transition-all duration-300 ${item.contain ? "bg-charcoal-50" : ""}`}
                >
                  <Image
                    src={item.src}
                    alt={ti(`gallery.i${item.id}`)}
                    fill
                    className={`${item.contain ? "object-contain p-1" : "object-cover"} group-hover:scale-105 transition-transform duration-500`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-charcoal-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/90 rounded-full text-xs font-medium text-charcoal-800">
                      <Icon size={12} className="text-gold-700" />
                      {t(`categories.${item.category}`)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coming Soon Note */}
          <div className="text-center mt-10 sm:mt-16">
            <p className="text-charcoal-600 text-xs sm:text-sm">
              {t("coming_soon")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
