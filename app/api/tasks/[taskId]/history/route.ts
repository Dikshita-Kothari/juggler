import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const t_id = Number(taskId);

    const history = await prisma.taskHistory.findMany({
      where: { t_id },
      include: { user: true },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("GET Task History error:", error);
    return NextResponse.json({ error: "Failed to fetch task history" }, { status: 500 });
  }
}
