import type { Metadata } from "next";
import { pageMetadata, resolveLocale } from "@/lib/seo";
import { ServicePage } from "@/components/ServicePage";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(resolveLocale(locale), "kuivapesu", "/kuivapesu");
}

export default async function KuivapesuPage({ params }: Props) {
  const { locale } = await params;
  return <ServicePage pageKey="kuivapesu" locale={resolveLocale(locale)} />;
}
