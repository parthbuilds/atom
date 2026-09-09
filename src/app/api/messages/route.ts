import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/messages - Fetch all direct messages for agency queue or specific project
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const shareToken = searchParams.get("shareToken");
    const queueStatus = searchParams.get("queueStatus");

    if (shareToken) {
      const project = await db.project.findUnique({
        where: { shareToken },
        select: { id: true },
      });
      if (!project) {
        return NextResponse.json({ error: "Invalid share token" }, { status: 404 });
      }
      const messages = await db.directMessage.findMany({
        where: { projectId: project.id },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ messages });
    }

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (queueStatus && queueStatus !== "ALL") where.queueStatus = queueStatus;

    const messages = await db.directMessage.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            shareToken: true,
            org: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = await db.directMessage.count({
      where: { isRead: false, senderType: "CLIENT" },
    });

    return NextResponse.json({ messages, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/messages - Client or Agency sends a message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shareToken, projectId, content, senderName, senderEmail, priority, senderType } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    let targetProjectId = projectId;
    if (!targetProjectId && shareToken) {
      const project = await db.project.findUnique({
        where: { shareToken },
        select: { id: true },
      });
      if (!project) {
        return NextResponse.json({ error: "Project not found for this share token" }, { status: 404 });
      }
      targetProjectId = project.id;
    }

    if (!targetProjectId) {
      // Fallback to first available project if testing
      const firstProject = await db.project.findFirst({ select: { id: true } });
      if (firstProject) targetProjectId = firstProject.id;
      else {
        return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
      }
    }

    const newMessage = await db.directMessage.create({
      data: {
        projectId: targetProjectId,
        content: content.trim(),
        senderName: senderName || (senderType === "AGENCY" ? "Atom Team" : "Client Stakeholder"),
        senderEmail: senderEmail || null,
        senderType: senderType || "CLIENT",
        priority: priority || "NORMAL",
        queueStatus: senderType === "AGENCY" ? "RESOLVED" : "NEW",
        isRead: senderType === "AGENCY",
      },
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/messages - Update status (read, in_progress, resolved)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isRead, queueStatus } = body;

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const updated = await db.directMessage.update({
      where: { id },
      data: {
        ...(typeof isRead === "boolean" ? { isRead } : {}),
        ...(queueStatus ? { queueStatus } : {}),
      },
    });

    return NextResponse.json({ message: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
