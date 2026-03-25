import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const p_id = Number(projectId);
    const body = await req.json();

    // Check membership
    const membership = await prisma.projectMember.findFirst({
        where: { p_id, u_id: session.user.id }
    });

    if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const updatedProject = await prisma.project.update({
      where: { p_id },
      data: {
        ...body,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
      }
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const p_id = Number(projectId);

    // Only OWNER can delete
    const membership = await prisma.projectMember.findFirst({
        where: { p_id, u_id: session.user.id, role: 'OWNER' }
    });

    if (!membership) return NextResponse.json({ error: "Only project owners can delete projects" }, { status: 403 });

    await prisma.project.update({
      where: { p_id },
      data: { is_deleted: true }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
