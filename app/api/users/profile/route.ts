import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, username, email, avatar_color } = await req.json();

    // Check if username/email taken (if changed)
    const existing = await prisma.user.findFirst({
        where: {
            OR: [
                { username: username || undefined },
                { email: email || undefined }
            ],
            NOT: { id: session.user.id }
        }
    });

    if (existing) {
        return NextResponse.json({ error: "Username or Email already in use" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        username,
        email,
        avatar_color
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PATCH User Profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
