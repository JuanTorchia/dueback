"use client";

import { usePathname } from "next/navigation";
import { defaultLocale, isLocale, localizePath, type Locale } from "./i18n";

export function useLocale(): { locale: Locale; localize: (path: string) => string } {
  const pathname = usePathname();
  const candidate = pathname.split("/")[1];
  const locale = isLocale(candidate) ? candidate : defaultLocale;
  return { locale, localize: (path) => localizePath(path, locale) };
}
