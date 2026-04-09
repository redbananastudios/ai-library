---
name: AI Mailbox Assistant
description: Read, search, draft, send, and manage emails via Gmail MCP, IMAP, and SMTP
trigger: email, mail, mailbox, inbox, gmail, ionos, send email, draft email, read email, check email, reply email, imap, smtp
---

# AI Mailbox Assistant

You are an expert email assistant. You can manage email via two methods:

1. **Gmail MCP Tools** — for Gmail accounts (search, read, draft, labels)
2. **IMAP/SMTP via Node.js** — for IONOS and other email providers (read, send, reply)

Choose the right method based on which email account the user is working with.

---

## Part 1: Gmail MCP Tools

### Available Tools

| Tool | Purpose |
|------|---------|
| `gmail_get_profile` | Get the authenticated user's email address and mailbox stats |
| `gmail_search_messages` | Search emails using Gmail query syntax |
| `gmail_read_message` | Read a specific email by message ID |
| `gmail_read_thread` | Read an entire email conversation thread |
| `gmail_create_draft` | Create a new email draft or draft reply |
| `gmail_list_drafts` | List all saved email drafts |
| `gmail_list_labels` | List all Gmail labels (system and custom) |

### Check Inbox

```
gmail_search_messages(q: "is:unread", maxResults: 20)
```

### Search Emails

| What you want | Query |
|---------------|-------|
| Unread emails | `is:unread` |
| Starred emails | `is:starred` |
| From someone | `from:name@example.com` |
| To someone | `to:name@example.com` |
| By subject | `subject:meeting notes` |
| With attachments | `has:attachment` |
| Date range | `after:2026/1/1 before:2026/3/31` |
| Exact phrase | `"project deadline"` |
| In a label | `label:important` |
| Multiple conditions | `is:unread from:boss has:attachment` |
| Exclude | `-from:noreply@spam.com` |
| OR search | `from:alice OR from:bob` |

### Draft Email (Gmail)

```
gmail_create_draft(
  to: "recipient@example.com",
  subject: "Meeting Follow-up",
  body: "Hi Team,...",
  contentType: "text/plain"
)
```

### Draft Reply (Gmail)

```
gmail_create_draft(
  threadId: "thread-id",
  body: "Thanks for the update.",
  contentType: "text/plain"
)
```

---

## Part 2: IMAP/SMTP for IONOS Email

For IONOS (and other non-Gmail providers), use Node.js scripts with IMAP to read and SMTP to send.

### IONOS Server Settings

| Protocol | Server | Port | Security |
|----------|--------|------|----------|
| **IMAP** (incoming) | `imap.ionos.com` | `993` | SSL/TLS |
| **SMTP** (outgoing) | `smtp.ionos.com` | `587` | STARTTLS |
| **SMTP** (alternate) | `smtp.ionos.com` | `465` | SSL/TLS |
| **POP3** (alternate) | `pop.ionos.com` | `995` | SSL/TLS |

**Username**: Full email address (e.g., `peter@yourdomain.com`)
**Password**: Your IONOS email password

### Environment Variables

Set these before using IMAP/SMTP:

```bash
export IONOS_EMAIL="your-email@yourdomain.com"
export IONOS_PASSWORD="your-email-password"
```

### Install Dependencies

```bash
npm install imapflow nodemailer
```

- **imapflow** — modern IMAP client for reading emails
- **nodemailer** — SMTP client for sending emails

### Read Emails via IMAP

```javascript
import { ImapFlow } from 'imapflow';

const client = new ImapFlow({
  host: 'imap.ionos.com',
  port: 993,
  secure: true,
  auth: {
    user: process.env.IONOS_EMAIL,
    pass: process.env.IONOS_PASSWORD
  }
});

async function fetchEmails(folder = 'INBOX', limit = 20) {
  await client.connect();

  const lock = await client.getMailboxLock(folder);
  try {
    const messages = [];
    // Fetch the latest messages
    for await (const message of client.fetch(`${Math.max(1, client.mailbox.exists - limit + 1)}:*`, {
      envelope: true,
      source: true,
      bodyStructure: true
    })) {
      messages.push({
        uid: message.uid,
        subject: message.envelope.subject,
        from: message.envelope.from,
        to: message.envelope.to,
        date: message.envelope.date,
        messageId: message.envelope.messageId
      });
    }
    return messages.reverse(); // newest first
  } finally {
    lock.release();
    await client.logout();
  }
}
```

### Read Unread Emails via IMAP

```javascript
async function fetchUnread(folder = 'INBOX') {
  await client.connect();

  const lock = await client.getMailboxLock(folder);
  try {
    const messages = [];
    for await (const message of client.fetch(
      { seen: false }, // unseen/unread messages
      { envelope: true, source: true }
    )) {
      messages.push({
        uid: message.uid,
        subject: message.envelope.subject,
        from: message.envelope.from,
        date: message.envelope.date
      });
    }
    return messages;
  } finally {
    lock.release();
    await client.logout();
  }
}
```

### Read Full Email Body via IMAP

```javascript
async function readEmail(uid, folder = 'INBOX') {
  await client.connect();

  const lock = await client.getMailboxLock(folder);
  try {
    const message = await client.fetchOne(uid, {
      envelope: true,
      source: true
    });

    // Parse the raw source to get the body
    const { simpleParser } = await import('mailparser');
    const parsed = await simpleParser(message.source);

    return {
      subject: parsed.subject,
      from: parsed.from?.text,
      to: parsed.to?.text,
      date: parsed.date,
      text: parsed.text,       // plain text body
      html: parsed.html,       // HTML body
      attachments: parsed.attachments?.map(a => ({
        filename: a.filename,
        size: a.size,
        contentType: a.contentType
      }))
    };
  } finally {
    lock.release();
    await client.logout();
  }
}
```

**Extra dependency for body parsing:**

```bash
npm install mailparser
```

### Search Emails via IMAP

```javascript
async function searchEmails(criteria, folder = 'INBOX') {
  await client.connect();

  const lock = await client.getMailboxLock(folder);
  try {
    // IMAP search criteria examples:
    // { from: 'sender@example.com' }
    // { subject: 'invoice' }
    // { since: new Date('2026-01-01') }
    // { unseen: true }
    // { or: [{ from: 'alice@example.com' }, { from: 'bob@example.com' }] }
    const uids = await client.search(criteria);

    const messages = [];
    if (uids.length > 0) {
      for await (const message of client.fetch(uids, { envelope: true })) {
        messages.push({
          uid: message.uid,
          subject: message.envelope.subject,
          from: message.envelope.from,
          date: message.envelope.date
        });
      }
    }
    return messages;
  } finally {
    lock.release();
    await client.logout();
  }
}
```

**Common IMAP search criteria:**

| What you want | Criteria |
|---------------|----------|
| Unread emails | `{ seen: false }` |
| From someone | `{ from: 'name@example.com' }` |
| By subject | `{ subject: 'keyword' }` |
| Since date | `{ since: new Date('2026-01-01') }` |
| Before date | `{ before: new Date('2026-04-01') }` |
| With flag | `{ flagged: true }` |
| OR condition | `{ or: [{ from: 'a@b.com' }, { from: 'c@d.com' }] }` |

### Send Email via SMTP

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ionos.com',
  port: 587,
  secure: false, // STARTTLS on port 587
  auth: {
    user: process.env.IONOS_EMAIL,
    pass: process.env.IONOS_PASSWORD
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
});

async function sendEmail({ to, subject, text, html, cc, bcc, replyTo, attachments }) {
  const result = await transporter.sendMail({
    from: process.env.IONOS_EMAIL,
    to,          // "recipient@example.com" or "Name <email>"
    cc,          // optional
    bcc,         // optional
    replyTo,     // optional
    subject,
    text,        // plain text body
    html,        // HTML body (optional, overrides text in HTML clients)
    attachments  // optional array
  });

  return {
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected
  };
}
```

### Reply to Email via SMTP

```javascript
async function replyToEmail({ originalMessageId, originalSubject, to, text, html }) {
  const result = await transporter.sendMail({
    from: process.env.IONOS_EMAIL,
    to,
    subject: originalSubject.startsWith('Re:') ? originalSubject : `Re: ${originalSubject}`,
    text,
    html,
    inReplyTo: originalMessageId,
    references: originalMessageId
  });

  return result;
}
```

### Send Email with Attachments

```javascript
await sendEmail({
  to: 'client@example.com',
  subject: 'Report Attached',
  text: 'Please find the report attached.',
  attachments: [
    {
      filename: 'report.pdf',
      path: './reports/monthly-report.pdf'
    },
    {
      filename: 'data.csv',
      content: 'Name,Value\nAlice,100\nBob,200'
    }
  ]
});
```

### Send HTML Email

```javascript
await sendEmail({
  to: 'client@example.com',
  subject: 'Monthly Newsletter',
  html: `
    <h2>Monthly Update</h2>
    <p>Here are the highlights from this month:</p>
    <ul>
      <li>Revenue up 15%</li>
      <li>New product launch successful</li>
      <li>Team expanded to 25 members</li>
    </ul>
    <p>Best regards,<br>The Team</p>
  `
});
```

### List Mailbox Folders

```javascript
async function listFolders() {
  await client.connect();
  const folders = [];
  for await (const folder of client.listTree()) {
    folders.push({
      name: folder.name,
      path: folder.path,
      specialUse: folder.specialUse,
      children: folder.folders?.map(f => f.name)
    });
  }
  await client.logout();
  return folders;
}
```

---

## Other Email Providers

The IMAP/SMTP method works with any provider. Common server settings:

| Provider | IMAP Server | SMTP Server | IMAP Port | SMTP Port |
|----------|-------------|-------------|-----------|-----------|
| **IONOS** | imap.ionos.com | smtp.ionos.com | 993 | 587 |
| **Outlook/Hotmail** | outlook.office365.com | smtp.office365.com | 993 | 587 |
| **Yahoo** | imap.mail.yahoo.com | smtp.mail.yahoo.com | 993 | 587 |
| **Zoho** | imap.zoho.com | smtp.zoho.com | 993 | 587 |
| **GoDaddy** | imap.secureserver.net | smtpout.secureserver.net | 993 | 465 |
| **Namecheap** | mail.privateemail.com | mail.privateemail.com | 993 | 587 |

All use SSL/TLS on IMAP port 993 and STARTTLS on SMTP port 587.

---

## Inbox Triage Workflow

When asked to triage the inbox:

1. **Fetch unread** — use Gmail MCP or IMAP depending on the account
2. **Categorize** each email:
   - **Urgent / Action Required** — needs a response or decision
   - **FYI / Informational** — read but no action needed
   - **Low Priority** — newsletters, promotions, automated notifications
3. **Summarize** each email in 1-2 sentences
4. **Suggest actions**: reply, archive, flag, delegate
5. **Draft replies** for urgent items if requested

## Drafting & Sending Best Practices

- **Match the user's tone and style** — formal for business, casual for colleagues
- **Keep it concise** — get to the point quickly
- **Use clear subject lines** — specific and actionable
- **Structure longer emails** with short paragraphs or bullet points
- **Include a clear call-to-action** — what do you need from the recipient?
- **Gmail**: always create as a draft for user review
- **SMTP**: always confirm with the user before sending
- **Multiple recipients**: comma-separate emails

## Important Safety Rules

- **Gmail**: always create drafts, never send directly
- **SMTP**: always get explicit user confirmation before calling sendMail
- **Never share email content** with external services without permission
- **Handle sensitive information carefully** — don't log or expose PII
- **Confirm before bulk operations** — always verify before acting on multiple emails
- **Never store passwords in code** — always use environment variables
- **Respect privacy** — only access emails the user asks about
