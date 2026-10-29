"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

import { DEFAULT_LOCALE, localePath, parseLocalePath, type Locale } from "@/i18n/config";
import { messagesFor, type Messages } from "@/i18n/messages";

/**
 * The page's language for client components. Pages wrap their content in <LocaleProvider>;
 * components rendered outside the page tree (the HOME Menu, the screen transitions) read the
 * same value from a small store that the provider keeps in sync.
 */

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);
const PREFERENCE_KEY = "wii-portfolio:locale";

let current: Locale = DEFAULT_LOCALE;
const listeners = new Set<() => void>();

function setCurrentLocale(locale: Locale) {
  if (current === locale) return;
  current = locale;
  listeners.forEach((listener) => listener());
}

export function getCurrentLocale(): Locale {
  return current;
}

export function rememberLocale(locale: Locale) {
  try {
    localStorage.setItem(PREFERENCE_KEY, locale);
  } catch {
    // Storage unavailable; the choice still applies to this visit.
  }
}

function rememberedLocale(): Locale | undefined {
  try {
    const value = localStorage.getItem(PREFERENCE_KEY);
    return value === "en" || value === "fr" ? value : undefined;
  } catch {
    return undefined;
  }
}

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  useEffect(() => {
    setCurrentLocale(locale);
    document.documentElement.lang = locale;
    // Returning visitors who chose French land on the French menu.
    const remembered = rememberedLocale();
    const { path } = parseLocalePath(window.location.pathname);
    if (path === "/" && remembered && remembered !== locale) window.location.replace(localePath(remembered, "/"));
  }, [locale]);

  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** The language of the current page (inside a LocaleProvider). */
export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useMessages(): Messages {
  return messagesFor(useLocale());
}

/** The current language for components outside the page tree. */
export function useCurrentLocale(): Locale {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => DEFAULT_LOCALE,
  );
}
