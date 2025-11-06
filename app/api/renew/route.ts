import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { activation_key } = body;

    if (!activation_key) {
      return NextResponse.json({ error: "Activation key is required" }, { status: 400 });
    }

    // Проверяем, существует ли ключ
    const result = await sql`
      SELECT * FROM activation_keys
      WHERE activation_key = ${activation_key};
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const keyData = result.rows[0];

    // Считаем новую дату истечения — продлеваем на 30 дней
    const now = new Date();
    const newExpires = new Date(now);
    newExpires.setDate(newExpires.getDate() + 30);

    // Обновляем ключ в базе
    await sql`
      UPDATE activation_keys
      SET 
        status = 'active',
        activated_at = ${now.toISOString()},
        expires_at = ${newExpires.toISOString()}
      WHERE activation_key = ${activation_key};
    `;

    return NextResponse.json({
      success: true,
      message: "Subscription renewed for 30 days",
      expires_at: newExpires.toISOString(),
    });
  } catch (error) {
    console.error("Renew error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: 'error.message' },
      { status: 500 }
    );
  }
}