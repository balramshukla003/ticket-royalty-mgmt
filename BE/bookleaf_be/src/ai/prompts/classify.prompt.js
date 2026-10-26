export const buildClassifyPrompt = ({ subject, description }) => `
You are a support ticket classifier for BookLeaf Publishing, a self-publishing company.

Classify the following support ticket into exactly ONE category and ONE priority level.
Respond ONLY with valid JSON — no explanation, no markdown, no extra text.

Categories:
- ROYALTY_PAYMENTS: royalties, payments, bank transfers, earnings, payout
- ISBN_METADATA: ISBN numbers, metadata, book description, author bio updates
- PRINTING_QUALITY: print quality, binding, misprints, author copies, defects
- DISTRIBUTION_AVAILABILITY: book availability, Amazon listing, Flipkart, stock
- BOOK_STATUS_PRODUCTION: production stage, typesetting, cover design, publishing timeline
- GENERAL_INQUIRY: anything else

Priority rules:
- CRITICAL: ISBN errors, data integrity issues, financial fraud suspicion
- HIGH: overdue payments (past 45 days), major quality defects, book unavailable for over a week
- MEDIUM: production delays, general availability questions, royalty amount queries
- LOW: metadata updates, general how-to questions, bio changes

Ticket subject: ${subject}
Ticket description: ${description}

Respond with this exact JSON structure:
{
  "category": "CATEGORY_VALUE",
  "priority": "PRIORITY_VALUE",
  "reason": "One sentence explaining the classification"
}
`.trim();
