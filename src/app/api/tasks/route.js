import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Task from "@/models/Task";

export async function GET(req) {
  try {
    await connectDB();
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { title, description, status, priority, dueDate } = await req.json();

    await connectDB();
    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
