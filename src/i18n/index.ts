"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { defaultLanguage } from "./i18n-config";

import esCommon from "./locales/es/common.json";
import enCommon from "./locales/en/common.json";

const resources = {
  es: { common: esCommon },
  en: { common: enCommon },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: defaultLanguage,
    fallbackLng: defaultLanguage,
    interpolation: { escapeValue: false },
  });
}

export default i18n;