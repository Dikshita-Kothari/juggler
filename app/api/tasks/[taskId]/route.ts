import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const t_id = Number(taskId);
    const body = await req.json();

    const oldTask = await prisma.task.findUnique({ 
        where: { t_id },
        include: { project: { include: { members: true } } }
    });
    
    if (!oldTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // Check if user is a member of the project
    const isMember = oldTask.project.members.some(m => m.u_id === session.user?.id);
    if (!isMember) {
        return NextResponse.json({ error: "Unauthorized to edit this task" }, { status: 403 });
    }

    // Sanitize updates to exclude relations and read-only fields
    const { 
        changed_by, t_id: _, created_at, updated_at, 
        project, comments, subtasks, history, 
        deadline: rawDeadline,
        ...updates 
    } = body;

    const updatedTask = await prisma.task.update({
      where: { t_id },
      data: {
        ...updates,
        // Correctly handle deadline: convert string to Date, or ""/null to null for clearing
        deadline: rawDeadline === "" || rawDeadline === null ? null : (rawDeadline ? new Date(rawDeadline) : undefined),
      }
    });

    // Handle history logging using secure session ID
    if (body.status || body.priority) {
      await prisma.taskHistory.create({
        data: {
          t_id,
          p_id: oldTask.p_id,
          changed_by: session.user.id,
          action_type: body.status ? "STATUS_CHANGE" : "PRIORITY_CHANGE",
          old_value: body.status ? oldTask.status : oldTask.priority,
          new_value: body.status || body.priority,
        }
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PATCH Task error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const t_id = Number(taskId);

    const oldTask = await prisma.task.findUnique({ 
        where: { t_id },
        include: { project: { include: { members: true } } }
    });
    
    if (!oldTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const isMember = oldTask.project.members.some(m => m.u_id === session.user?.id);
    if (!isMember) {
        return NextResponse.json({ error: "Unauthorized to delete this task" }, { status: 403 });
    }

    await prisma.task.update({
      where: { t_id },
      data: { is_deleted: true }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Task error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
