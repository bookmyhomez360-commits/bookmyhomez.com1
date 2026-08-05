import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function runSEOAgent() {
  console.log("🤖 AI SEO Agent for BookMyHomez started using OpenAI...");

  let codeSnippet = '';
  if (fs.existsSync('./index.html')) {
    codeSnippet = fs.readFileSync('./index.html', 'utf8');
  } else if (fs.existsSync('./src/App.tsx')) {
    codeSnippet = fs.readFileSync('./src/App.tsx', 'utf8');
  }

  const prompt = `
You are an autonomous SEO Optimization Agent for a home rental platform "BookMyHomez".
Analyze the website code below and provide optimal SEO Metadata.

Code snippet:
${codeSnippet}

Return ONLY a valid JSON object with these exact keys:
{
  "title": "Optimized Page Title (max 60 chars)",
  "description": "Optimized Meta Description (max 160 chars)",
  "keywords": "comma, separated, keywords"
}
Do not include any backticks or markdown formatting like \`\`\`json.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = completion.choices[0].message.content.replace(/```json|```/g, '').trim();
    JSON.parse(responseText);

    fs.writeFileSync('./public/seo-metadata.json', responseText);
    console.log("✅ Successfully updated public/seo-metadata.json");
  } catch (error) {
    console.error("❌ Error generating SEO metadata:", error);
    process.exit(1);
  }
}

runSEOAgent();
