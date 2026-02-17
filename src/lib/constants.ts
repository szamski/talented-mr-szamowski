export const socialLinks = {
  linkedin: "https://linkedin.com/in/maciekszamowski",
  github: "https://github.com/maciekszamowski",
  whatsapp: "https://wa.me/48793324715",
} as const;

export const siteConfig = {
  name: "The Talented Mr. Szamowski",
  description:
    "Marketing and business leader. Digital One Man Army.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://szamowski.com",
} as const;
