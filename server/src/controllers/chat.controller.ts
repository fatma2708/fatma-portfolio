import type { Request } from "express";
import type { ChatProvider } from "../types/gemini.js";
import type { ChatRequest, ChatResponse } from "../types/chat.js";
import type { PromptBuilder } from "../services/prompt-builder.service.js";
import type { SafetyService } from "../services/safety.service.js";
import type { SuggestionService } from "../services/suggestion.service.js";
import { refusalFor } from "../services/safety.service.js";
import { detectLanguage } from "../utils/language.js";

export class ChatController {
  constructor(
    private readonly provider: ChatProvider,
    private readonly promptBuilder: PromptBuilder,
    private readonly safety: SafetyService,
    private readonly suggestions: SuggestionService
  ) {}

  async handleChat(req: Request): Promise<ChatResponse> {
    const body = req.body as ChatRequest;

    const language = body.language ?? detectLanguage(body.message);

    // Edge protection: refuse prompt-injection / secret requests without a model call.
    const safetyResult = this.safety.check(body.message);
    if (safetyResult.blocked) {
      return {
        response: refusalFor(language, safetyResult.refusal),
        followUpSuggestions: this.suggestions.suggest(language, body.currentSection, body.currentProject)
      };
    }

    const systemPrompt = this.promptBuilder.buildSystem(language, body.currentSection, body.currentProject);

    const history = (body.conversationHistory ?? []).map(message => ({
      role: message.role as "user" | "assistant" | "model",
      content: message.content
    }));

    const messages: { role: "user" | "assistant" | "model"; content: string }[] = [
      ...history,
      { role: "user", content: body.message }
    ];

    const answer = await this.provider.generateText({ systemPrompt, messages });

    return {
      response: answer,
      followUpSuggestions: this.suggestions.suggest(language, body.currentSection, body.currentProject)
    };
  }
}
