import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Note from "@/models/Note";

export async function GET(req) {
  try {
    await connectDB();
    const notes = await Note.find({}).sort({ isPinned: -1, date: -1 });
    
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { title, content, tags, color, isPinned, date } = await req.json();

    await connectDB();
    const note = await Note.create({
      title,
      content,
      tags,
      color,
      isPinned,
      date: date || new Date(),
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
