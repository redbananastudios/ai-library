# Changelog - AI Mailbox Assistant

## 0.2.0 (2026-04-10)

- Added IMAP support via imapflow for reading emails from IONOS and other providers
- Added SMTP support via nodemailer for sending emails through IONOS and other providers
- IONOS server settings: imap.ionos.com:993 (SSL), smtp.ionos.com:587 (STARTTLS)
- Email body parsing via mailparser
- IMAP search criteria support (from, subject, date, flags, unseen)
- Send with attachments support
- HTML email sending
- Reply-to threading (In-Reply-To / References headers)
- Mailbox folder listing
- Added server settings table for Outlook, Yahoo, Zoho, GoDaddy, Namecheap

## 0.1.0 (2026-04-09)

- Initial creation
- Gmail MCP tool integration
- Inbox triage and email summarization
- Email search with Gmail query syntax
- Thread reading and conversation tracking
- Draft creation for new emails and replies
- Label management and organization
- Unread email monitoring
- Email templates and professional formatting
