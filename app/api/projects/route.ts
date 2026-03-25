import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const projects = await prisma.project.findMany({
      where: { 
        is_deleted: false,
        members: {
          some: { u_id: userId }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET Projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, deadline } = await req.json();
    if (!name) return NextResponse.json({ error: "Project name is required" }, { status: 400 });

    const userId = session.user.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        deadline: deadline ? new Date(deadline) : null,
        u_id: userId,
        members: {
          create: {
            u_id: userId,
            role: 'OWNER'
          }
        }
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("POST Projects error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
