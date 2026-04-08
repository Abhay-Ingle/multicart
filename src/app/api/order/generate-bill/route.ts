import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import PDFDocument from "pdfkit";

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { message: "orderId is required" },
        { status: 400 }
      );
    }

    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDb();
    const order = await Order.findById(orderId)
      .populate("buyer")
      .populate("products.product");

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Check if user is the buyer
    if (order.buyer._id.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized - Not your order" },
        { status: 403 }
      );
    }

    // Create PDF
    const pdfDoc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    // Set response headers
    const responseHeaders = {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bill-${orderId}.pdf"`,
    };

    // Pipe to response
    const chunks: Buffer[] = [];
    pdfDoc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    pdfDoc.on("end", () => {});

    // Header
    pdfDoc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("BILL INVOICE", { align: "center" });

    pdfDoc.moveDown(0.5);
    pdfDoc.fontSize(10).text(`Order ID: ${orderId}`, { align: "center" });
    pdfDoc.fontSize(10).text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, {
      align: "center",
    });

    pdfDoc.moveDown(1);

    // Customer Info
    pdfDoc.fontSize(12).font("Helvetica-Bold").text("Delivery Address:");
    pdfDoc.fontSize(10).font("Helvetica");
    pdfDoc.text(`Name: ${order.address.name}`);
    pdfDoc.text(`Phone: ${order.address.phone}`);
    pdfDoc.text(`Address: ${order.address.address}`);
    pdfDoc.text(`City: ${order.address.city}`);
    pdfDoc.text(`Pincode: ${order.address.pincode}`);

    pdfDoc.moveDown(1);

    // Items Table
    pdfDoc.fontSize(12).font("Helvetica-Bold").text("Order Items:");
    pdfDoc.moveDown(0.3);

    // Table headers
    const tableTop = pdfDoc.y;
    const col1 = 50;
    const col2 = 250;
    const col3 = 350;
    const col4 = 450;

    pdfDoc.fontSize(10).font("Helvetica-Bold");
    pdfDoc.text("Item", col1, tableTop);
    pdfDoc.text("Qty", col2, tableTop);
    pdfDoc.text("Price", col3, tableTop);
    pdfDoc.text("Total", col4, tableTop);

    pdfDoc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    pdfDoc.moveDown(0.8);

    // Table rows
    pdfDoc.font("Helvetica");
    let itemTotal = 0;

    (order.products as any[]).forEach((item: any) => {
      const yPosition = pdfDoc.y;
      const itemName = item.product.title.substring(0, 30);
      const itemPrice = item.price;
      const quantity = item.quantity;
      const rowTotal = itemPrice * quantity;
      itemTotal += rowTotal;

      pdfDoc.text(itemName, col1, yPosition);
      pdfDoc.text(quantity.toString(), col2, yPosition);
      pdfDoc.text(`₹${itemPrice.toFixed(2)}`, col3, yPosition);
      pdfDoc.text(`₹${rowTotal.toFixed(2)}`, col4, yPosition);
      pdfDoc.moveDown(0.6);
    });

    pdfDoc.moveTo(50, pdfDoc.y).lineTo(550, pdfDoc.y).stroke();
    pdfDoc.moveDown(0.5);

    // Summary
    pdfDoc.fontSize(10).font("Helvetica");
    const col3Label = 300;
    const col3Value = 450;

    pdfDoc.text("Subtotal:", col3Label, pdfDoc.y);
    pdfDoc.text(`₹${order.productsTotal.toFixed(2)}`, col3Value, pdfDoc.y);
    pdfDoc.moveDown(0.4);

    pdfDoc.text("Delivery Charge:", col3Label, pdfDoc.y);
    pdfDoc.text(`₹${order.deliveryCharge.toFixed(2)}`, col3Value, pdfDoc.y);
    pdfDoc.moveDown(0.4);

    pdfDoc.text("Service Charge:", col3Label, pdfDoc.y);
    pdfDoc.text(`₹${order.serviceCharge.toFixed(2)}`, col3Value, pdfDoc.y);
    pdfDoc.moveDown(0.4);

    pdfDoc.fontSize(12).font("Helvetica-Bold");
    pdfDoc.text("Total Amount:", col3Label, pdfDoc.y);
    pdfDoc.text(`₹${order.totalAmount.toFixed(2)}`, col3Value, pdfDoc.y);

    pdfDoc.moveDown(1.5);

    // Footer
    pdfDoc.fontSize(9).font("Helvetica").text(
      "Thank you for your purchase!",
      { align: "center" }
    );
    pdfDoc.text("Payment Status: " + (order.isPaid ? "✓ PAID" : "PENDING"), {
      align: "center",
    });

    // Finalize PDF
    pdfDoc.end();

    // Create response with PDF buffer
    return new Promise((resolve) => {
      pdfDoc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(
          new NextResponse(pdfBuffer, {
            status: 200,
            headers: responseHeaders as any,
          })
        );
      });
    });
  } catch (error: any) {
    console.error("❌ BILL GENERATION ERROR:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
