import prisma from '../config/db.js';

const BOOK_WITH_PLATFORMS = {
  book_platforms: true,
};

const bookRepository = {
  findByAuthor: (authorId) =>
    prisma.books.findMany({
      where:   { author_id: authorId },
      include: BOOK_WITH_PLATFORMS,
      orderBy: { created_at: 'desc' },
    }),

  findByIdAndAuthor: (id, authorId) =>
    prisma.books.findFirst({
      where:   { id, author_id: authorId },
      include: BOOK_WITH_PLATFORMS,
    }),

  findById: (id) =>
    prisma.books.findUnique({
      where:   { id },
      include: BOOK_WITH_PLATFORMS,
    }),

  // For ticket dropdown — only published books of an author
  findPublishedByAuthor: (authorId) =>
    prisma.books.findMany({
      where:   { author_id: authorId, status: 'PUBLISHED_LIVE' },
      select:  { id: true, book_code: true, title: true, isbn: true },
      orderBy: { title: 'asc' },
    }),
};

export default bookRepository;
