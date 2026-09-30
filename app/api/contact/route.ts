import { NextRequest, NextResponse } from "next/server";

const limits = new Map<string, { count: number; reset: number }>();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]!);

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  const current = limits.get(ip);
  if (current && current.reset > now && current.count >= 5) {
    return NextResponse.json({ ok: false, message: "Please wait before trying again." }, { status: 429 });
  }
  limits.set(ip, current && current.reset > now ? { ...current, count: current.count + 1 } : { count: 1, reset: now + 600_000 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  if (clean(body.website, 100)) return NextResponse.json({ ok: true });
  const name = clean(body.name, 80);
  const email = clean(body.email, 160);
  const message = clean(body.message, 2000);
  if (name.length < 2 || !emailPattern.test(email) || message.length < 10) {
    return NextResponse.json({ ok: false, message: "Please check every field and try again." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    return NextResponse.json({ ok: false, message: "The portal is being configured. Please email Kartik directly." }, { status: 503 });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: ["kartiksharma15.07.2004@gmail.com"],
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      html: `<p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    }),
  });

  if (!response.ok) return NextResponse.json({ ok: false, message: "The message could not be sent. Please email Kartik directly." }, { status: 502 });
  return NextResponse.json({ ok: true, message: "Message sent." });
}
