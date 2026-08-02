import { describe, expect, it } from "vitest";
import { KnowledgeService } from "../services/knowledge.service.js";

describe("KnowledgeService", () => {
  it("loads every knowledge file from disk", async () => {
    const knowledge = new KnowledgeService();
    expect(knowledge.loaded).toBe(false);

    await knowledge.load();

    expect(knowledge.loaded).toBe(true);
    const kb = knowledge.getKnowledge();
    expect(kb.about.name).toBe("Fatma Ben Mlouka");
    expect(kb.projects.length).toBeGreaterThanOrEqual(5);
    expect(kb.experience.length).toBeGreaterThan(0);
    expect(kb.education.length).toBeGreaterThan(0);
    expect(kb.skills.length).toBeGreaterThan(0);
    expect(kb.personality.traits.length).toBeGreaterThan(0);
    expect(kb.funfacts.length).toBeGreaterThan(0);
    expect(kb.faq.length).toBeGreaterThan(0);
    expect(kb.contact.email).toContain("@");
  });

  it("caches the loaded knowledge", async () => {
    const knowledge = new KnowledgeService();
    await knowledge.load();
    expect(knowledge.getKnowledge()).toBe(knowledge.getKnowledge());
  });

  it("finds projects by exact name", async () => {
    const knowledge = new KnowledgeService();
    await knowledge.load();
    expect(knowledge.getProject("FoundersLab")?.name).toBe("FoundersLab");
    expect(knowledge.getProject("FITSYNC")?.name).toBe("FITSYNC");
    expect(knowledge.getProject("StackPilot")?.name).toBe("StackPilot");
  });

  it("resolves project aliases (case-insensitive)", async () => {
    const knowledge = new KnowledgeService();
    await knowledge.load();
    expect(knowledge.getProject("AI Internship")?.name).toBe("AI Psychometric Assessment Platform");
    expect(knowledge.getProject("ai internship")?.name).toBe("AI Psychometric Assessment Platform");
    expect(knowledge.getProject("AutoMatchAI")?.name).toBe("AutoMatch");
    expect(knowledge.getProject("Psychometric Assessment")?.name).toBe("AI Psychometric Assessment Platform");
  });

  it("returns null for unknown or empty projects", async () => {
    const knowledge = new KnowledgeService();
    await knowledge.load();
    expect(knowledge.getProject("Totally Fake Project")).toBeNull();
    expect(knowledge.getProject("")).toBeNull();
    expect(knowledge.getProject(undefined)).toBeNull();
  });

  it("throws before load is called", () => {
    const knowledge = new KnowledgeService();
    expect(() => knowledge.getKnowledge()).toThrow(/load/i);
  });
});
