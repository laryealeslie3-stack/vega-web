export const siteConfig = {
  name: "Vega Web Portal",
  description:
    "Multi-portal service booking platform with Admin, Customer, Vendor, and Service Boy portals. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.",
  version: "1.0.0",
  url: "https://vega-web.vercel.app",
  author: {
    name: "Vega Services",
    url: "https://vegaservices.com",
    email: "hello@vegaservices.com",
  },
  developer: {
    name: "Vega Services",
    url: "https://vegaservices.com",
  },
  distributor: {
    name: "Vega Services",
    url: "https://vegaservices.com",
  },
} as const;

// Signed-in demo user shown in the header menu and profile pages
export const demoUser = {
  name: "John Doe",
  email: "john@example.com",
  role: "Admin",
} as const;
