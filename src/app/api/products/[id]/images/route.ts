import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const imagesSchema = z.object({
  urls: z.array(z.string().url()),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { urls } = imagesSchema.parse(body);

    // Delete existing images and recreate
    await prisma.productImage.deleteMany({ where: { productId: params.id } });

    const images = await prisma.productImage.createMany({
      data: urls.map((url, index) => ({
        url,
        order: index,
        productId: params.id,
      })),
    });

    return NextResponse.json({ created: images.count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al guardar imágenes" }, { status: 400 });
  }
}
