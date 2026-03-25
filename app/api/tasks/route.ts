import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const p_id_param = searchParams.get("p_id");
    const p_id = p_id_param ? Number(p_id_param) : null;

    // Filter tasks based on project membership
    const tasks = await prisma.task.findMany({
      where: {
        is_deleted: false,
        project: {
          members: {
            some: { u_id: userId }
          }
        },
        ...(p_id ? { p_id } : {})
      },
      include: {
        subtasks: {
          where: { is_deleted: false }
        },
        comments: {
          where: { is_deleted: false },
          include: { user: true }
        },
        history: {
          include: { user: true },
          orderBy: { created_at: "desc" }
        }
      },
      orderBy: { position: "asc" }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET Tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { p_id, parent_task_id, name, description, status, priority, deadline, position } = body;

    const projectId = Number(p_id);
    const userId = session.user.id;

    // Check project membership
    const membership = await prisma.projectMember.findFirst({
        where: { p_id: projectId, u_id: userId }
    });

    if (!membership) {
        return NextResponse.json({ error: "Unauthorized to create tasks in this project" }, { status: 403 });
    }

    const task = await prisma.task.create({
      data: {
        p_id: projectId,
        parent_task_id: parent_task_id ? Number(parent_task_id) : null,
        name,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        deadline: deadline ? new Date(deadline) : null,
        position: position || 0,
      }
    });

    // Automatically log history using secure session ID
    await prisma.taskHistory.create({
        data: {
            t_id: task.t_id,
            p_id: task.p_id,
            changed_by: userId,
            action_type: "CREATED",
            new_value: name,
        }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("POST Tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
