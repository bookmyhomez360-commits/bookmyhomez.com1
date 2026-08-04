import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
  You are an autonomous SEO Optimization Agent for a home rental/booking platform "BookMyHomez".
  Analyze the website code and provide optimal SEO Metadata.
  
  Return ONLY a valid JSON object with these exact keys:
  {
    "title": "Optimized Page Title (max 60 chars)",
    "description": "Engaging Meta Description for home booking/rentals (max 160 chars)",
    "keywords": "5 to 8 high intent keywords separated by commas",
    "ogTitle": "Social Share Title",
    "ogDescription": "Social Share Description"
  }

  Website Code snippet:
  ${codeSnippet.slice(0, 3000)}
  `;

  const result = await model.generateContent(prompt);
  let responseText = result.response.text();
  
  responseText = responseText.replace(/```json|```/g, '').trim();

  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
  }
  
  fs.writeFileSync('./public/seo-metadata.json', responseText);
  console.log("✅ Dynamic SEO Metadata saved successfully in public/seo-metadata.json!");
}

runSEOAgent().catch(console.error);
