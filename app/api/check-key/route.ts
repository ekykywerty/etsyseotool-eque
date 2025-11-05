import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('=== CHECK-KEY REQUEST START ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { activationKey, email } = body;

    if (!activationKey || !email) {
      console.log('Missing activation key or email');
      return NextResponse.json({ 
        valid: false, 
        error: 'Activation key and email are required' 
      }, { status: 400 });
    }

    console.log('Checking key in database...');
    const keyCheck = await sql`
      SELECT activation_key, email FROM activation_keys 
      WHERE activation_key = ${activationKey}
    `;

    console.log('Database result:', keyCheck.rows);

    if (keyCheck.rows.length === 0) {
      console.log('Invalid key');
      return NextResponse.json({ valid: false, error: 'Invalid activation key' }, { status: 401 });
    }

    const keyData = keyCheck.rows[0];

    if (!keyData.email) {
      console.log('Key exists but not yet activated');
      // Привязываем email к ключу
      await sql`
        UPDATE activation_keys 
        SET email = ${email} 
        WHERE activation_key = ${activationKey}
      `;
      console.log('Key activated successfully for email:', email);
      return NextResponse.json({ valid: true, message: 'Key activated successfully' });
    }

    if (keyData.email !== email) {
      console.log('Email mismatch: this key belongs to another user');
      return NextResponse.json({ 
        valid: false, 
        error: 'This key is already activated for another email address' 
      }, { status: 403 });
    }

    console.log('Key valid and email matches');
    return NextResponse.json({ valid: true, message: 'Key is valid and active' });

  } catch (error) {
    console.error('=== CHECK-KEY ERROR ===');
    console.error('Error details:', error);
    return NextResponse.json({ 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    console.log('=== CHECK-KEY REQUEST END ===');
  }
}
