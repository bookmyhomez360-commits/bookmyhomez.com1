import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(model, prompt, retries = 3, delay = 60000) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        console.log(`Rate limit (429) hit. Waiting ${delay / 1000} seconds before retrying...`);
        await sleep(delay);
        delay += 30000;
      } else {
        throw error;
      }
    }
  }
}

async function runSEOAgent() {
  console.log("🤖 AI SEO Agent for BookMyHomez started...");

  let codeSnippet = '';
  if (fs.existsSync('./index.html')) {
    codeSnippet = fs.readFileSync('./index.html', 'utf8');
  } else if (fs.existsSync('./src/App.tsx')) {
    codeSnippet = fs.readFileSync('./src/App.tsx', 'utf8');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    await sleep(5000);

    const result = await generateWithRetry(model, prompt);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();

    JSON.parse(responseText);

    fs.writeFileSync('./public/seo-metadata.json', responseText);
    console.log("✅ Successfully updated public/seo-metadata.json");
  } catch (error) {
    console.error("❌ Error generating SEO metadata:", error);
    process.exit(1);
  }
}

runSEOAgent();
