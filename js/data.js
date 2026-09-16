/**
 * SCU WorkShift: content config.
 * Shape: school -> [ vertical ] (list holds one vertical per school today;
 * schema already supports adding a second vertical per school later).
 *
 * Numbers below are pulled directly from the validated decision-tool
 * spreadsheets (manual vs. AI Copilot/Firefly, per-task assumptions).
 * Break-even accuracy = aiTotalCost / (manualTotalCost / manualUsableRate).
 */

const WORKSHIFT_DATA = {
  schools: [
    {
      id: "lsb",
      name: "Leavey School of Business",
      short: "LSB",
      mascotLine: "Show me the (income) statement.",
      color: "cardinal",
      icon: "📊",
      verticals: [
        {
          id: "financial-analyst",
          name: "Financial Analyst",
          school: "lsb",
          task: "Build an income statement",
          tagline: "One tile in the mosaic of finance. Not the whole job, just one real task.",
          manual: {
            tool: "Excel",
            timeMin: 90,
            usableRate: 0.95,
            toolCost: 0.35,
            blurb: "Pull the filings, tie out every line, build formulas, sanity-check the totals by hand.",
          },
          ai: {
            tool: "Copilot",
            timeMin: 30,
            usableRate: 0.40,
            toolCost: 1.00,
            blurb: "Prompt it with the filings, get a drafted statement back, then verify every figure.",
          },
          lenses: {
            career: {
              shift:
                "Entry-level analysts used to earn their stripes building statements line by line. AI now drafts the first pass in minutes, so the job is shifting from 'can you build it' to 'can you catch what's wrong with it.' And the stakes are real: sending client filings or MNPI to a public AI tool risks the kind of compliance breach that got major banks to restrict ChatGPT outright.",
              skillsRising: [
                "Reading & auditing AI output for errors",
                "Financial modeling judgment (what looks *off*)",
                "Data confidentiality & compliance awareness",
                "Storytelling with numbers for stakeholders",
              ],
              skillsFading: [
                "Manual formula-building speed",
                "Rote data entry & formatting",
              ],
              whatToLearn:
                "Get fast at spotting a wrong number before it reaches a client. That's the skill AI can't do for you yet. And learn which tools are actually safe for confidential data; enterprise-grade, not the public chatbot.",
            },
            productivity: {
              defaults: { volume: 20, hourlyValue: 60, aiAccuracy: 0.40 },
            },
            environment: {
              manual: { energyWh: 90, carbonG: 36.0, waterMl: 162 },
              ai: { energyWh: 35, carbonG: 14.0, waterMl: 67 },
              factors: "Per income statement (workstation screen-time vs. device plus about 15 AI prompts).",
            },
          },
          realityCheck: {
            pitch: "“AI drafts your financial models 10x faster.”",
            evidence:
              "Real benchmarks on multi-line financial statements (FinanceBench, FinMaster) put accuracy around 37 to 40%. AI needs to be right 33% of the time just to break even on cost, so the assumed 40% barely clears that bar, and a bad figure can invalidate the whole statement.",
          },
          sources: [
            { name: "FinanceBench (Patronus AI): LLM benchmark on real SEC filings", date: "2023", url: "https://github.com/patronus-ai/financebench" },
            { name: "FinMaster: multi-step financial reasoning benchmark (OpenReview)", date: "2025", url: "https://openreview.net/forum?id=zCMMlKzbEe" },
            { name: "Federal Reserve Bank of St. Louis / NBER: generative-AI adoption and productivity by occupation", date: "2025", url: "https://www.stlouisfed.org/on-the-economy/2025/feb/impact-generative-ai-work-productivity" },
          ],
        },
      ],
    },
    {
      id: "cas",
      name: "College of Arts and Sciences",
      short: "CAS",
      mascotLine: "Every pixel tells a story.",
      color: "gold",
      icon: "🎨",
      verticals: [
        {
          id: "graphic-designer",
          name: "Graphic Designer",
          school: "cas",
          task: "Design one image",
          tagline: "One tile in the mosaic of design. Not the whole job, just one real task.",
          manual: {
            tool: "Photoshop",
            timeMin: 45,
            usableRate: 0.95,
            toolCost: 0.383,
            blurb: "Sketch concepts, build layers, iterate on client feedback, export final files.",
          },
          ai: {
            tool: "Firefly",
            timeMin: 8,
            usableRate: 0.60,
            toolCost: 0.167,
            blurb: "Prompt a concept, generate variations, pick a winner and touch it up.",
          },
          lenses: {
            career: {
              shift:
                "AI wins on cost so overwhelmingly here (it would still be cheaper even at a 17% keeper rate) that this isn't really an economic decision anymore. The real question for designers is whose work trained the model, and who gets paid for it going forward.",
              skillsRising: [
                "Art direction & taste (curating AI output)",
                "Prompt craft as a creative tool",
                "Licensing & IP literacy",
                "Brand strategy & concept development",
              ],
              skillsFading: [
                "Manual asset production for commodity work",
                "Pure execution speed on simple graphics",
              ],
              whatToLearn:
                "Build a point of view AI can't fake: a distinct style, sharp art direction, and a working knowledge of who owns what when a model was trained on other people's work. Use AI for volume and drafts; protect human illustration where originality or supporting working artists is the point.",
            },
            productivity: {
              defaults: { volume: 60, hourlyValue: 50, aiAccuracy: 0.60 },
            },
            environment: {
              manual: { energyWh: 38, carbonG: 15.0, waterMl: 68 },
              ai: { energyWh: 8, carbonG: 3.3, waterMl: 17 },
              factors: "Per image (workstation screen-time vs. device plus about 1.5Wh diffusion-model inference).",
            },
          },
          realityCheck: {
            pitch: "“Generate unlimited royalty-free images instantly.”",
            evidence:
              "Firefly is trained on licensed Adobe Stock content with IP indemnity, making it the lowest-legal-risk mainstream option. But reporting found about 5% of that training data was itself AI-generated, and the deeper fight over creator displacement and uncompensated labor is unresolved. Cheap and low-risk aren't the same as uncontested.",
          },
          sources: [
            { name: "Adobe (official): Firefly's licensed training, IP indemnification & Content Credentials", date: "2025", url: "https://business.adobe.com/products/firefly-business/firefly-ai-approach.html" },
            { name: "The Decoder: Bloomberg reporting on Firefly's training-data composition", date: "2024", url: "https://the-decoder.com/adobe-trained-its-ai-image-generator-on-midjourney-images-but-its-complicated/" },
            { name: "Luccioni, Jernite & Strubell: “Power Hungry Processing,” ACM FAccT (image-gen energy benchmark)", date: "2024", url: "https://dl.acm.org/doi/10.1145/3630106.3658542" },
          ],
        },
      ],
    },
    {
      id: "soe",
      name: "School of Engineering",
      short: "SOE",
      mascotLine: "Ship it. Then check it shipped safely.",
      color: "charcoal",
      icon: "💻",
      verticals: [
        {
          id: "software-engineer",
          name: "Software Engineer",
          school: "soe",
          task: "Build email sign-in",
          tagline: "One tile in the mosaic of engineering. Not the whole job, just one real task.",
          manual: {
            tool: "Hand-code",
            timeMin: 60,
            usableRate: 0.90,
            toolCost: 0,
            blurb: "Write the auth flow, hash passwords, wire up sessions, test edge cases.",
          },
          ai: {
            tool: "Copilot",
            timeMin: 35,
            usableRate: 0.60,
            toolCost: 0.25,
            blurb: "Generate the auth scaffold, review the diff, patch what's insecure or wrong.",
          },
          lenses: {
            career: {
              shift:
                "AI wins narrowly on routine scaffolding like this. But METR found experienced developers were actually 19% *slower* on complex, unfamiliar repos while feeling 20% faster. Self-perception is not a reliable gauge here. The job is tilting toward review, security, and judgment over raw typing speed.",
              skillsRising: [
                "Code review & security auditing",
                "System design & architecture",
                "Debugging AI-generated code",
                "Judgment about when NOT to use AI",
              ],
              skillsFading: [
                "Boilerplate & scaffolding by hand",
                "Memorizing syntax over concepts",
              ],
              whatToLearn:
                "Learn to read code as critically as you write it. Security fundamentals aren't optional anymore: GitHub says 41-46% of code in Copilot-enabled files is now AI-generated, and someone has to catch what it ships broken.",
            },
            productivity: {
              defaults: { volume: 40, hourlyValue: 75, aiAccuracy: 0.60 },
            },
            environment: {
              manual: { energyWh: 60, carbonG: 24.0, waterMl: 108 },
              ai: { energyWh: 40, carbonG: 16.0, waterMl: 76 },
              factors: "Per task (workstation screen-time vs. device plus LLM completions/prompts).",
            },
          },
          realityCheck: {
            pitch: "“Ship features up to 55% faster with AI pair programming.”",
            evidence:
              "True for routine, bounded tasks. But METR's randomized controlled trial found experienced developers took *longer* on complex, real-world repos with AI assistance, while feeling faster. And Veracode found about 45% of AI-generated code samples introduce an OWASP Top-10 vulnerability, a rate that's held flat for two years running.",
          },
          sources: [
            { name: "METR: randomized controlled trial on AI coding assistance and developer speed", date: "2025", url: "https://www.infoworld.com/article/4020931/ai-coding-tools-can-slow-down-seasoned-developers-by-19.html" },
            { name: "Veracode: 2025 GenAI Code Security Report (45% vulnerability rate)", date: "2025", url: "https://www.veracode.com/blog/ai-generated-code-security-risks/" },
            { name: "GitHub Education: Student Developer Pack (free Copilot Pro for verified students)", date: "2026", url: "https://education.github.com/pack" },
          ],
        },
      ],
    },
  ],
};
