import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { env } from '../../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '../../config/ai.config.json');
const aiConfig = JSON.parse(readFileSync(configPath, 'utf-8'));

export const getActiveProvider = () => {
  const providerName = aiConfig.activeProvider;
  const providerConfig = aiConfig.providers[providerName];
  if (!providerConfig) throw new Error(`AI provider "${providerName}" not found in config`);

  const apiKey = env[providerConfig.apiKeyEnv];
  if (!apiKey) throw new Error(`API key env var "${providerConfig.apiKeyEnv}" is not set`);

  return { providerName, providerConfig, apiKey };
};

export const generate = async (prompt) => {
  const { providerName, providerConfig, apiKey } = getActiveProvider();

  if (providerName === 'gemini') {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: providerConfig.model });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: providerConfig.maxTokens,
        temperature:     providerConfig.temperature,
      },
    });
    const text = result.response.text();
    const usage = result.response.usageMetadata;
    return {
      text,
      promptTokens:     usage?.promptTokenCount     || 0,
      completionTokens: usage?.candidatesTokenCount || 0,
      model:            providerConfig.model,
      provider:         providerName,
    };
  }

  if (providerName === 'gpt') {
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model:       providerConfig.model,
      messages:    [{ role: 'user', content: prompt }],
      max_tokens:  providerConfig.maxTokens,
      temperature: providerConfig.temperature,
    });
    const text = response.choices[0].message.content;
    return {
      text,
      promptTokens:     response.usage?.prompt_tokens     || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      model:            providerConfig.model,
      provider:         providerName,
    };
  }

  throw new Error(`Unsupported provider: ${providerName}`);
};
