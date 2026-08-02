import { buildSystemPrompt } from "../prompts/systemPrompt.js";
import type { Language } from "../types/chat.js";
import type { KnowledgeBase, Project } from "../types/knowledge.js";
import type { KnowledgeService } from "./knowledge.service.js";

function bullet(items: string[]): string {
  return items.map(item => `- ${item}`).join("\n");
}

/**
 * Builds the system prompt from the knowledge base + live visitor context.
 * Keeps the raw prompt template out of controllers.
 */
export class PromptBuilder {
  constructor(private readonly knowledge: KnowledgeService) {}

  buildSystem(
    language: Language,
    section: string | undefined,
    project: string | undefined
  ): string {
    const kb = this.knowledge.getKnowledge();

    return buildSystemPrompt({
      language,
      personality: kb.personality,
      context: this.formatContext(section, project),
      knowledge: this.formatKnowledge(kb)
    });
  }

  private formatKnowledge(kb: KnowledgeBase): string {
    const lines: string[] = [];

    lines.push(`## Identity\n${kb.about.name} — ${kb.about.title}.`);
    lines.push(`## Summary\n${kb.about.summary}`);
    lines.push(`## Why Computer Engineering\n${kb.about.whyComputerEngineering}`);
    lines.push(`## Why Cloud Computing\n${kb.about.whyCloud}`);
    lines.push(`## Why AI\n${kb.about.whyAI}`);
    lines.push(`## Career goal\n${kb.about.careerGoal}`);
    lines.push(`## Motivation\n${kb.about.motivation}`);
    lines.push(`## Looking for\n${kb.about.lookingFor}`);
    lines.push(`## Strengths\n${bullet(kb.about.strengths)}`);
    lines.push(`## Currently improving\n${bullet(kb.about.currentImprovement)}`);

    lines.push(
      `## Experience\n${kb.experience
        .map(entry => `- ${entry.role} at ${entry.company} (${entry.period}): ${entry.details.join(" ")}`)
        .join("\n")}`
    );

    lines.push(
      `## Education\n${kb.education
        .map(entry => `- ${entry.degree} at ${entry.school}, specializing in ${entry.specialization} (${entry.period})`)
        .join("\n")}`
    );

    lines.push(`## Projects\n${kb.projects.map(project => this.formatProjectSummary(project)).join("\n")}`);

    lines.push(
      `## Skills\n${kb.skills.map(category => `${category.category}: ${category.skills.join(", ")}`).join("\n")}`
    );

    lines.push(`## Frequently asked questions\n${kb.faq.map(item => `Q: ${item.q}\nA: ${item.a}`).join("\n\n")}`);
    lines.push(`## Fun facts\n${kb.funfacts.map(item => `- ${item.fact}: ${item.value}`).join("\n")}`);
    lines.push(
      `## Contact\nEmail: ${kb.contact.email}\nGitHub: ${kb.contact.github}\nLinkedIn: ${kb.contact.linkedin}\n${kb.contact.resume}`
    );

    return lines.join("\n\n");
  }

  private formatProjectSummary(project: Project): string {
    const stack = project.stack.join(", ");
    const demo = project.demo ? ` Demo video: ${project.demo}` : "";
    return `- ${project.name} — ${project.type}. ${project.description} Stack: ${stack}.${demo}`;
  }

  private formatProjectDetail(project: Project): string {
    const highlights = project.highlights.map(highlight => `  - ${highlight}`).join("\n");
    const demo = project.demo ? `\n- Demo video: ${project.demo}` : "";
    return [
      `- Name: ${project.name}`,
      `- Type: ${project.type}`,
      `- Description: ${project.description}`,
      `- Stack: ${project.stack.join(", ")}`,
      `- Highlights:\n${highlights}${demo}`
    ].join("\n");
  }

  private formatContext(section: string | undefined, project: string | undefined): string {
    const lines: string[] = [];

    if (section) {
      lines.push(`The visitor is currently viewing the "${section}" section of the portfolio.`);
    }

    const knownProject = this.knowledge.getProject(project);
    if (knownProject) {
      lines.push(
        `The "${knownProject.name}" project is currently open in the portfolio. If the visitor says "this project" or refers to it without naming it, they mean "${knownProject.name}".`
      );
      lines.push(`Detailed project context:\n${this.formatProjectDetail(knownProject)}`);
    } else if (project) {
      lines.push(
        `The "${project}" project is currently open in the portfolio. If the visitor says "this project" or refers to it without naming it, they mean "${project}".`
      );
    }

    return lines.length ? lines.join("\n\n") : "- The visitor just opened the chat.";
  }
}
