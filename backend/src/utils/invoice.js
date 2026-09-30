import PDFDocument from "pdfkit";

// =============================================================
// INVOICE NUMBER
// =============================================================

const generateInvoiceNumber = (appointment) => {
  const datePart = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const idPart = appointment?._id
    ? appointment._id.toString().slice(-6).toUpperCase()
    : Math.random().toString(36).substring(2, 8).toUpperCase();

  return `INV-${datePart}-${idPart}`;
};

// =============================================================
// BUILD INVOICE PDF
// =============================================================

const buildInvoicePdf = ({
  appointment,
  user,
  workshop,
  services = [],
}) => {
  return new Promise((resolve, reject) => {
    // =========================================================
    // GENERATE INVOICE NUMBER
    // =========================================================

    const invoiceNumber =
      appointment?.invoiceNumber ||
      generateInvoiceNumber(appointment);

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
    });

    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // =========================================================
    // COLORS
    // =========================================================

    const COLORS = {
      black: "#18181b",
      text: "#27272a",
      muted: "#71717a",
      lightText: "#a1a1aa",
      white: "#ffffff",
      light: "#fafafa",
      border: "#e4e4e7",

      // Existing yellow combination
      yellow: "#facc15",
      yellowDark: "#a16207",
      yellowLight: "#fef9c3",

      // Existing green combination
      green: "#15803d",
      greenBg: "#dcfce7",
    };

    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;

    const LEFT = 45;
    const RIGHT = 550;
    const CONTENT_WIDTH = RIGHT - LEFT;

    // =========================================================
    // HELPERS
    // =========================================================

    const money = (value) =>
      `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

    const safe = (value, fallback = "-") =>
      value !== undefined && value !== null && value !== ""
        ? String(value)
        : fallback;

    const formatDate = (date) => {
      if (!date) return "-";

      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const formatDateTime = (date) => {
      if (!date) return "-";

      return new Date(date).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const roundedRect = (
      x,
      y,
      width,
      height,
      radius,
      fill,
      stroke = null,
    ) => {
      doc.roundedRect(x, y, width, height, radius);

      if (fill && stroke) {
        doc.fillAndStroke(fill, stroke);
      } else if (fill) {
        doc.fill(fill);
      } else if (stroke) {
        doc.stroke(stroke);
      }
    };

    const drawLabel = (text, x, y, width = 150) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor(COLORS.muted)
        .text(text.toUpperCase(), x, y, {
          width,
          characterSpacing: 0.7,
        });
    };

    const drawCard = (x, y, width, height) => {
      roundedRect(
        x,
        y,
        width,
        height,
        10,
        COLORS.white,
        COLORS.border,
      );
    };

    const drawDivider = (x1, y, x2) => {
      doc
        .strokeColor(COLORS.border)
        .lineWidth(0.6)
        .moveTo(x1, y)
        .lineTo(x2, y)
        .stroke();
    };

    // =========================================================
    // PAGE BACKGROUND
    // =========================================================

    doc
      .rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
      .fill(COLORS.white);

    // =========================================================
    // TOP ACCENT
    // =========================================================

    doc
      .rect(0, 0, PAGE_WIDTH, 5)
      .fill(COLORS.yellow);

    // =========================================================
    // HEADER
    // =========================================================

    // Logo
    roundedRect(
      LEFT,
      32,
      52,
      52,
      13,
      COLORS.yellow,
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(19)
      .fillColor(COLORS.black)
      .text("CD", LEFT, 49, {
        width: 52,
        align: "center",
      });

    // Brand
    doc
      .font("Helvetica-Bold")
      .fontSize(23)
      .fillColor(COLORS.black)
      .text("Car", LEFT + 66, 33, {
        continued: true,
      })
      .fillColor(COLORS.yellowDark)
      .text("Detailing");

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(
        "PREMIUM AUTO CARE & DETAILING",
        LEFT + 66,
        62,
        {
          characterSpacing: 0.7,
        },
      );

    // Invoice title
    doc
      .font("Helvetica-Bold")
      .fontSize(27)
      .fillColor(COLORS.black)
      .text("INVOICE", 380, 34, {
        width: 170,
        align: "right",
      });

    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(COLORS.muted)
      .text(
        "OFFICIAL SERVICE DOCUMENT",
        380,
        68,
        {
          width: 170,
          align: "right",
          characterSpacing: 0.8,
        },
      );

    doc
      .rect(475, 88, 75, 3)
      .fill(COLORS.yellow);

    // =========================================================
    // INVOICE INFORMATION
    // =========================================================

    let y = 118;

    roundedRect(
      LEFT,
      y,
      CONTENT_WIDTH,
      66,
      10,
      COLORS.light,
      COLORS.border,
    );

    // Invoice Number
    drawLabel(
      "Invoice Number",
      LEFT + 16,
      y + 13,
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(COLORS.black)
      .text(
        invoiceNumber,
        LEFT + 16,
        y + 30,
        {
          width: 145,
        },
      );

    // Invoice Date
    drawLabel(
      "Invoice Date",
      220,
      y + 13,
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(COLORS.black)
      .text(
        formatDateTime(new Date()),
        220,
        y + 30,
        {
          width: 135,
        },
      );

    // Appointment Date
    drawLabel(
      "Appointment Date",
      390,
      y + 13,
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(COLORS.black)
      .text(
        formatDate(appointment.appointmentDate),
        390,
        y + 30,
        {
          width: 140,
        },
      );

    // =========================================================
    // APPOINTMENT SLOT
    // =========================================================

    y = 202;

    roundedRect(
      LEFT,
      y,
      CONTENT_WIDTH,
      58,
      10,
      COLORS.yellowLight,
      "#fde68a",
    );

    // Yellow indicator
    doc
      .rect(LEFT, y, 4, 58)
      .fill(COLORS.yellow);

    drawLabel(
      "Appointment Time Slot",
      LEFT + 18,
      y + 12,
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(COLORS.black)
      .text(
        safe(appointment.timeSlot),
        LEFT + 18,
        y + 29,
        {
          width: CONTENT_WIDTH - 36,
        },
      );

    // =========================================================
    // CUSTOMER + WORKSHOP
    // =========================================================

    y = 282;

    const cardGap = 18;
    const cardWidth = (CONTENT_WIDTH - cardGap) / 2;
    const cardHeight = 125;

    // ---------------------------------------------------------
    // CUSTOMER CARD
    // ---------------------------------------------------------

    drawCard(
      LEFT,
      y,
      cardWidth,
      cardHeight,
    );

    doc
      .rect(LEFT, y, 4, cardHeight)
      .fill(COLORS.yellow);

    drawLabel(
      "Billed To",
      LEFT + 18,
      y + 15,
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor(COLORS.black)
      .text(
        `${safe(user.firstName, "")} ${safe(
          user.lastName,
          "",
        )}`.trim() || "Customer",
        LEFT + 18,
        y + 33,
        {
          width: cardWidth - 35,
        },
      );

    drawDivider(
      LEFT + 18,
      y + 57,
      LEFT + cardWidth - 18,
    );

    drawLabel(
      "Email",
      LEFT + 18,
      y + 67,
      60,
    );

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(COLORS.text)
      .text(
        safe(user.email),
        LEFT + 65,
        y + 66,
        {
          width: cardWidth - 83,
        },
      );

    drawLabel(
      "Phone",
      LEFT + 18,
      y + 87,
      60,
    );

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(COLORS.text)
      .text(
        safe(user.phone),
        LEFT + 65,
        y + 86,
        {
          width: cardWidth - 83,
        },
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(7)
      .fillColor(COLORS.yellowDark)
      .text(
        "CUSTOMER",
        LEFT + 18,
        y + 105,
        {
          characterSpacing: 1,
        },
      );

    // ---------------------------------------------------------
    // WORKSHOP CARD
    // ---------------------------------------------------------

    const workshopX = LEFT + cardWidth + cardGap;

    drawCard(
      workshopX,
      y,
      cardWidth,
      cardHeight,
    );

    doc
      .rect(workshopX, y, 4, cardHeight)
      .fill(COLORS.yellow);

    drawLabel(
      "Serviced At",
      workshopX + 18,
      y + 15,
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor(COLORS.black)
      .text(
        safe(workshop.name, "Workshop"),
        workshopX + 18,
        y + 33,
        {
          width: cardWidth - 35,
        },
      );

    drawDivider(
      workshopX + 18,
      y + 57,
      workshopX + cardWidth - 18,
    );

    drawLabel(
      "Location",
      workshopX + 18,
      y + 67,
      60,
    );

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(COLORS.text)
      .text(
        safe(workshop.location),
        workshopX + 75,
        y + 66,
        {
          width: cardWidth - 93,
          height: 28,
        },
      );

    // Verified badge
    roundedRect(
      workshopX + 18,
      y + 96,
      83,
      20,
      10,
      COLORS.greenBg,
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(7)
      .fillColor(COLORS.green)
      .text(
        "VERIFIED",
        workshopX + 18,
        y + 103,
        {
          width: 83,
          align: "center",
        },
      );

    // =========================================================
    // VEHICLE INFORMATION
    // =========================================================

    y = 432;

    drawCard(
      LEFT,
      y,
      CONTENT_WIDTH,
      82,
    );

    doc
      .rect(LEFT, y, 4, 82)
      .fill(COLORS.yellow);

    drawLabel(
      "Vehicle Details",
      LEFT + 18,
      y + 13,
    );

    // Vehicle
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(COLORS.black)
      .text(
        `${safe(appointment.vehicle?.make)} ${safe(
          appointment.vehicle?.model,
        )}`,
        LEFT + 18,
        y + 31,
        {
          width: 220,
        },
      );

    // Model year
    drawLabel(
      "Model Year",
      LEFT + 18,
      y + 53,
      80,
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(COLORS.text)
      .text(
        safe(appointment.vehicle?.year),
        LEFT + 90,
        y + 52,
      );

    // Registration number
    drawLabel(
      "Registration Number",
      390,
      y + 13,
    );

    roundedRect(
      390,
      y + 31,
      115,
      30,
      7,
      COLORS.yellowLight,
      "#fde68a",
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(COLORS.black)
      .text(
        safe(appointment.vehicle?.regNumber),
        397,
        y + 40,
        {
          width: 101,
          align: "center",
        },
      );

    // =========================================================
    // SERVICES
    // =========================================================

    y = 542;

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor(COLORS.black)
      .text(
        "Services Provided",
        LEFT,
        y,
      );

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(
        "Professional automotive services performed on your vehicle",
        LEFT,
        y + 22,
      );

    doc
      .rect(LEFT, y + 40, 48, 3)
      .fill(COLORS.yellow);

    // ---------------------------------------------------------
    // SERVICE TABLE
    // ---------------------------------------------------------

    y += 54;

    roundedRect(
      LEFT,
      y,
      CONTENT_WIDTH,
      32,
      7,
      COLORS.light,
      COLORS.border,
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(COLORS.black)
      .text(
        "SERVICE",
        LEFT + 14,
        y + 11,
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(COLORS.black)
      .text(
        "CATEGORY",
        335,
        y + 11,
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(COLORS.black)
      .text(
        "PRICE",
        445,
        y + 11,
        {
          width: 85,
          align: "right",
        },
      );

    y += 32;

    // ---------------------------------------------------------
    // SERVICE ROWS
    // ---------------------------------------------------------

    services.forEach((service, index) => {
      const rowHeight = 37;

      if (index % 2 === 0) {
        doc
          .rect(
            LEFT,
            y,
            CONTENT_WIDTH,
            rowHeight,
          )
          .fill("#fdfdfd");
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(COLORS.black)
        .text(
          safe(service.name),
          LEFT + 14,
          y + 12,
          {
            width: 260,
          },
        );

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(
          safe(service.category),
          335,
          y + 12,
          {
            width: 95,
          },
        );

      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(COLORS.black)
        .text(
          money(service.startingPrice),
          445,
          y + 12,
          {
            width: 85,
            align: "right",
          },
        );

      drawDivider(
        LEFT,
        y + rowHeight,
        RIGHT,
      );

      y += rowHeight;
    });

    if (services.length === 0) {
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.muted)
        .text(
          "No service details available",
          LEFT + 14,
          y + 13,
        );

      drawDivider(
        LEFT,
        y + 37,
        RIGHT,
      );

      y += 37;
    }

    // =========================================================
    // TOTALS + PAYMENT STATUS
    // =========================================================

    y += 18;

    const totalBoxX = 310;
    const totalBoxWidth = 240;
    const totalBoxHeight = 142;

    roundedRect(
      totalBoxX,
      y,
      totalBoxWidth,
      totalBoxHeight,
      12,
      COLORS.white,
      COLORS.border,
    );

    // Yellow left accent
    doc
      .rect(
        totalBoxX,
        y,
        4,
        totalBoxHeight,
      )
      .fill(COLORS.yellow);

    // Estimated cost
    drawLabel(
      "Estimated Cost",
      totalBoxX + 18,
      y + 15,
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(
        money(appointment.estimatedCost),
        totalBoxX + 18,
        y + 29,
        {
          width: totalBoxWidth - 36,
          align: "right",
        },
      );

    drawDivider(
      totalBoxX + 18,
      y + 49,
      totalBoxX + totalBoxWidth - 18,
    );

    // Final amount
    drawLabel(
      "Final Amount",
      totalBoxX + 18,
      y + 61,
    );

    const finalCost =
      appointment.finalCost != null
        ? appointment.finalCost
        : appointment.estimatedCost || 0;

    doc
      .font("Helvetica-Bold")
      .fontSize(17)
      .fillColor(COLORS.yellowDark)
      .text(
        money(finalCost),
        totalBoxX + 18,
        y + 76,
        {
          width: totalBoxWidth - 36,
          align: "right",
        },
      );

    // Paid badge
    roundedRect(
      totalBoxX + 18,
      y + 108,
      70,
      23,
      11,
      COLORS.greenBg,
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(COLORS.green)
      .text(
        "PAID",
        totalBoxX + 18,
        y + 115,
        {
          width: 70,
          align: "center",
        },
      );

    // =========================================================
    // SERVICE COMPLETED CARD
    // =========================================================

    const statusY = y + 25;

    roundedRect(
      LEFT,
      statusY,
      245,
      68,
      10,
      COLORS.white,
      COLORS.border,
    );

    doc
      .rect(LEFT, statusY, 4, 68)
      .fill(COLORS.yellow);

    drawLabel(
      "Status",
      LEFT + 18,
      statusY + 13,
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(COLORS.black)
      .text(
        "SERVICE COMPLETED",
        LEFT + 18,
        statusY + 29,
      );

    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(COLORS.muted)
      .text(
        "Thank you for trusting Car Detailing.",
        LEFT + 18,
        statusY + 47,
      );

    // =========================================================
    // FOOTER
    // =========================================================

    const footerY = PAGE_HEIGHT - 65;

    doc
      .strokeColor(COLORS.border)
      .lineWidth(0.7)
      .moveTo(LEFT, footerY)
      .lineTo(RIGHT, footerY)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(COLORS.black)
      .text(
        "Car Detailing",
        LEFT,
        footerY + 15,
      );

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(COLORS.muted)
      .text(
        "Premium Auto Care & Detailing",
        LEFT,
        footerY + 29,
      );

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(COLORS.muted)
      .text(
        "• No signature required",
        300,
        footerY + 22,
        {
          width: 250,
          align: "right",
        },
      );

    // Bottom yellow accent
    doc
      .rect(
        0,
        PAGE_HEIGHT - 4,
        PAGE_WIDTH,
        4,
      )
      .fill(COLORS.yellow);

    // =========================================================
    // FINISH PDF
    // =========================================================

    doc.end();
  });
};

// =============================================================
// EXPORT
// =============================================================

export {
  buildInvoicePdf,
  generateInvoiceNumber,
};