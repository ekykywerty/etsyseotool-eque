import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Initializing database...');

    // Создаем таблицу с обновленной структурой (убираем is_used, добавляем email)
    await sql`
      CREATE TABLE IF NOT EXISTS activation_keys (
        id SERIAL PRIMARY KEY,
        key_code VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255),
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('Table created/verified');

    // Добавляем тестовый ключ
    const key = 'ETSY-SEO-TEST123';
    await sql`
      INSERT INTO activation_keys (activation_key) 
      VALUES (${key})
      ON CONFLICT (activation_key) DO NOTHING;
    `;

    console.log('Test key added:', key);

    // Проверяем что всё работает
    const testQuery = await sql`SELECT * FROM activation_keys WHERE activation_key = ${key}`;
    console.log('Verification query result:', testQuery.rows);

    return NextResponse.json({ 
      success: true,
      message: '✅ Database initialized successfully with new structure!',
      verified: testQuery.rows.length > 0
    });

  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database initialization failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}