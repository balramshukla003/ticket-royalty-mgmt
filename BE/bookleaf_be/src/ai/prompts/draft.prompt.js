import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { BOOK_STATUS_LABELS } from '../../constants/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const KB_MAP = {
  ROYALTY_PAYMENTS:         'royalty.md',
  ISBN_METADATA:            'isbn.md',
  PRINTING_QUALITY:         'printing.md',
  DISTRIBUTION_AVAILABILITY:'distribution.md',
  BOOK_STATUS_PRODUCTION:   'production.md',
  GENERAL_INQUIRY:          'general.md',
};

const loadKB = (category) => {
  const file = KB_MAP[category] || 'general.md';
  const kbPath = path.join(__dirname, '../knowledge', file);
  try {
    return readFileSync(kbPath, 'utf-8');
  } catch {
    return '';
  }
};

export const buildDraftPrompt = ({ ticket, authorData, bookData }) => {
  const kb = loadKB(ticket.category);

  const authorContext = `
Author name: ${authorData.name}
Author city: ${authorData.author_profiles?.city || 'N/A'}
Bank details linked: ${authorData.author_profiles?.bank_details_linked ? 'Yes' : 'No'}
`.trim();

  const bookContext = bookData ? `
Book title: ${bookData.title}
Book status: ${BOOK_STATUS_LABELS[bookData.status] || bookData.status}
MRP: ₹${bookData.mrp || 'N/A'}
Copies sold: ${bookData.copies_sold}
Royalty earned: ₹${bookData.royalty_earned}
Royalty paid: ₹${bookData.royalty_paid}
Royalty pending: ₹${bookData.royalty_pending}
Last payout date: ${bookData.last_payout_date || 'Never paid'}
Print partner: ${bookData.print_partner || 'N/A'}
`.trim() : 'No specific book — account-level query.';

  return `
You are a support representative for BookLeaf Publishing. Draft a professional, empathetic response to the following author support ticket.

KNOWLEDGE BASE (use this to answer accurately):
${kb}

AUTHOR CONTEXT:
${authorContext}

BOOK CONTEXT:
${bookContext}

TICKET SUBJECT: ${ticket.subject}
TICKET DESCRIPTION: ${ticket.description}

TONE GUIDELINES:
- Always acknowledge the author's concern before jumping to solutions.
- Be specific: include actual numbers, dates, and statuses wherever possible.
- If something is BookLeaf's fault, own it directly. No corporate deflection.
- If escalation is needed, give a clear timeline (e.g., "Our team will look into this within 48 hours").
- Always end with a clear next step.
- Address the author by their first name.
- Do NOT sound like a generic AI — sound like a knowledgeable, caring BookLeaf team member.
- Keep the response concise but complete (150–300 words).

Write ONLY the response text. No subject line, no "Dear/Hi" prefix needed — start directly with the greeting using the author's first name.
`.trim();
};
