import type { Metadata } from "next";
import { pageMetadata, resolveLocale } from "@/lib/seo";
import GalleryClient from "./GalleryClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(resolveLocale(locale), "gallery", "/gallery");
}

export default function GalleryPage() {
  return <GalleryClient />;
}
