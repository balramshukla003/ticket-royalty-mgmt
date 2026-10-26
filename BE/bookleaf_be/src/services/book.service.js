import bookRepository from '../repositories/book.repository.js';
import { NotFoundError } from '../core/errors/AppError.js';
import { toBookDTO, toAuthorRoyaltySummaryDTO } from '../dtos/response/book.dto.js';

const bookService = {
  getMyBooks: async (authorId) => {
    const books = await bookRepository.findByAuthor(authorId);
    return {
      books:   books.map(toBookDTO),
      summary: toAuthorRoyaltySummaryDTO(books),
    };
  },

  getMyBookById: async (id, authorId) => {
    const book = await bookRepository.findByIdAndAuthor(id, authorId);
    if (!book) throw new NotFoundError('Book');
    return toBookDTO(book);
  },

  getPublishedBooksForDropdown: (authorId) =>
    bookRepository.findPublishedByAuthor(authorId),
};

export default bookService;
