import type { ComponentType } from "react";
import { useLocale, useTranslations } from "next-intl";
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

// A raw JS number prints "7.5" on both locales; prices need the locale's
// decimal separator, and cents must not be truncated to "7,5".
export function priceFormatter(locale: string, ...values: number[]) {
  const cents = values.some((value) => !Number.isInteger(value));
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

function PriceDisplay({
  service,
  unit,
  t,
}: {
  service: Service;
  unit?: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const locale = useLocale();
  const unitLabel = unit === "m2" ? t("services.per_m2") : "";
  const amount = priceFormatter(locale, service.price, service.priceMax ?? service.price);

  if (service.priceMax) {
    return (
      <span className="text-gold-700 text-sm sm:text-base font-semibold whitespace-nowrap">
        {amount.format(service.price)}–{amount.format(service.priceMax)}{" "}
        {t("services.currency")}
        {unitLabel ? ` ${unitLabel}` : ""}
      </span>
    );
  }

  return (
    <span className="text-gold-700 text-sm sm:text-base font-semibold whitespace-nowrap">
      {unit ? "" : `${t("services.from")} `}
      {amount.format(service.price)} {t("services.currency")}
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
          <HeadingTag
            id={`${category.id}-title`}
            className="text-xl sm:text-2xl font-bold text-charcoal-900"
          >
            {t(`services.categories.${category.id}`)}
          </HeadingTag>
          <p className="text-charcoal-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
            {t(`services.category_descriptions.${category.id}`)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-gold-100 overflow-hidden shadow-sm">
        <table
          aria-labelledby={`${category.id}-title`}
          className="w-full border-collapse text-left"
        >
          <thead className="sr-only">
            <tr>
              <th scope="col">{t("services.col_service")}</th>
              <th scope="col" className="text-right">
                {t("services.col_price")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100">
            {category.services.map((service, index) => (
              <tr
                key={service.id}
                className={`transition-colors hover:bg-gold-50/50 ${
                  index % 2 === 0 ? "bg-white" : "bg-charcoal-50/30"
                }`}
              >
                <th
                  scope="row"
                  className="px-4 py-3 sm:px-6 sm:py-4 pr-3 align-middle text-charcoal-800 text-sm sm:text-base font-medium"
                >
                  {t(`services.items.${service.id}`)}
                </th>
                <td className="px-4 py-3 sm:px-6 sm:py-4 align-middle text-right">
                  <PriceDisplay service={service} unit={category.unit} t={t} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
