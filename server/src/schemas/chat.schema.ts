import { z } from "zod";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20;

export const ChatSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message must not be empty.")
    .max(MAX_MESSAGE_LENGTH, `Message must be at most ${MAX_MESSAGE_LENGTH} characters.`),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "model"]),
        content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH)
      })
    )
    .max(MAX_HISTORY_MESSAGES, `Conversation history is limited to ${MAX_HISTORY_MESSAGES} messages.`)
    .optional()
    .default([]),
  currentSection: z.string().trim().max(60, "currentSection is too long.").optional().default(""),
  currentProject: z.string().trim().max(80, "currentProject is too long.").optional().default(""),
  language: z.enum(["en", "fr"]).optional()
});

export type ChatInput = z.infer<typeof ChatSchema>;
