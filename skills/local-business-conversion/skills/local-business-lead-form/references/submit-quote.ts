"use server";

import { Resend } from "resend";
import { sanityWriteClient } from "@/lib/sanity/client";

type QuotePayload = {
  name: string;
  phone: string;
  email?: string;
  fromPostcode?: string;
  toPostcode?: string;
  propertySize: string;
  preferredDate?: string;
  services: string[];
  notes: string;
  source?: string;
  /** Marketing attribution from the "How did you hear about us?" select.
   *  Distinct from `source`, which tags the form-origin (homepage_hero_2step). */
  referrer?: string;
};

export async function submitQuote(data: QuotePayload): Promise<{ ok: boolean; error?: string }> {
  if (!data.name || !data.phone) {
    return { ok: false, error: "Please fill in your name and phone number." };
  }

  const submittedAt = new Date().toISOString();
  const to = process.env.RESEND_TO_EMAIL ?? "hello@marleymoves.co.uk";
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  // 1. Send email via Resend
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `New quote request from ${data.name}${data.fromPostcode ? ` (${data.fromPostcode} → ${data.toPostcode ?? "?"})` : ""}`,
      text: renderEmail(data, submittedAt),
    });
  } catch (err) {
    console.error("Resend failed:", err);
    // Continue to still store in Sanity
  }

  // 2. Store in Sanity
  try {
    if (process.env.SANITY_API_READ_TOKEN) {
      await sanityWriteClient.create({
        _type: "quoteSubmission",
        ...data,
        submittedAt,
        status: "new",
      });
    }
  } catch (err) {
    console.error("Sanity create failed:", err);
  }

  return { ok: true };
}

function renderEmail(d: QuotePayload, when: string): string {
  return [
    `New quote request, submitted ${when}`,
    d.source ? `Form:     ${d.source}` : "",
    d.referrer ? `Referrer: ${d.referrer}` : "",
    "",
    `Name:    ${d.name}`,
    `Phone:   ${d.phone}`,
    `Email:   ${d.email || "(not provided)"}`,
    "",
    `From:    ${d.fromPostcode || "(not provided)"}`,
    `To:      ${d.toPostcode || "(not provided)"}`,
    `Size:    ${d.propertySize || "(not specified)"}`,
    `Date:    ${d.preferredDate || "(flexible)"}`,
    `Services: ${d.services.join(", ") || "(none specified)"}`,
    "",
    `Notes:`,
    d.notes || "(none)",
  ].filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n");
}
