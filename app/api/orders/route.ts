import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createOrder } from "@/lib/orders";

const orderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().min(1),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
  items: z
    .array(
      z.object({
        slug: z.string(),
        title: z.string(),
        image: z.string(),
        price: z.number(),
        quantity: z.number().min(1),
      })
    )
    .min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    const session = await auth();
    const order = await createOrder({
      ...parsed.data,
      userId: session?.user?.id ?? null,
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      id: order.id,
    });
  } catch (err) {
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
