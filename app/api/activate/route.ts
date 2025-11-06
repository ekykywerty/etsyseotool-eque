import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { activation_key, email } = body;

    if (!activation_key || !email) {
      return NextResponse.json({ error: "Key and email are required" }, { status: 400 });
    }

    // Проверяем наличие ключа в базе
    const result = await sql`
      SELECT * FROM activation_keys
      WHERE activation_key = ${activation_key};
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid activation key" }, { status: 400 });
    }

    const keyData = result.rows[0];

    if (keyData.status === "active") {
      return NextResponse.json({ error: "This key is already activated" }, { status: 400 });
    }

    // Устанавливаем дату активации и истечения (через 30 дней)
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Обновляем данные ключа
    await sql`
      UPDATE activation_keys
      SET 
        status = 'active',
        email = ${email},
        activated_at = ${now.toISOString()},
        expires_at = ${expiresAt.toISOString()}
      WHERE activation_key = ${activation_key};
    `;

    return NextResponse.json({
      success: true,
      message: "Key activated successfully",
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Activation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: 'error.message' },
      { status: 500 }
    );
  }
}