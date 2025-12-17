/**
 * LLM API wrapper for OpenAI/Groq/Mistral
 */

import type { ChatMessage, ChatResponse } from "./types";

const API_PROVIDER = process.env.NEXT_PUBLIC_LLM_PROVIDER || "openai"; // openai, groq, mistral

interface LLMConfig {
  apiKey: string;
  endpoint: string;
  model: string;
}

function getLLMConfig(): LLMConfig {
  switch (API_PROVIDER.toLowerCase()) {
    case "groq":
      return {
        apiKey: process.env.GROQ_API_KEY || "",
        endpoint: "https://api.groq.com/openai/v1/chat/completions",
        model: "mixtral-8x7b-32768",
      };
    case "mistral":
      return {
        apiKey: process.env.MISTRAL_API_KEY || "",
        endpoint: "https://api.mistral.ai/v1/chat/completions",
        model: "mistral-medium",
      };
    default: // openai
      return {
        apiKey: process.env.OPENAI_API_KEY || "",
        endpoint: "https://api.openai.com/v1/chat/completions",
        model: "gpt-3.5-turbo",
      };
  }
}

const SYSTEM_PROMPT = `You are a helpful AI assistant for the Smart Campus Assistant app. You help students with:
- General questions about the campus
- Study advice and academic guidance
- Information about the app features and how to use them

Always be friendly, concise, and helpful. If you don't know something, acknowledge it and suggest where they might find the answer.
Do not provide personal advice on matters outside the scope of campus life and academics.`;

export async function chatWithLLM(
  messages: ChatMessage[],
  context?: string
): Promise<ChatResponse> {
  const config = getLLMConfig();

  if (!config.apiKey) {
    throw new Error(`Missing API key for ${API_PROVIDER}`);
  }

  const systemContent = context
    ? `${SYSTEM_PROMPT}\n\nAdditional Context:\n${context}`
    : SYSTEM_PROMPT;

  const requestBody = {
    model: config.model,
    messages: [
      { role: "system", content: systemContent },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 500,
  };

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return {
      reply,
      sources: [],
    };
  } catch (error) {
    throw new Error(`Failed to communicate with LLM: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
