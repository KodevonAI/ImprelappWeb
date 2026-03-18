import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  return NextResponse.json(order);
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
    const { status } = updateOrderSchema.parse(body);

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar el pedido" }, { status: 400 });
  }
}
