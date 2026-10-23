import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('5000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    GEMINI_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    SEED_DATE_SHIFT_MONTHS: z.string().default('8'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    parsed.error.errors.forEach((e) => {
        console.error(`   ${e.path.join('.')}: ${e.message}`);
    });
    process.exit(1);
}

export const env = parsed.data;