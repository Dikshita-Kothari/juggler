import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const t_id = Number(taskId);

    const comments = await prisma.taskComment.findMany({
      where: { t_id, is_deleted: false },
      include: { user: true },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const t_id = Number(taskId);
    const { text } = await req.json();

    if (!text) return NextResponse.json({ error: "Comment text is required" }, { status: 400 });

    const comment = await prisma.taskComment.create({
      data: {
        t_id,
        u_id: session.user.id,
        comment_text: text,
      },
      include: { user: true }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("POST Comment error:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
