import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Note from "@/models/Note";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    await connectDB();
    const note = await Note.findOneAndUpdate(
      { _id: id },
      body,
      { new: true }
    );

    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    await connectDB();
    const note = await Note.findOneAndDelete({ _id: id });

    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
