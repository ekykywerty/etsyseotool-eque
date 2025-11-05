import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('=== ANALYZE REQUEST START ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { productTitle, productDescription, activationKey, email } = body;

    if (!activationKey || !email) {
      console.log('Missing activation key or email');
      return NextResponse.json({ error: 'Activation key and email required' }, { status: 401 });
    }

    if (!productTitle) {
      console.log('Missing product title');
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    // Проверяем ключ и email в базе
    console.log('Checking key in database...');
    const keyCheck = await sql`
      SELECT activation_key, email FROM activation_keys 
      WHERE activation_key = ${activationKey}
    `;

    console.log('Key check result:', keyCheck.rows);

    if (keyCheck.rows.length === 0) {
      console.log('Key not found');
      return NextResponse.json({ error: 'Invalid activation key' }, { status: 401 });
    }

    const keyData = keyCheck.rows[0];
    
    // Проверяем что ключ привязан к этому email
    if (!keyData.email) {
      console.log('Key not activated with any email');
      return NextResponse.json({ 
        error: 'Key is not activated. Please activate it first.' 
      }, { status: 401 });
    }

    if (keyData.email !== email) {
      console.log('Email mismatch. DB email:', keyData.email, 'Request email:', email);
      return NextResponse.json({ 
        error: 'This key is activated with a different email address' 
      }, { status: 401 });
    }

    console.log('Key validation passed');

    // Проверяем API ключ Gemini
    if (!process.env.GEMINI_API_KEY) {
      console.log('Gemini API key not found in environment, using mock data');
      return generateMockResponse(productTitle);
    }

    console.log('Gemini API key found, proceeding with AI analysis');

    // ИСПРАВЛЕНО: Убрано дублирование кода Gemini
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Create an optimized Etsy listing for: "${productTitle}"

Return ONLY this JSON format, no other text:
{
  "optimized_title": "optimized title here",
  "character_count": 123,
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12", "tag13"],
  "description_improvements": ["tip1", "tip2", "tip3", "tip4", "tip5"]
}`;

      console.log('Sending request to Gemini...');
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      console.log('Raw Gemini response:', text);

      // Улучшенная очистка ответа
      text = text.trim();
      text = text.replace(/^```json\s*/i, '');
      text = text.replace(/```$/i, '');
      text = text.replace(/^JSON:\s*/i, '');
      text = text.trim();

      console.log('Cleaned response:', text);

      // Парсим JSON с обработкой ошибок
      let analysisResult;
      try {
        analysisResult = JSON.parse(text);
        console.log('Successfully parsed JSON');
        
        // Проверяем и корректируем длину заголовка
        if (analysisResult.optimized_title) {
          const currentLength = analysisResult.optimized_title.length;
          analysisResult.character_count = currentLength;
          
          if (currentLength < 90) {
            console.warn('Title too short, adjusting...');
            analysisResult.optimized_title = analysisResult.optimized_title + " | Premium Handcrafted Quality & Fast Shipping";
            analysisResult.character_count = analysisResult.optimized_title.length;
          } else if (currentLength > 140) {
            console.warn('Title too long, trimming...');
            analysisResult.optimized_title = analysisResult.optimized_title.substring(0, 140);
            analysisResult.character_count = 140;
          }
        }
        
        // Проверяем количество тегов
        if (analysisResult.tags && analysisResult.tags.length !== 13) {
          console.warn('Incorrect number of tags, adjusting...');
          analysisResult.tags = analysisResult.tags.slice(0, 13);
          while (analysisResult.tags.length < 13) {
            analysisResult.tags.push(`tag${analysisResult.tags.length + 1}`);
          }
        }
        
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Fallback если парсинг не удался
        analysisResult = generateFallbackResponse(productTitle);
      }

      console.log('Analysis completed successfully, returning results');
      return NextResponse.json(analysisResult);

    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      // Fallback response при ошибке Gemini
      return NextResponse.json(generateFallbackResponse(productTitle));
    }

  } catch (error) {
    console.error('=== ANALYSIS ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json({ 
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    console.log('=== ANALYZE REQUEST END ===');
  }
}

// Вспомогательные функции для fallback данных
function generateMockResponse(productTitle: string) {
  return NextResponse.json({
    optimized_title: "Personalized Leather Journal - Custom Name Embossed Writing Notebook for Writers & Students | Handmade Gift",
    character_count: 98,
    tags: [
      "leather journal", "personalized notebook", "writing gift", "custom diary", 
      "embossed journal", "writers supplies", "student gift", "handmade journal",
      "stationery gift", "journaling supplies", "custom name", "christmas gift", "birthday present"
    ],
    description_improvements: [
      "Add exact dimensions: 8.5x6 inches, 200 pages of premium paper",
      "Specify leather type: full-grain Italian leather with brass clasp",
      "Include personalization timeline: 3-5 business days for name embossing",
      "Add care instructions: avoid direct sunlight, use leather conditioner monthly",
      "Mention gift packaging: free gift wrap with handwritten note option"
    ]
  });
}

function generateFallbackResponse(productTitle: string) {
  return {
    optimized_title: productTitle.length > 140 ? productTitle.substring(0, 140) : 
                    productTitle.length < 90 ? productTitle + " | Premium Handcrafted Quality & Fast Shipping" : productTitle,
    character_count: Math.min(Math.max(productTitle.length, 90), 140),
    tags: [
      "handmade", "custom", "personalized", "gift", "unique", 
      "premium quality", "handcrafted", "artisan", "special gift",
      "exclusive", "limited edition", "etsy favorite", "perfect present"
    ],
    description_improvements: [
      "Write a compelling opening that highlights the unique value proposition",
      "Include all product specifications with exact measurements and materials",
      "Describe the craftsmanship process and quality standards in detail",
      "Mention customization options and personalization delivery timeline",
      "Add shipping information, care instructions and satisfaction guarantee"
    ]
  };
}