"use client";

import { siteConfig } from "@/lib/site-config";

export function WhatsAppFloat() {
  const href = `https://wa.me/${siteConfig.whatsappNumber.replace("+", "")}?text=${encodeURIComponent(
    siteConfig.whatsappPrefilled,
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      data-analytics-event="whatsapp_click"
      className="hidden md:flex fixed bottom-6 right-6 z-40 h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2.003a9.95 9.95 0 0 0-8.53 14.97L2 22l5.17-1.46a9.95 9.95 0 1 0 4.87-18.53Zm5.82 14.08c-.25.7-1.47 1.37-2.02 1.4-.54.02-1.04.04-1.67-.11-.39-.1-.89-.27-1.54-.55-2.71-1.17-4.47-3.9-4.61-4.08-.13-.18-1.1-1.46-1.1-2.78s.7-1.97.95-2.24c.24-.28.53-.35.7-.35.18 0 .36 0 .51.01.16.01.38-.06.6.46.22.52.74 1.8.81 1.94.07.13.11.29.02.47-.08.18-.13.29-.26.44-.13.15-.28.34-.39.45-.13.13-.26.27-.12.54.14.26.63 1.04 1.36 1.68.94.84 1.72 1.11 1.98 1.24.26.13.41.11.56-.07.15-.18.64-.74.81-1 .17-.26.34-.22.57-.13.23.09 1.46.69 1.71.81.25.13.42.18.48.28.06.1.06.59-.19 1.29Z" />
      </svg>
    </a>
  );
}
