import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    const orderId = req.nextUrl.searchParams.get("order_id");

    if (!sessionId || !orderId) {
      return NextResponse.json(
        { message: "Missing sessionId or orderId" },
        { status: 400 }
      );
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 }
      );
    }

    // Connect to DB and update order
    await connectDb();
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        isPaid: session.payment_status === "paid",
        orderStatus: session.payment_status === "paid" ? "confirmed" : "pending",
        "paymentDetails.stripePaymentId": session.payment_intent,
        "paymentDetails.stripeSessionId": sessionId,
      },
      { new: true }
    ).populate("products.product");

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: session.payment_status === "paid",
        order,
        paymentStatus: session.payment_status,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ VERIFY SESSION ERROR:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
