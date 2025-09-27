import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import { GenerateObjectResult, generateObject } from "ai"
import { z } from "zod"

export type AIModel =
  | "claude-3-5-haiku-20241022"
  | "claude-sonnet-4-20250514"
  | "gpt-5-nano"
  | "gpt-5-mini"

export interface AIClientConfig {
  provider: "anthropic" | "openai"
  model: AIModel
  apiKey: string
}

export const createAIClient = (config: AIClientConfig) => {
  const { provider, model, apiKey } = config

  console.log("Creating AI client with config:", config.provider)

  const client =
    provider === "anthropic"
      ? createAnthropic({ apiKey })
      : createOpenAI({ apiKey })

  const generate = async <T>(
    schema: z.ZodSchema<T>,
    prompt: string
  ): Promise<GenerateObjectResult<T>> => {
    return generateObject({
      model: client(model),
      schema,
      output: "object",
      messages: [{ role: "user", content: prompt }],
    })
  }

  return { generate }
}
