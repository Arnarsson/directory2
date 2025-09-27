// prompts.ts
// Temporarily disabled strict enums to let AI be more flexible
// IMPORTANT: Tags and labels must have NO OVERLAP - each term should appear in only one array
export const categoriesEnum = ["dev", "design", "learning", "media"] as const
export const labelsEnum = {
  dev: [
    "frontend_frameworks",
    "backend_frameworks",
    "component_libraries",
    "developer_tools",
    "apis_services",
  ] as const,
  design: [
    "design_systems",
    "typography",
    "icons_graphics",
    "design_tools",
    "visual_assets",
    "color_tools",
  ] as const,
  learning: [
    "tutorials",
    "documentation",
    "courses",
    "articles",
    "examples",
  ] as const,
  media: ["stock_media", "editing_tools", "generators"] as const,
}
export const allowedLabels = [
  ...labelsEnum.dev,
  ...labelsEnum.design,
  ...labelsEnum.learning,
  ...labelsEnum.media,
]
export const tagsEnum = [
  // Development Frameworks & Libraries
  "react",
  "vue",
  "angular",
  "svelte",
  "nextjs",
  "nuxtjs",
  "nodejs",
  "express",

  // Component & UI Libraries
  "css_frameworks",
  "ui_components",
  "tailwindcss",

  // Typography & Fonts
  "fonts",
  "typefaces",
  "web_fonts",
  "font_tools",
  "typography_tools",

  // Design Assets & Tools
  "icons",
  "illustrations",
  "mockups",
  "figma_plugins",
  "sketch_plugins",
  "gradient_tools",

  // Development Tools
  "build_tools",
  "testing",
  "deployment",
  "monitoring",
  "databases",

  // Content & Media
  "stock_photos",
  "stock_videos",
  "ai_generators",
] as const

// Shared constants for consistent prompting
const COMMON_GUIDELINES = `
## Guidelines
- Be creative and descriptive with your tags, labels, and categories
- Use the suggestions below as inspiration, but feel free to create new ones that fit better
- Maximum of 4 tags, 3 labels, and 1 category
- Make sure they accurately describe the product's functionality and purpose
- IMPORTANT: Use snake_case format (lowercase with underscores) for multi-word concepts
- Examples: "design_systems", "ui_components", "color_tools", "react_hooks"
- NOT: "designSystems", "UIComponents", "ColorTools", "ReactHooks"
- CRITICAL: Tags and labels must have NO OVERLAP - never use the same term in both arrays
- CRITICAL: Codenames must also use snake_case format for multi-word names
- Examples: "magic_ui", "react_components", "design_toolkit"
- NOT: "magicui", "reactComponents", "DesignToolkit"
`

const CATEGORY_DEFINITIONS = `
Categories (broad):
- ${JSON.stringify(categoriesEnum)}

Labels (less broad):
- dev: ${JSON.stringify(labelsEnum.dev)}
- design: ${JSON.stringify(labelsEnum.design)}
- learning: ${JSON.stringify(labelsEnum.learning)}
- media: ${JSON.stringify(labelsEnum.media)}

Tags (specific):
- ${JSON.stringify(tagsEnum)}
`

const FIELD_DEFINITIONS = `
Codename: A concise and memorable name for the product (1-3 words, ideally the exact product name). MUST use snake_case format for multi-word names (e.g., "magic_ui", "react_components").
Punchline: A short, catchy phrase that encapsulates the product's value proposition (3-6 words).
Description: A brief explanation of the product, highlighting its key features and benefits (1-2 sentences).
`

type ErrorType =
  | "format"
  | "validation"
  | "content"
  | "classification"
  | "overlap"

const ERROR_HANDLING_STRATEGIES = {
  format: "Focus on proper JSON structure and required fields",
  validation:
    "Ensure values match allowed categories, labels, and follow snake_case",
  content: "Re-analyze the content more carefully for context clues",
  classification:
    "Consider alternative category assignments and more specific tags",
  overlap:
    "Remove duplicate terms between tags and labels - each term should appear in only one array",
}

const prepareContent = (content: string, limit: number = 800) => {
  if (!content) return { content: "", domain: "" }

  // Extract domain info for additional context
  const urlMatch = content.match(/https?:\/\/([^\/\s]+)/i)
  const domain = urlMatch ? urlMatch[1] : ""

  // Clean content
  let cleanedContent = content
    .replace(/\s\s+/g, " ")
    .replace(/[\r\n]+/g, " ")
    .trim()

  // Truncate to limit while preserving word boundaries
  if (cleanedContent.length > limit) {
    cleanedContent = cleanedContent.substring(0, limit)
    const lastSpace = cleanedContent.lastIndexOf(" ")
    if (lastSpace > limit * 0.8) {
      cleanedContent = cleanedContent.substring(0, lastSpace)
    }
    cleanedContent += "..."
  }

  return { content: cleanedContent, domain }
}

const buildReasoningChain = (category?: string) => `
## Analysis Process
First, analyze the content type and primary function.
Then, determine the target audience and use case.
Finally, select the most specific and accurate classifications.
${category ? `\nFocus on ${category}-specific terminology and patterns.` : ""}
`

export const getSimpleDetailsPrompt = (
  name: string,
  desc: string,
  content: string
) => {
  const { content: processedContent, domain } = prepareContent(content)

  const prompt = `
# Objective
Enrich the following product with relevant category, codename, punchline, and description.

${buildReasoningChain()}

# Examples

Example 1 - Design Tool:
- Input
Site Name: "PixelPerfect"
Site Description: "A comprehensive design tool for creating pixel-perfect UI components and prototypes."
Site Content: "PixelPerfect - Design stunning UIs - Create precise prototypes - Perfect your design workflow"
- Output
{
  "category": "design",
  "codename": "pixel_perfect",
  "punchline": "Perfect Your Pixels",
  "description": "A comprehensive design tool for creating pixel-perfect UI components and prototypes, enhancing your design workflow with precision."
}

Example 2 - Single Word Tool:
- Input
Site Name: "npm"
Site Description: "Package manager for Node.js"
Site Content: "npm install packages javascript node package manager"
- Output
{
  "category": "dev",
  "codename": "npm",
  "punchline": "Node Package Manager",
  "description": "The essential package manager for Node.js, enabling developers to easily install and manage JavaScript libraries and dependencies."
}

Example 3 - Niche Learning Resource:
- Input
Site Name: "WebGL Fundamentals"
Site Description: "Learn WebGL from the ground up"
Site Content: "WebGL tutorials shaders graphics programming 3D web development"
- Output
{
  "category": "learning",
  "codename": "webgl_fundamentals",
  "punchline": "Master 3D Web Graphics",
  "description": "Comprehensive tutorials for learning WebGL programming from basics to advanced 3D graphics techniques for web development."
}

## What NOT to do:
❌ DON'T use camelCase: "webGLTutorials"
❌ DON'T make punchlines too long: "The Ultimate Complete Guide to Perfect Pixel Design"
❌ DON'T be overly generic: category "tools", punchline "Helpful Tool"

${FIELD_DEFINITIONS}

Categories available: ${JSON.stringify(categoriesEnum)}

## Instructions
- Choose the most specific category that fits
- Keep codenames concise and recognizable
- Codenames MUST use snake_case format for multi-word names (e.g., "magic_ui", "react_components")
- Make punchlines memorable and specific
- Descriptions should be informative but brief
${domain ? `- Consider the domain context: ${domain}` : ""}

# Input
Site Name: "${name}"
Site Description: "${desc}"${
    processedContent ? `\nSite Content: "${processedContent}"` : ""
  }

# Output`

  return prompt
}

export const getSimpleTagsLabelsCategoriesPrompt = (
  name: string,
  desc: string,
  content: string
) => {
  const { content: processedContent, domain } = prepareContent(content)

  const prompt = `
# Objective
Enrich the following product with relevant tags, labels, and category.

${buildReasoningChain()}

# Examples

Example 1 - Typography Resource:
- Input
Site Name: "Google Fonts"
Site Description: "Making the web more beautiful, fast, and open through great typography"
Site Content: "Browse fonts, download font families, web fonts, typography"
- Output
{
  "category": "design",
  "labels": ["typography", "design_tools"],
  "tags": ["fonts", "web_fonts", "typography_tools", "google"]
}

Example 2 - Component Library:
- Input
Site Name: "Ant Design"
Site Description: "A design language and React UI library"
Site Content: "React components, design system, npm install antd"
- Output
{
  "category": "dev",
  "labels": ["component_libraries", "design_systems"],
  "tags": ["react", "ui_components", "design_systems", "antd"]
}

Example 3 - Niche Design Tool:
- Input  
Site Name: "Figma Plugin"
Site Description: "Color palette generator for Figma"
Site Content: "Figma plugin, color tools, design workflow"
- Output
{
  "category": "design",
  "labels": ["design_tools", "color_tools"],
  "tags": ["figma_plugins", "color_tools", "palettes"]
}

Example 4 - API Service:
- Input
Site Name: "Stripe"
Site Description: "Payment processing for internet businesses"
Site Content: "API payments credit cards subscriptions webhooks"
- Output
{
  "category": "dev",
  "labels": ["apis_services"],
  "tags": ["apis", "payments", "webhooks", "stripe"]
}

## What NOT to do:
❌ DON'T use camelCase: "componentLibraries", "colorTools"
❌ DON'T be too generic: labels: ["tools"], tags: ["website"]
❌ DON'T exceed limits: 5 tags, 4 labels
❌ DON'T ignore the content: always consider what the product actually does
❌ DON'T use the same term in both labels and tags: labels: ["design_tools"], tags: ["design_tools"]

${COMMON_GUIDELINES}

${CATEGORY_DEFINITIONS}

## Instructions
- Choose labels that are more specific than the category but broader than tags
- Tags should be highly specific to the product's function or technology
- Consider the target audience and primary use case
- Use domain-specific terminology when appropriate
${domain ? `- Domain context: ${domain} may provide classification hints` : ""}

# Input
Site Name: "${name}"
Site Description: "${desc}"${
    processedContent ? `\nSite Content: "${processedContent}"` : ""
  }

# Output`

  return prompt
}

export const fixLabelsTagsPrompt = (
  labels: string[],
  tags: string[],
  errorType: ErrorType = "validation",
  context?: { name?: string; desc?: string; content?: string }
) => {
  const strategy = ERROR_HANDLING_STRATEGIES[errorType]

  const prompt = `
# Objective
Revise the following labels and tags to be more descriptive and accurate.

${buildReasoningChain()}

# Examples of GOOD fixes:

Before: ["tools", "resources"]
After: ["design_tools", "typography"] 
Reason: More specific and actionable

Before: ["webDev", "frontEnd"] 
After: ["frontend_frameworks", "developer_tools"]
Reason: Proper snake_case and more precise

Before: ["website", "online", "digital"]
After: ["component_libraries", "react"]
Reason: Focus on functionality, not delivery method

## Error Resolution Strategy
${strategy}

${COMMON_GUIDELINES}

## Available Options
LABEL SUGGESTIONS: 
${JSON.stringify(allowedLabels)}

TAG SUGGESTIONS:
${JSON.stringify(tagsEnum)}

## Instructions
- Analyze why the current labels/tags are inadequate
- Replace generic terms with specific functionality-focused ones
- Ensure proper snake_case formatting
- Maximum of 3 labels and 4 tags
- Consider: What does this product actually DO?
${context ? `\nContext: ${context.name} - ${context.desc}` : ""}

# Current Labels/Tags to Fix
Labels: ${JSON.stringify(labels)}
Tags: ${JSON.stringify(tags)}

# Output`

  return prompt
}

export const getAIEnrichmentPrompt = (
  name: string,
  desc: string,
  content: string
) => {
  const { content: processedContent, domain } = prepareContent(content)

  const prompt = `
# Objective
Perform comprehensive enrichment of the following product with relevant classification, branding, and descriptive content.

${buildReasoningChain()}

# Examples

Example 1 - Typography Resource:
- Input
Site Name: "Google Fonts"
Site Description: "Making the web more beautiful, fast, and open through great typography"
Site Content: "Browse fonts, download font families, web fonts, typography"
- Output
{
  "category": "design",
  "labels": ["typography", "design_tools"],
  "tags": ["fonts", "web_fonts", "typography_tools", "google"],
  "codename": "google_fonts",
  "punchline": "Beautiful Web Typography",
  "description": "A comprehensive library of open-source fonts optimized for the web, making beautiful typography accessible to everyone."
}

Example 2 - Component Library:
- Input
Site Name: "Ant Design"  
Site Description: "A design language and React UI library"
Site Content: "React components, design system, npm install antd"
- Output
{
  "category": "dev",
  "labels": ["component_libraries", "design_systems"],
  "tags": ["react", "ui_components", "design_systems", "antd"],
  "codename": "ant_design",
  "punchline": "Enterprise UI Design Language",
  "description": "A comprehensive React UI library and design language with high-quality components for building rich, interactive user interfaces."
}

Example 3 - Learning Platform:
- Input
Site Name: "freeCodeCamp"
Site Description: "Learn to code for free"
Site Content: "Free coding bootcamp online courses certificates web development"
- Output
{
  "category": "learning",
  "labels": ["courses", "tutorials"],
  "tags": ["web_development", "coding_bootcamp", "certificates", "free"],
  "codename": "freecodecamp",
  "punchline": "Free Coding Education",
  "description": "A comprehensive online learning platform offering free coding courses and certifications in web development and programming."
}

## What NOT to do:
❌ DON'T use inconsistent naming: codename "ant-design" vs tags ["antd"]
❌ DON'T repeat the same term: tags ["react", "react_components", "reactjs"]  
❌ DON'T make punchlines descriptions: "A tool that helps you design"
❌ DON'T ignore content clues: missing obvious technology mentions
❌ DON'T use the same term in both labels and tags: labels: ["design_tools"], tags: ["design_tools"]
❌ DON'T use camelCase or spaces in codenames: "magicui", "Magic UI" should be "magic_ui"
❌ DON'T use PascalCase in codenames: "ReactComponents" should be "react_components"

${COMMON_GUIDELINES}

${CATEGORY_DEFINITIONS}

${FIELD_DEFINITIONS}

## Instructions
This is a comprehensive enrichment, so be thorough:
- Analyze the name, description, and content for all clues
- Choose the most accurate category first, then build labels and tags around it  
- Ensure consistency across all fields (codename should match tags conceptually)
- Codenames MUST use snake_case format for multi-word names (e.g., "magic_ui", "react_components")
- Balance specificity with discoverability
- Consider both primary function AND target audience
${domain ? `- Domain context: ${domain}` : ""}

# Input
Site Name: "${name}"
Site Description: "${desc}"${
    processedContent ? `\nSite Content: "${processedContent}"` : ""
  }

# Output`

  return prompt
}

export const getFixPrompt = (
  name: string,
  desc: string,
  content: string,
  failedOutput: any,
  errorType: ErrorType = "format",
  attemptNumber: number = 1
) => {
  const { content: processedContent, domain } = prepareContent(content)
  const strategy = ERROR_HANDLING_STRATEGIES[errorType]

  // Analyze the specific error
  const errorAnalysis = analyzeFailedOutput(failedOutput, errorType)

  const prompt = `
# Objective
Fix the previous enrichment attempt that failed due to ${errorType} errors.

## Failed Output Analysis
${JSON.stringify(failedOutput, null, 2)}

## Specific Issues Identified:
${errorAnalysis}

## Recovery Strategy (Attempt ${attemptNumber})
${strategy}

${buildReasoningChain()}

# Successful Fix Examples

Example 1 - Format Error Fix:
❌ Bad: { category: "design tools", codename: "DesignTool", punchline: "Helps with design" }
✅ Good: { "category": "design", "codename": "design_tool", "punchline": "Design Made Simple" }

Example 2 - Validation Error Fix:
❌ Bad: { "category": "webdev", "labels": ["frontEnd", "UI"] }
✅ Good: { "category": "dev", "labels": ["frontend_frameworks", "ui_components"] }

Example 3 - Classification Error Fix:
❌ Bad: { "category": "tools", "tags": ["website", "online"] }
✅ Good: { "category": "design", "tags": ["design_tools", "prototyping"] }

Example 4 - Overlap Error Fix:
❌ Bad: { "labels": ["design_tools"], "tags": ["design_tools", "prototyping"] }
✅ Good: { "labels": ["design_tools"], "tags": ["prototyping", "ui_components"] }

${COMMON_GUIDELINES}

${CATEGORY_DEFINITIONS}

${FIELD_DEFINITIONS}

## Fix Instructions
- Address the specific error type: ${errorType}
- Ensure proper JSON formatting with quoted keys
- Validate all values against allowed options
- Re-examine the content for better classification clues
- Use the recovery strategy above
${domain ? `- Consider domain context: ${domain}` : ""}

# Input
Site Name: "${name}"
Site Description: "${desc}"${
    processedContent ? `\nSite Content: "${processedContent}"` : ""
  }

# Output (Corrected)`

  return prompt
}

// Helper function to validate no overlap between tags and labels
const hasOverlap = (labels: string[], tags: string[]): boolean => {
  if (!labels || !tags) return false
  return labels.some((label) => tags.includes(label))
}

// Export validation function for external use
export const validateNoOverlap = (
  labels: string[],
  tags: string[]
): { isValid: boolean; overlapping: string[] } => {
  if (!labels || !tags) return { isValid: true, overlapping: [] }
  const overlapping = labels.filter((label) => tags.includes(label))
  return { isValid: overlapping.length === 0, overlapping }
}

// Helper function to analyze failed output
const analyzeFailedOutput = (
  failedOutput: any,
  errorType: ErrorType
): string => {
  const issues: string[] = []

  if (errorType === "format") {
    if (typeof failedOutput !== "object")
      issues.push("- Output is not a valid JSON object")
    if (!failedOutput.category)
      issues.push('- Missing required "category" field')
    if (!failedOutput.codename)
      issues.push('- Missing required "codename" field')
  }

  if (errorType === "validation") {
    if (
      failedOutput.category &&
      !categoriesEnum.includes(failedOutput.category)
    ) {
      issues.push(`- Invalid category: "${failedOutput.category}"`)
    }
    if (
      failedOutput.labels &&
      failedOutput.labels.some(
        (l: string) => l.includes(" ") || /[A-Z]/.test(l)
      )
    ) {
      issues.push("- Labels contain spaces or camelCase (should be snake_case)")
    }
    if (failedOutput.tags && failedOutput.tags.length > 4) {
      issues.push("- Too many tags (maximum 4 allowed)")
    }
  }

  if (errorType === "overlap") {
    if (
      failedOutput.labels &&
      failedOutput.tags &&
      hasOverlap(failedOutput.labels, failedOutput.tags)
    ) {
      const overlapping = failedOutput.labels.filter((l: string) =>
        failedOutput.tags.includes(l)
      )
      issues.push(
        `- Tags and labels have overlap: ${overlapping.join(
          ", "
        )} - this is not allowed`
      )
    }
  }

  if (errorType === "content") {
    if (
      failedOutput.tags &&
      failedOutput.tags.every((t: string) =>
        ["website", "online", "digital", "tools"].includes(t)
      )
    ) {
      issues.push("- Tags are too generic, missing specific functionality")
    }
  }

  return issues.length > 0
    ? issues.join("\n")
    : "No specific issues detected, general improvement needed."
}
