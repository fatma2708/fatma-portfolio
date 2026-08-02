import { beforeAll, describe, expect, it } from "vitest";
import { KnowledgeService } from "../services/knowledge.service.js";
import { PromptBuilder } from "../services/prompt-builder.service.js";

describe("PromptBuilder", () => {
  let builder: PromptBuilder;

  beforeAll(async () => {
    const knowledge = new KnowledgeService();
    await knowledge.load();
    builder = new PromptBuilder(knowledge);
  });

  it("establishes the F.A.I. identity", () => {
    const prompt = builder.buildSystem("en", "", "");
    expect(prompt).toContain("F.A.I.");
    expect(prompt).toContain("Fatma Artificial Intelligence");
    expect(prompt).toContain("NOT ChatGPT");
    expect(prompt).toContain("not data");
  });

  it("respects the requested language", () => {
    expect(builder.buildSystem("en", "", "")).toContain("Respond entirely in English");
    expect(builder.buildSystem("fr", "", "")).toContain("Respond entirely in French");
  });

  it("injects the full knowledge base", () => {
    const prompt = builder.buildSystem("en", "", "");
    expect(prompt).toContain("FoundersLab");
    expect(prompt).toContain("Kubernetes");
    expect(prompt).toContain("fatmabenmlouka38@gmail.com");
    expect(prompt).toContain("Frequently asked questions");
  });

  it("injects the visitor's current section", () => {
    const prompt = builder.buildSystem("en", "skills", "");
    expect(prompt).toContain('"skills" section');
  });

  it("injects detailed project context when a known project is open", () => {
    const prompt = builder.buildSystem("en", "", "FoundersLab");
    expect(prompt).toContain("project is currently open in the portfolio");
    expect(prompt).toContain("Detailed project context");
    expect(prompt).toContain("Intelligent Startup Incubation Platform");
    expect(prompt).toContain("Machine-learning based startup scoring system.");
  });

  it("handles alias project names in context", () => {
    const prompt = builder.buildSystem("en", "", "AI Internship");
    expect(prompt).toContain("AI Psychometric Assessment Platform");
  });

  it("still adds a generic context line for unknown project names", () => {
    const prompt = builder.buildSystem("en", "", "Mystery Project");
    expect(prompt).toContain('"Mystery Project"');
    expect(prompt).toContain("project is currently open in the portfolio");
  });

  it("never embeds secrets or config references", () => {
    const prompt = builder.buildSystem("en", "", "");
    expect(prompt).not.toContain("GEMINI_API_KEY");
    expect(prompt).not.toMatch(/api.?key/i);
  });
});
