import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/product-logos - Get all logos
export async function GET() {
    try {
        const logos = await prisma.productLogo.findMany({
            where: { isActive: true },
            orderBy: { order: "asc" },
        });

        return NextResponse.json(logos);
    } catch (error) {
        console.error("Error fetching product logos:", error);
        return NextResponse.json(
            { error: "Failed to fetch product logos" },
            { status: 500 }
        );
    }
}

// POST /api/product-logos - Add new logo (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, logoPath, linkUrl, order } = body;

        if (!name || !logoPath) {
            return NextResponse.json(
                { error: "name and logoPath are required" },
                { status: 400 }
            );
        }

        const logo = await prisma.productLogo.create({
            data: {
                name,
                logoPath,
                linkUrl,
                order: order ?? 0,
            },
        });

        return NextResponse.json(logo, { status: 201 });
    } catch (error) {
        console.error("Error creating product logo:", error);
        return NextResponse.json(
            { error: "Failed to create product logo" },
            { status: 500 }
        );
    }
}
