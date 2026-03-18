import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { categorySchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = categorySchema.parse(body);

    const existing = await prisma.category.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    const slug = existing.name !== data.name ? slugify(data.name) : existing.slug;

    const category = await prisma.category.update({
      where: { id: params.id },
      data: { ...data, slug },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar la categoría" }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar la categoría" }, { status: 400 });
  }
}
