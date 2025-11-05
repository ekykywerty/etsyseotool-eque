import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error('OpenRouter API key not found in environment variables!');
}

export async function POST(request: Request) {
  try {
    console.log('=== ANALYZE REQUEST START ===');

    const body = await request.json();
    const { productTitle, productDescription, activationKey, email } = body;

    if (!activationKey || !email) {
      return NextResponse.json(
        { error: 'Activation key and email required' },
        { status: 401 }
      );
    }

    if (!productTitle) {
      return NextResponse.json(
        { error: 'Product title is required' },
        { status: 400 }
      );
    }

    console.log('Skipping DB key check for now');

    // 🧠 НОВЫЙ ПРОМПТ
const prompt = `
You are an **Etsy SEO Expert** with 10+ years of experience optimizing listings for maximum visibility, conversion, and sales.

TASK:
Based on the user's product TITLE and optional DESCRIPTION, generate a JSON object with the following structure:

{
  "optimized_title": "string",
  "character_count": number,
  "tags": [
    "tag1", "tag2", ..., "tag13"
  ],
  "description_improvements": [
    "tip1", "tip2", "tip3", "tip4", "tip5"
  ]
}

---

### 🔹 RULES FOR "optimized_title":
- Write a professional Etsy product title between **100 and 140 characters** (not more than 140).
- Use **natural English**, not keyword stuffing.
- Include **main SEO keywords** from the product idea.
- Begin with the **primary keyword phrase** that customers actually search.
- Add specific attributes like material, style, audience, or use case.
- Avoid emojis, special characters, or cut/incomplete words.
- Never use all caps or duplicate the same word multiple times.
- If the input text looks like gibberish or random symbols (e.g., "suhev68&%$"), write: "enter the correct name of the product".

---

### 🔹 RULES FOR "tags":
- Generate **exactly 13 tags**, all lowercase and **in English only**.
- Each tag must be **1–3 words** (whole words only, no truncation).
- Each tag must be **≤20 characters**.
- Focus on **niche-specific**, **long-tail**, and **relevant** tags.
- Avoid generic tags like "gift", "etsy", "handmade", or "digital".
- Tags must describe: the product’s style, use, material, theme, audience, or occasion.
- Separate tags with commas.
- If nonsense input is detected, output: ["enter the correct name of the product"].

---

### 🔹 RULES FOR "description_improvements":
- Provide **5 concise, specific, and actionable tips** to improve the product description.
- Do NOT write or rewrite the description itself — only give improvement advice.
- Focus on structure, clarity, emotional tone, SEO, and customer trust.
- Avoid repeating the same ideas in different words.
- Make them realistic and helpful (as if advising a real Etsy seller).

---

### 🔹 RESPONSE RULES:
1. Respond **only** in valid JSON (no explanations or text outside
2. Do not use markdown or code blocks.
3. Never cut words or include non-English text.
4. Ensure all fields are included, even if placeholders are needed.
5. Keep output clean, accurate, and production-ready.

---

### 🔹 GOAL:
Help the seller improve their Etsy listing to:
- Rank higher in Etsy and Google search results.
- Increase click-through rate (CTR).
- Improve readability and trust.
- Use smart, competitive keywords that attract real buyers.

INPUT:
TITLE: "${productTitle}"
DESCRIPTION: "${productDescription || 'No description provided'}"
`;

    console.log('Sending request to DeepSeek via OpenRouter...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tngtech/deepseek-r1t2-chimera:free',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API responded with status ${response.status}`);
    }

    const data = await response.json();
    let aiText = data.choices?.[0]?.message?.content || '';
    aiText = aiText.trim().replace(/^```json\s*/i, '').replace(/```$/i, '');

    let analysisResult;
    try {
      analysisResult = JSON.parse(aiText);

      if (analysisResult.optimized_title) {
        const len = analysisResult.optimized_title.length;
        analysisResult.character_count = len;
        if (len < 90) {
          analysisResult.optimized_title += ' | Premium Handcrafted Quality & Fast Shipping';
          analysisResult.character_count = analysisResult.optimized_title.length;
        } else if (len > 140) {
          analysisResult.optimized_title = analysisResult.optimized_title.substring(0, 140);
          analysisResult.character_count = 140;
        }
      }

      // ✅ Обработка тегов
      if (!Array.isArray(analysisResult.tags)) analysisResult.tags = [];
      analysisResult.tags = analysisResult.tags
        .map((t: string) => (t || '').trim())
        .filter((t: string) => t.length > 0)
        .map((t: string) => (t.length > 20 ? t.split(' ')[0] : t)) // не обрезаем слова
        .slice(0, 13);

      // если ерунда, добавляем fallback
      if (
        analysisResult.tags.length === 0 ||
        analysisResult.tags.some((t: string) =>
          /[0-9%$#@^&*()+=/\\?><]/.test(t)
        )
      ) {
        analysisResult.tags = ['enter the correct name of the product'];
      }

      while (analysisResult.tags.length < 13)
        analysisResult.tags.push('custom-tag');

      if (!Array.isArray(analysisResult.description_improvements)) {
        analysisResult.description_improvements = [
          'Add a clear and engaging opening line',
          'Include product materials and dimensions',
          'Highlight craftsmanship and benefits',
          'Mention customization and shipping details',
          'Use natural SEO phrases without overstuffing'
        ];
      }

    } catch (err) {
      console.error('JSON parse error, using fallback:', err);
      analysisResult = {
        optimized_title: productTitle.length > 140 ? productTitle.substring(0, 140) : productTitle,
        character_count: Math.min(Math.max(productTitle.length, 90), 140),
        tags: [
          'handmade', 'custom', 'personalized', 'gift', 'unique',
          'premiumquality', 'handcrafted', 'artisandesign', 'specialgift',
          'exclusiveitem', 'limitededit', 'etsyfavorite', 'perfectpresent'
        ],
        description_improvements: [
          'Add product materials and details',
          'Describe benefits and emotions',
          'Mention shipping and customization',
          'Highlight unique features',
          'Encourage trust and professionalism'
        ]
      };
    }

    return NextResponse.json({
      optimized_title: analysisResult.optimized_title || 'N/A',
      character_count: analysisResult.character_count || 0,
      tags: analysisResult.tags || [],
      description_improvements: analysisResult.description_improvements || [],
    });

  } catch (error) {
    console.error('=== ANALYSIS ERROR ===', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    console.log('=== ANALYZE REQUEST END ===');
  }
}