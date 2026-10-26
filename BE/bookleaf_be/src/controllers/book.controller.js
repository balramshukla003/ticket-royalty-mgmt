import bookService  from '../services/book.service.js';
import { ok }        from '../core/http/response.js';
import asyncHandler  from '../core/asyncHandler.js';

const bookController = {
  getMyBooks: asyncHandler(async (req, res) => {
    const result = await bookService.getMyBooks(req.user.id);
    return ok(res, result, 'Books fetched');
  }),

  getMyBookById: asyncHandler(async (req, res) => {
    const book = await bookService.getMyBookById(parseInt(req.params.id), req.user.id);
    return ok(res, book, 'Book fetched');
  }),

  getDropdown: asyncHandler(async (req, res) => {
    const books = await bookService.getPublishedBooksForDropdown(req.user.id);
    return ok(res, books, 'Books fetched for dropdown');
  }),
};

export default bookController;
