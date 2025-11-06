import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

interface SEOAnalysis {
  optimized_title: string;
  character_count: number;
  tags: string[];
  description_improvements: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productTitle, productDescription, activationKey, email } = body;

    if (!activationKey || !email) {
      return NextResponse.json({ error: "Activation key required" }, { status: 400 });
    }

    // Проверка ключа перед анализом
    const keyCheck = await sql`
      SELECT * FROM activation_keys
      WHERE activation_key = ${activationKey} AND email = ${email} AND status = 'active';
    `;
    if (keyCheck.rows.length === 0) {
      return NextResponse.json({ error: "Invalid or inactive key" }, { status: 403 });
    }

    // ТУТ вставляешь вызов своей нейросети или генерацию SEO
    // Для примера возвращаем заглушку
    const analysis: SEOAnalysis = {
      optimized_title: productTitle + " | Optimized",
      character_count: productTitle.length,
      tags: ["tag1", "tag2", "tag3"],
      description_improvements: ["Use more keywords", "Make description concise"],
    };

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
