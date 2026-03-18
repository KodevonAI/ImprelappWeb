import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, images: { orderBy: { order: "asc" } } },
  });

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json(product);
}

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
    const data = productSchema.parse(body);

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const slug = existing.name !== data.name ? slugify(data.name) : existing.slug;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: { ...data, slug, price: data.price },
      include: { category: true, images: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar el producto" }, { status: 400 });
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
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar el producto" }, { status: 400 });
  }
}
