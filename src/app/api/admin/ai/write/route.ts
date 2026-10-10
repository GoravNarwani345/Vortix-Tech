import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { executeAiCompletion } from "@/lib/aiClient";
import { checkDailyQuota, incrementDailyQuota } from "@/lib/workloadQuota";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quota = await checkDailyQuota("blog");
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Daily blog writing quota reached (${quota.used}/${quota.limit} articles generated today). Resets at midnight UTC.`,
          quota,
        },
        { status: 429 }
      );
    }
    const {
      topic,
      customPrompt,
      targetKeywords,
      researchBrief,
      category: requestedCategory,
      tone = "technical",
      depth = "deep",
      includeCode = true,
      includeTables = true,
      includeArchitectureFlow = true,
    } = await req.json();

    const subject = topic || customPrompt;
    if (!subject) {
      return NextResponse.json(
        { error: "A topic or custom prompt is required." },
        { status: 400 }
      );
    }

    // Determine tone guidance
    let toneGuidance = "Tone: Principal Engineering Architect. Rigorous, authoritative, precise, and practical. Write for senior engineers, CTOs, and tech founders.";
    if (tone === "tutorial") {
      toneGuidance = "Tone: Senior Lead Developer & Hands-On Mentor. Step-by-step clarity, real code implementations, best practices, and troubleshooting tips.";
    } else if (tone === "executive") {
      toneGuidance = "Tone: Technology Strategist & VP of Engineering. Focus on ROI, engineering scalability, architectural trade-offs, team velocity, and enterprise risk mitigation.";
    } else if (tone === "case-study") {
      toneGuidance = "Tone: Engineering Postmortem & Case Study. Problem statement, technical architecture, hurdles encountered, latency/cost benchmark results, and production lessons.";
    }

    // Determine depth guidance
    let depthGuidance = "Depth: Comprehensive deep dive (1,200 to 1,800 words). Thorough sections with in-depth technical analysis and real-world considerations.";
    if (depth === "standard") {
      depthGuidance = "Depth: Focused technical guide (800 to 1,100 words). Direct, scannable, and actionable.";
    } else if (depth === "concise") {
      depthGuidance = "Depth: Compact briefing (500 to 750 words). High signal-to-noise ratio, core takeaways, and quick implementation roadmap.";
    }

    const prompt = `You are a Principal Engineering Architect and Senior Technical Author for Vortix Tech (an agency building production Web Apps, Mobile Systems, n8n Workflow Automations, and AI LLM solutions).

TASK: Write an exceptional, high-authority, 100% production-ready technical article on:
TITLE/SUBJECT: "${subject}"
${requestedCategory ? `CATEGORY: "${requestedCategory}"` : ""}
${targetKeywords ? `TARGET SEO KEYWORDS TO WEAVE NATURALLY: "${Array.isArray(targetKeywords) ? targetKeywords.join(", ") : targetKeywords}"` : ""}
${customPrompt ? `SPECIFIC USER DIRECTIVES: "${customPrompt}"` : ""}
${researchBrief ? `RESEARCH BRIEF & SOURCES TO UTILIZE: """${typeof researchBrief === "string" ? researchBrief : JSON.stringify(researchBrief)}"""` : ""}

${toneGuidance}
${depthGuidance}

MANDATORY EDITORIAL & FORMATTING RULES:
1. STRICT BAN ON ROBOTIC / CLICHÉ INTRODUCTIONS:
   - NEVER start with: "In today's fast-paced digital world...", "In recent years...", "As technology continues to evolve...", "Have you ever wondered...", or "In the rapidly expanding landscape...".
   - Start IMMEDIATELY with the real-world engineering problem, architectural bottleneck, high-impact production scenario, or direct technical thesis.

2. ABSOLUTE BAN ON ASCII BOX-DRAWING DIAGRAMS:
   - NEVER generate ASCII text boxes (e.g. "+---+", "| |", "+---+", "----->", "+====+"). They break responsive layouts and look distorted on mobile screens.
   - Represent complex system architectures using:
     a) Clean GitHub Flavored Markdown comparison tables (| Component | Role | Latency | Protocol |).
     b) Numbered lifecycle pipeline stages with bold milestone highlights.
     c) Standard Mermaid diagram blocks (\`\`\`mermaid ... \`\`\`) where visual flowcharts are valuable.

3. STRUCTURED MARKDOWN TABLES (MANDATORY):
   ${includeTables ? "- Include 1 to 2 clean, high-value Markdown tables comparing trade-offs, technologies, benchmarks, or architectural patterns. Format with standard markdown pipe syntax (| Col 1 | Col 2 |)." : "- Keep tabular comparisons concise."}

4. PRODUCTION CODE BLOCKS:
   ${includeCode ? "- Provide realistic, strongly-typed production code snippets (e.g. TypeScript, Next.js, Python, SQL, or Bash) with exact language identifiers (```typescript, ```tsx, ```bash). Include comments and proper error handling." : "- Focus on architectural patterns and concepts rather than code."}

5. ARCHITECTURAL FLOW & CALLOUTS:
   ${includeArchitectureFlow ? "- Detail end-to-end data flow, state management, or deployment pipelines step-by-step." : ""}
   - Use blockquotes for critical warnings and pro-tips:
     > **Architectural Note:** ...
     > **Production Caveat:** ...

6. ARTICLE STRUCTURE:
   - Begin line 1 with "# [Engaging, search-optimized H1 title]".
   - 3 to 6 comprehensive sections with descriptive H2 and H3 subheadings (never use generic names like "Introduction" or "Conclusion").
   - Bullet points for scannable lists and key takeaways.
   - A dedicated "Production Checklist" or "Next Steps" section at the end.

7. METADATA WRAPPERS (AT THE VERY END):
   - Provide a 1-2 sentence meta description/excerpt in <excerpt>...</excerpt> (under 160 characters).
   - Provide the ideal category in <category>...</category>.
   - Provide 4-8 target keywords separated by commas in <keywords>...</keywords>.
   - Provide a detailed prompt for editorial 4K cover art in <image_prompt>...</image_prompt>.

8. Return ONLY the markdown content. Do NOT wrap the entire response in \`\`\`markdown backticks.`;

    const aiResult = await executeAiCompletion({
      prompt,
      temperature: 0.7,
      maxTokens: 2500,
      task: "blog",
    });

    const rawMarkdown = aiResult.text;

    if (!rawMarkdown) throw new Error("No content generated by the AI model");

    // Extract structured tags
    const excerptMatch = rawMarkdown.match(/<excerpt>([\s\S]*?)<\/excerpt>/i);
    const categoryMatch = rawMarkdown.match(/<category>([\s\S]*?)<\/category>/i);
    const keywordsMatch = rawMarkdown.match(/<keywords>([\s\S]*?)<\/keywords>/i);
    const imagePromptMatch = rawMarkdown.match(/<image_prompt>([\s\S]*?)<\/image_prompt>/i);
    const titleMatch = rawMarkdown.match(/^#\s+(.*)/m);

    const excerpt = excerptMatch ? excerptMatch[1].trim() : "An insightful guide by the engineering team at Vortix Tech.";
    const category = categoryMatch ? categoryMatch[1].trim() : (requestedCategory || "Technology");
    const title = titleMatch ? titleMatch[1].trim() : subject;
    const keywords = keywordsMatch
      ? keywordsMatch[1].split(",").map((k: string) => k.trim()).filter(Boolean)
      : [];
    const imagePrompt = imagePromptMatch
      ? imagePromptMatch[1].trim()
      : `${title} modern technology abstract high quality 4k digital art`;

    // Clean up internal XML tags from the markdown content
    let cleanMarkdown = rawMarkdown
      .replace(/<excerpt>[\s\S]*?<\/excerpt>/gi, "")
      .replace(/<category>[\s\S]*?<\/category>/gi, "")
      .replace(/<keywords>[\s\S]*?<\/keywords>/gi, "")
      .replace(/<image_prompt>[\s\S]*?<\/image_prompt>/gi, "")
      .trim();

    // Strip the initial `# Title` line from cleanMarkdown so the title is not duplicated
    // on the public blog page which already renders the title in its hero header
    cleanMarkdown = cleanMarkdown.replace(/^#\s+[^\r\n]*(?:\r?\n)+/, "").trim();

    const wordCount = cleanMarkdown.split(/\s+/).filter(Boolean).length;
    const readTime = `${Math.max(3, Math.ceil(wordCount / 200))} min read`;

    const updatedQuota = await incrementDailyQuota("blog");

    return NextResponse.json({
      success: true,
      quota: updatedQuota,
      article: {
        title,
        excerpt,
        category,
        content: cleanMarkdown,
        keywords,
        imagePrompt,
        readTime,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate article",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
