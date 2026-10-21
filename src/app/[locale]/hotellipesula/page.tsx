import type { Metadata } from "next";
import { pageMetadata, resolveLocale } from "@/lib/seo";
import { ServicePage } from "@/components/ServicePage";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(resolveLocale(locale), "hotellipesula", "/hotellipesula");
}

export default async function HotellipesulaPage({ params }: Props) {
  const { locale } = await params;
  return (
    <ServicePage pageKey="hotellipesula" locale={resolveLocale(locale)} />
  );
}
