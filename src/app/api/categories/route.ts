import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { categorySchema } from "@/lib/validations";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = categorySchema.parse(body);
    const slug = slugify(data.name);

    const category = await prisma.category.create({
      data: { ...data, slug },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear la categoría" }, { status: 400 });
  }
}
