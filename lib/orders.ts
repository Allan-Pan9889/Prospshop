import { and, desc, eq, isNull, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";

function generateOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `PS-${date}-${rand}`;
}

export async function createOrder(data: {
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  city?: string;
  state?: string;
  pinCode?: string;
  items: {
    slug: string;
    title: string;
    image: string;
    price: number;
    quantity: number;
  }[];
}) {
  const db = getDb();
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber: generateOrderNumber(),
      userId: data.userId ?? null,
      status: "pending",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone ?? null,
      shippingAddress: data.shippingAddress,
      city: data.city ?? null,
      state: data.state ?? null,
      pinCode: data.pinCode ?? null,
      subtotal: String(subtotal),
      total: String(subtotal),
    })
    .returning();

  await db.insert(orderItems).values(
    data.items.map((item) => ({
      orderId: order.id,
      productSlug: item.slug,
      productTitle: item.title,
      productImage: item.image,
      price: String(item.price),
      quantity: item.quantity,
    }))
  );

  return order;
}

export async function getOrdersForUser(userId: string, email: string) {
  const db = getDb();
  const normalizedEmail = email.toLowerCase();

  return db
    .select()
    .from(orders)
    .where(
      or(
        eq(orders.userId, userId),
        and(
          isNull(orders.userId),
          sql`lower(${orders.customerEmail}) = ${normalizedEmail}`
        )
      )
    )
    .orderBy(desc(orders.createdAt));
}

export async function getOrderForUser(id: string, userId: string, email: string) {
  const order = await getOrderById(id);
  if (!order) return null;

  const normalizedEmail = email.toLowerCase();
  const ownsOrder =
    order.userId === userId ||
    (!order.userId && order.customerEmail.toLowerCase() === normalizedEmail);

  return ownsOrder ? order : null;
}

export async function getAllOrders() {
  const db = getDb();
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: string) {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  return { ...order, items };
}

export async function updateOrderStatus(id: string, status: string) {
  const db = getDb();
  const [order] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  return order ?? null;
}

export async function getOrderStats() {
  const db = getDb();
  const allOrders = await db.select().from(orders);
  const totalRevenue = allOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return {
    totalOrders: allOrders.length,
    pendingOrders: allOrders.filter((o) => o.status === "pending").length,
    totalRevenue,
  };
}
