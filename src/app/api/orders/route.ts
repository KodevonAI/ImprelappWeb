import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validations";
import { z } from "zod";

const orderRequestSchema = checkoutSchema.extend({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
      productName: z.string(),
    })
  ).min(1, "El pedido debe tener al menos un producto"),
  total: z.number().positive(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where = status ? { status: status as never } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = orderRequestSchema.parse(body);

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "PENDING",
        total: data.total,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        addressStreet: data.addressStreet,
        addressCity: data.addressCity,
        addressState: data.addressState,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.unitPrice * item.quantity,
            productName: item.productName,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear el pedido" }, { status: 400 });
  }
}
