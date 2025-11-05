import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: "API key not set",
        status: "failed" 
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent("Say 'Hello World' in JSON format: {message: 'string'}");
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      success: true, 
      message: "Gemini API is working!",
      response: text,
      status: "connected"
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: "Check your API key and billing",
      status: "failed"
    }, { status: 500 });
  }
}