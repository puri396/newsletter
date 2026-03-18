/**
 * WhatsApp recipient selection: active subscribers who opted in and have a phone number.
 * Used by both automatic (publish-now) and manual (whatsapp-broadcast) sends.
 */

import { prisma } from "@/lib/db";

/** Subscriber fields needed for sending WhatsApp (phone is non-null when returned from getWhatsAppRecipients). */
export type WhatsAppRecipient = {
  id: string;
  email: string;
  name: string | null;
  phone: string;
};

/**
 * Fetches all subscribers eligible for WhatsApp: status active, whatsappOptIn true, phone set.
 * Phone is normalized to E.164 in DB; returned list is safe to pass to sendWhatsAppTemplate(phone).
 */
export async function getWhatsAppRecipients(): Promise<WhatsAppRecipient[]> {
  const rows = await prisma.subscriber.findMany({
    where: {
      status: "active",
      whatsappOptIn: true,
      phone: { not: null },
    },
    select: { id: true, email: true, name: true, phone: true },
  });
  return rows
    .filter((r): r is typeof r & { phone: string } => r.phone != null)
    .map((r) => ({ id: r.id, email: r.email, name: r.name, phone: r.phone }));
}

/**
 * Returns the count of WhatsApp-eligible subscribers (for admin UI / reach display).
 */
export async function getWhatsAppRecipientCount(): Promise<number> {
  return prisma.subscriber.count({
    where: {
      status: "active",
      whatsappOptIn: true,
      phone: { not: null },
    },
  });
}
