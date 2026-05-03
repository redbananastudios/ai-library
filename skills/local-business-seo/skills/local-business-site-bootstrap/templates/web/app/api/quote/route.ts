/**
 * Quote / contact form server action via Resend.
 *
 * Honeypot spam protection: hidden 'website' field — bots fill it, humans
 * don't. If populated, return 200 silently (never tell the bot it was
 * caught).
 *
 * Sends to siteConfig.contact.email FROM the verified Resend domain.
 * Domain verification is part of pre-launch-checklist.
 */

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { siteConfig } from '@/lib/site-config'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS ?? `quotes@send.${siteConfig.url.productionHost}`

type Body = {
  name?: string
  phone?: string
  email?: string
  message?: string
  /** Honeypot — must be empty. */
  website?: string
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.website && body.website.length > 0) {
    return NextResponse.json({ ok: true })
  }

  const required = ['name', 'phone', 'email', 'message'] as const
  for (const k of required) {
    if (!body[k] || (body[k] as string).trim().length === 0) {
      return NextResponse.json({ ok: false, error: `Missing ${k}` }, { status: 400 })
    }
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: 'Email not configured' }, { status: 500 })
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: siteConfig.contact.email,
      replyTo: body.email,
      subject: `Quote request from ${body.name}`,
      text:
        `Name: ${body.name}\n` +
        `Phone: ${body.phone}\n` +
        `Email: ${body.email}\n\n` +
        `Message:\n${body.message}`,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Resend error:', err)
    return NextResponse.json({ ok: false, error: 'Send failed' }, { status: 500 })
  }
}
