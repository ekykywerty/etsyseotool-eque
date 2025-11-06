import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("=== CHECK-KEY REQUEST START ===");

    const body = await request.json();
    console.log("Request body:", body);

    const { activationKey, email } = body;

    if (!activationKey || !email) {
      return NextResponse.json(
        { valid: false, error: "Activation key and email are required" },
        { status: 400 }
      );
    }

    // Проверяем ключ в базе
    const result = await sql`
      SELECT activation_key, email, status, activated_at, expires_at 
      FROM activation_keys 
      WHERE activation_key = ${activationKey};
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { valid: false, error: "Invalid activation key" },
        { status: 401 }
      );
    }

    const key = result.rows[0];
    const now = new Date();

    // Если ключ не активирован — активируем
    if (!key.email) {
     const now = new Date();
     const expiresAt = new Date();
     expiresAt.setDate(expiresAt.getDate() + 30);

      await sql`
     UPDATE activation_keys
     SET 
     status = 'active',
     email = ${email},
      activated_at = ${now.toISOString()},
      expires_at = ${expiresAt.toISOString()}
  WHERE activation_key = ${activationKey};
`;

      return NextResponse.json({
        valid: true,
        message: "Key activated successfully",
        expires_at: expiresAt.toISOString(),
      });
    }

    // Ключ активирован другим пользователем
    if (key.email !== email) {
      return NextResponse.json(
        {
          valid: false,
          error: "This key is already activated for another email address",
        },
        { status: 403 }
      );
    }

    // Проверяем срок действия
    if (key.expires_at && new Date(key.expires_at) < now) {
      return NextResponse.json(
        {
          valid: false,
          error: "Activation key has expired",
        },
        { status: 403 }
      );
    }

    // Ключ активен
    return NextResponse.json({
      valid: true,
      message: "Key is valid and active",
      expires_at: key.expires_at,
    });
  } catch (error) {
    console.error("=== CHECK-KEY ERROR ===", error);
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    console.log("=== CHECK-KEY REQUEST END ===");
  }
}
