import { env } from '../config/env.js';

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const current = env.NODE_ENV === 'production' ? 1 : 3;

const format = (level, message, meta) => {
    const ts = new Date().toISOString();
    const base = `[${ts}] [${level.toUpperCase()}] ${message}`;
    return meta ? `${base} ${JSON.stringify(meta)}` : base;
};

const logger = {
    error: (msg, meta) => levels.error <= current && console.error(format('error', msg, meta)),
    warn: (msg, meta) => levels.warn <= current && console.warn(format('warn', msg, meta)),
    info: (msg, meta) => levels.info <= current && console.info(format('info', msg, meta)),
    debug: (msg, meta) => levels.debug <= current && console.log(format('debug', msg, meta)),
};

export default logger;