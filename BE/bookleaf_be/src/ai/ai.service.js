import { generate }             from './providers/index.js';
import { buildClassifyPrompt }  from './prompts/classify.prompt.js';
import { buildDraftPrompt }     from './prompts/draft.prompt.js';
import aiLogRepository          from '../repositories/aiLog.repository.js';
import logger                   from '../core/logger.js';
import { TICKET_CATEGORY, TICKET_PRIORITY } from '../constants/index.js';

// ── Keyword-based fallback classifier ──────────────────────────────────────
const KEYWORD_MAP = [
  { category: TICKET_CATEGORY.ROYALTY_PAYMENTS,          keywords: ['royalt', 'payment', 'paid', 'earn', 'bank', 'payout', 'money'] },
  { category: TICKET_CATEGORY.ISBN_METADATA,             keywords: ['isbn', 'metadata', 'description', 'bio', 'wrong title'] },
  { category: TICKET_CATEGORY.PRINTING_QUALITY,          keywords: ['print', 'quality', 'blurry', 'misalign', 'binding', 'defect', 'copy', 'copies'] },
  { category: TICKET_CATEGORY.DISTRIBUTION_AVAILABILITY, keywords: ['unavailable', 'amazon', 'flipkart', 'listed', 'stock', 'distribution'] },
  { category: TICKET_CATEGORY.BOOK_STATUS_PRODUCTION,    keywords: ['production', 'typeset', 'cover design', 'stage', 'publish', 'timeline', 'when will'] },
];

export const fallbackClassify = (subject, description) => {
  const text = `${subject} ${description}`.toLowerCase();
  for (const { category, keywords } of KEYWORD_MAP) {
    if (keywords.some((kw) => text.includes(kw))) {
      return { category, priority: TICKET_PRIORITY.MEDIUM, reason: 'Keyword-based fallback classification' };
    }
  }
  return { category: TICKET_CATEGORY.GENERAL_INQUIRY, priority: TICKET_PRIORITY.LOW, reason: 'Default fallback' };
};

// ── Retry helper ────────────────────────────────────────────────────────────
const withRetry = async (fn, retries = 2, delays = [1000, 3000]) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      logger.warn(`AI call failed, retrying in ${delays[attempt]}ms`, { attempt, error: err.message });
      await new Promise((r) => setTimeout(r, delays[attempt]));
    }
  }
};

// ── Classify ticket ──────────────────────────────────────────────────────────
export const classifyTicket = async (ticket) => {
  const start = Date.now();
  let logData = { ticket_id: ticket.id, type: 'CLASSIFY', success: false };

  try {
    const prompt = buildClassifyPrompt({ subject: ticket.subject, description: ticket.description });

    const result = await withRetry(() => generate(prompt));

    logData = {
      ...logData,
      provider:          result.provider,
      model:             result.model,
      prompt_tokens:     result.promptTokens,
      completion_tokens: result.completionTokens,
      latency_ms:        Date.now() - start,
      success:           true,
    };

    // Strip any markdown fences the model may add
    const clean = result.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    const category = Object.values(TICKET_CATEGORY).includes(parsed.category)
      ? parsed.category
      : TICKET_CATEGORY.GENERAL_INQUIRY;

    const priority = Object.values(TICKET_PRIORITY).includes(parsed.priority)
      ? parsed.priority
      : TICKET_PRIORITY.MEDIUM;

    await aiLogRepository.create(logData).catch(() => {});

    return { category, priority, reason: parsed.reason || '' };
  } catch (err) {
    logData.error_message = err.message;
    logData.latency_ms    = Date.now() - start;
    await aiLogRepository.create(logData).catch(() => {});

    logger.warn('AI classify failed, using fallback', { error: err.message });
    return null; // caller handles null as failure
  }
};

// ── Generate draft ───────────────────────────────────────────────────────────
export const generateDraft = async ({ ticket, authorData, bookData }) => {
  const start = Date.now();
  let logData = { ticket_id: ticket.id, type: 'DRAFT', success: false };

  try {
    const prompt = buildDraftPrompt({ ticket, authorData, bookData });
    const result = await withRetry(() => generate(prompt));

    logData = {
      ...logData,
      provider:          result.provider,
      model:             result.model,
      prompt_tokens:     result.promptTokens,
      completion_tokens: result.completionTokens,
      latency_ms:        Date.now() - start,
      success:           true,
    };

    await aiLogRepository.create(logData).catch(() => {});
    return result.text.trim();
  } catch (err) {
    logData.error_message = err.message;
    logData.latency_ms    = Date.now() - start;
    await aiLogRepository.create(logData).catch(() => {});
    logger.warn('AI draft generation failed', { error: err.message });
    return null;
  }
};
