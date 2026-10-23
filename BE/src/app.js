import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorHandler from './middlewares/errorHandler.js';
import { env } from './config/env.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'BookLeaf API is running', env: env.NODE_ENV });
});

// routes will be added here in the next step

app.use(errorHandler);

export default app;