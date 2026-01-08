import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/page-sections/[id] - Get single section
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const section = await prisma.pageSection.findUnique({
            where: { id },
            include: {
                pinnedAnnouncement: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        excerpt: true,
                        imagePath: true,
                    },
                },
            },
        });

        if (!section) {
            return NextResponse.json({ error: "Section not found" }, { status: 404 });
        }

        return NextResponse.json(section);
    } catch (error) {
        console.error("Error fetching page section:", error);
        return NextResponse.json(
            { error: "Failed to fetch page section" },
            { status: 500 }
        );
    }
}

// PUT /api/page-sections/[id] - Update section
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const section = await prisma.pageSection.update({
            where: { id },
            data: {
                title: body.title,
                subtitle: body.subtitle,
                content: body.content,
                buttonText: body.buttonText,
                buttonUrl: body.buttonUrl,
                imagePath: body.imagePath,
                imagePath2: body.imagePath2,
                videoPath: body.videoPath,
                videoType: body.videoType,
                youtubeUrl: body.youtubeUrl,
                backgroundColor: body.backgroundColor,
                textColor: body.textColor,
                layout: body.layout,
                order: body.order,
                isActive: body.isActive,
                pinnedAnnouncementId: body.pinnedAnnouncementId,
            },
        });

        return NextResponse.json(section);
    } catch (error) {
        console.error("Error updating page section:", error);
        return NextResponse.json(
            { error: "Failed to update page section" },
            { status: 500 }
        );
    }
}

// DELETE /api/page-sections/[id] - Delete section
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.pageSection.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting page section:", error);
        return NextResponse.json(
            { error: "Failed to delete page section" },
            { status: 500 }
        );
    }
}
