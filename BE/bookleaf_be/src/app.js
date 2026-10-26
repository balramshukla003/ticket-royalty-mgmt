import express              from 'express';
import cors                 from 'cors';
import helmet               from 'helmet';
import morgan               from 'morgan';
import errorHandler         from './middlewares/errorHandler.js';
import { env }              from './config/env.js';

import authRoutes           from './routes/auth.routes.js';
import bookRoutes           from './routes/book.routes.js';
import ticketRoutes         from './routes/ticket.routes.js';
import adminRoutes          from './routes/admin.routes.js';
import notificationRoutes   from './routes/notification.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (env.NODE_ENV === 'development') app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'BookLeaf API is running', env: env.NODE_ENV });
});

// Routes
app.use('/api/v1/auth',          authRoutes);
app.use('/api/v1/books',         bookRoutes);
app.use('/api/v1/tickets',       ticketRoutes);
app.use('/api/v1/admin',         adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` });
});

app.use(errorHandler);

export default app;
