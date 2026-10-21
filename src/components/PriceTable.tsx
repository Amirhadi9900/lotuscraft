import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import {
  Scissors,
  Shirt,
  Home,
  Droplets,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import type { Category, Service } from "@/data/pricing";

type IconType = ComponentType<{ className?: string }>;

export const categoryIcons: Record<string, IconType> = {
  general: Scissors,
  jackets_dresses: Shirt,
  trousers: Scissors,
  jeans: Scissors,
  rug_washing: Home,
  everyday_garments: Shirt,
  outerwear_jackets: ShieldCheck,
  formal_silk: Sparkles,
  bedding_home: Home,
};

function PriceDisplay({
  service,
  unit,
  t,
}: {
  service: Service;
  unit?: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const unitLabel = unit === "m2" ? t("services.per_m2") : "";

  if (service.priceMax) {
    return (
      <span className="text-gold-700 text-sm sm:text-base font-semibold whitespace-nowrap">
        {service.price}–{service.priceMax} {t("services.currency")}
        {unitLabel ? ` ${unitLabel}` : ""}
      </span>
    );
  }

  return (
    <span className="text-gold-700 text-sm sm:text-base font-semibold whitespace-nowrap">
      {unit ? "" : `${t("services.from")} `}
      {service.price} {t("services.currency")}
      {unitLabel ? ` ${unitLabel}` : ""}
    </span>
  );
}

export function CategorySection({
  category,
  HeadingTag = "h3",
}: {
  category: Category;
  HeadingTag?: "h2" | "h3";
}) {
  const t = useTranslations();
  const IconComponent = categoryIcons[category.id] ?? Scissors;

  return (
    <div id={category.id} className="scroll-mt-24 sm:scroll-mt-28">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
          <IconComponent className="text-gold-600 w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <HeadingTag className="text-xl sm:text-2xl font-bold text-charcoal-900">
            {t(`services.categories.${category.id}`)}
          </HeadingTag>
          <p className="text-charcoal-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
            {t(`services.category_descriptions.${category.id}`)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-gold-100 overflow-hidden shadow-sm">
        <div className="divide-y divide-charcoal-100">
          {category.services.map((service, index) => (
            <div
              key={service.id}
              className={`flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 transition-colors hover:bg-gold-50/50 ${
                index % 2 === 0 ? "bg-white" : "bg-charcoal-50/30"
              }`}
            >
              <span className="text-charcoal-800 text-sm sm:text-base font-medium pr-3">
                {t(`services.items.${service.id}`)}
              </span>
              <PriceDisplay service={service} unit={category.unit} t={t} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
