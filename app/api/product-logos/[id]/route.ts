import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT /api/product-logos/[id] - Update logo
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

        const logo = await prisma.productLogo.update({
            where: { id },
            data: {
                name: body.name,
                logoPath: body.logoPath,
                linkUrl: body.linkUrl,
                order: body.order,
                isActive: body.isActive,
            },
        });

        return NextResponse.json(logo);
    } catch (error) {
        console.error("Error updating product logo:", error);
        return NextResponse.json(
            { error: "Failed to update product logo" },
            { status: 500 }
        );
    }
}

// DELETE /api/product-logos/[id] - Delete logo
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

        await prisma.productLogo.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting product logo:", error);
        return NextResponse.json(
            { error: "Failed to delete product logo" },
            { status: 500 }
        );
    }
}
