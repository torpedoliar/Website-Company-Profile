import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/page-sections?page=beranda - Get sections for a page
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const pageSlug = searchParams.get("page") || "beranda";

        const sections = await prisma.pageSection.findMany({
            where: {
                pageSlug,
                isActive: true,
            },
            include: {
                pinnedAnnouncement: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        excerpt: true,
                        imagePath: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { order: "asc" },
        });

        return NextResponse.json(sections);
    } catch (error) {
        console.error("Error fetching page sections:", error);
        return NextResponse.json(
            { error: "Failed to fetch page sections" },
            { status: 500 }
        );
    }
}

// POST /api/page-sections - Create new section (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            pageSlug,
            sectionKey,
            sectionType,
            title,
            subtitle,
            content,
            buttonText,
            buttonUrl,
            imagePath,
            imagePath2,
            videoPath,
            videoType,
            youtubeUrl,
            backgroundColor,
            textColor,
            layout,
            order,
            pinnedAnnouncementId,
        } = body;

        if (!pageSlug || !sectionKey || !sectionType) {
            return NextResponse.json(
                { error: "pageSlug, sectionKey, and sectionType are required" },
                { status: 400 }
            );
        }

        const section = await prisma.pageSection.create({
            data: {
                pageSlug,
                sectionKey,
                sectionType,
                title,
                subtitle,
                content,
                buttonText,
                buttonUrl,
                imagePath,
                imagePath2,
                videoPath,
                videoType,
                youtubeUrl,
                backgroundColor,
                textColor,
                layout,
                order: order ?? 0,
                pinnedAnnouncementId,
            },
        });

        return NextResponse.json(section, { status: 201 });
    } catch (error) {
        console.error("Error creating page section:", error);
        return NextResponse.json(
            { error: "Failed to create page section" },
            { status: 500 }
        );
    }
}
