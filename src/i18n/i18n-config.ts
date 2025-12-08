export const languages = ["es", "en"] as const;
export type Language = (typeof languages)[number];

export const defaultLanguage: Language = "es";