import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get("categoria");
  const featured = searchParams.get("featured");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: {
    active: boolean;
    category?: { slug: string };
    featured?: boolean;
  } = { active: true };

  if (categoria) where.category = { slug: categoria };
  if (featured === "true") where.featured = true;

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = productSchema.parse(body);
    const slug = slugify(data.name);

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
        price: data.price,
      },
      include: { category: true, images: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear el producto" }, { status: 400 });
  }
}
