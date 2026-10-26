import { BOOK_STATUS_LABELS, PRINT_PARTNER_LABELS, PLATFORM_LABELS } from '../../constants/index.js';

export const toBookDTO = (book) => ({
  id:              book.id,
  bookCode:        book.book_code,
  title:           book.title,
  isbn:            book.isbn,
  genre:           book.genre,
  publicationDate: book.publication_date,
  status:          book.status,
  statusLabel:     BOOK_STATUS_LABELS[book.status] || book.status,
  mrp:             book.mrp ? parseFloat(book.mrp) : null,
  royaltyPerCopy:  book.royalty_per_copy ? parseFloat(book.royalty_per_copy) : null,
  copiesSold:      book.copies_sold,
  royaltyEarned:   parseFloat(book.royalty_earned),
  royaltyPaid:     parseFloat(book.royalty_paid),
  royaltyPending:  parseFloat(book.royalty_pending),
  lastPayoutDate:  book.last_payout_date,
  printPartner:    book.print_partner ? PRINT_PARTNER_LABELS[book.print_partner] : null,
  availableOn:     (book.book_platforms || []).map((p) => ({
    key:   p.platform,
    label: PLATFORM_LABELS[p.platform] || p.platform,
  })),
  isInProduction:  book.status !== 'PUBLISHED_LIVE',
});

export const toBookSummaryDTO = (book) => ({
  id:       book.id,
  bookCode: book.book_code,
  title:    book.title,
  isbn:     book.isbn,
  status:   book.status,
  statusLabel: BOOK_STATUS_LABELS[book.status] || book.status,
});

export const toAuthorRoyaltySummaryDTO = (books) => {
  const published = books.filter((b) => b.status === 'PUBLISHED_LIVE');
  return {
    totalBooks:       books.length,
    publishedBooks:   published.length,
    inProductionBooks: books.length - published.length,
    totalEarned:      published.reduce((s, b) => s + parseFloat(b.royalty_earned), 0),
    totalPaid:        published.reduce((s, b) => s + parseFloat(b.royalty_paid),   0),
    totalPending:     published.reduce((s, b) => s + parseFloat(b.royalty_pending),0),
    totalCopiesSold:  published.reduce((s, b) => s + b.copies_sold, 0),
  };
};
