import { describe, expect, it } from "vitest";
import { ChatSchema } from "../schemas/chat.schema.js";

describe("ChatSchema", () => {
  it("accepts a valid minimal message", () => {
    const result = ChatSchema.safeParse({ message: "Hello" });
    expect(result.success).toBe(true);
    expect(result.success && result.data.message).toBe("Hello");
  });

  it("trims messages", () => {
    const result = ChatSchema.safeParse({ message: "   hello world   " });
    expect(result.success).toBe(true);
    expect(result.success && result.data.message).toBe("hello world");
  });

  it("rejects empty and whitespace-only messages", () => {
    expect(ChatSchema.safeParse({ message: "" }).success).toBe(false);
    expect(ChatSchema.safeParse({ message: "   " }).success).toBe(false);
    expect(ChatSchema.safeParse({ message: "\n\t" }).success).toBe(false);
  });

  it("rejects oversized messages", () => {
    expect(ChatSchema.safeParse({ message: "x".repeat(2001) }).success).toBe(false);
    expect(ChatSchema.safeParse({ message: "x".repeat(2000) }).success).toBe(true);
  });

  it("rejects non-string messages", () => {
    expect(ChatSchema.safeParse({ message: 42 }).success).toBe(false);
    expect(ChatSchema.safeParse({ message: ["hello"] }).success).toBe(false);
  });

  it("rejects invalid language values", () => {
    expect(ChatSchema.safeParse({ message: "hi", language: "de" }).success).toBe(false);
    expect(ChatSchema.safeParse({ message: "hi", language: "fr" }).success).toBe(true);
  });

  it("rejects invalid history roles", () => {
    const result = ChatSchema.safeParse({
      message: "hi",
      conversationHistory: [{ role: "system", content: "x" }]
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty history messages", () => {
    const result = ChatSchema.safeParse({
      message: "hi",
      conversationHistory: [{ role: "user", content: "  " }]
    });
    expect(result.success).toBe(false);
  });

  it("rejects oversized history", () => {
    const history = Array.from({ length: 21 }, (_, index) => ({
      role: "user" as const,
      content: `msg ${index}`
    }));
    expect(ChatSchema.safeParse({ message: "hi", conversationHistory: history }).success).toBe(false);
  });

  it("defaults optional fields", () => {
    const result = ChatSchema.safeParse({ message: "hi" });
    expect(result.success && result.data.conversationHistory).toEqual([]);
    expect(result.success && result.data.currentSection).toBe("");
    expect(result.success && result.data.currentProject).toBe("");
  });
});
