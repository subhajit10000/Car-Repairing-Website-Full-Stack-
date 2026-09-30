import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import env from "./env.js";
let transporter = null;

// Lazily created so a missing SMTP config doesn't crash server boot —
// it only throws when an email actually needs to be sent.
const getTransporter = () => {
    if (transporter) return transporter;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        throw new Error(
            "Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS in .env"
        );
    }

    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT) === 465, // true for port 465, false for 587/25
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    return transporter;
};


const otpEmailTemplate = ({ name, otp, expiryMinutes, appUrl = env.CLIENT_URL }) => `
<div style="margin:0; padding:0; background-color:#0b0f14; font-family:'Segoe UI',Roboto,Arial,sans-serif;">

<!--[if mso]>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0">
<tr><td>
<![endif]-->

<table
  role="presentation"
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="background-color:#0b0f14;"
>
  <tr>
    <td align="center" style="padding:45px 14px;">

      <!-- Main Card -->
      <table
        role="presentation"
        width="560"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
          width:560px;
          max-width:560px;
          background-color:#11161d;
          border:1px solid #252c35;
          border-radius:24px;
          overflow:hidden;
          box-shadow:0 15px 45px rgba(0,0,0,0.45);
        "
      >

        <!-- ================= HEADER ================= -->
        <tr>
          <td
            align="center"
            style="
              padding:42px 28px 38px;
              background-color:#171d25;
              background-image:linear-gradient(
                135deg,
                #0b0f14 0%,
                #151b23 35%,
                #202832 65%,
                #11161d 100%
              );
              border-bottom:1px solid #2a323d;
            "
          >

            <!-- Car Icon -->
            <table
              role="presentation"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="margin-bottom:20px;"
            >
              <tr>
                <td
                  width="70"
                  height="70"
                  align="center"
                  valign="middle"
                  style="
                    width:70px;
                    height:70px;
                    background-color:#1d252f;
                    border:1px solid #394451;
                    border-radius:50%;
                    color:#f59e0b;
                    font-size:32px;
                  "
                >
                  &#128663;
                </td>
              </tr>
            </table>

            <!-- Brand -->
            <h1
              style="
                margin:0;
                color:#ffffff;
                font-size:30px;
                line-height:1.2;
                font-weight:800;
                letter-spacing:-0.8px;
              "
            >
              Car<span style="color:#f59e0b;">Detailing</span>
            </h1>

            <p
              style="
                margin:9px 0 0;
                color:#9ca6b2;
                font-size:12px;
                line-height:1.5;
                letter-spacing:1.8px;
                text-transform:uppercase;
              "
            >
              Premium Auto Care &amp; Detailing
            </p>

            <!-- Verification Badge -->
            <table
              role="presentation"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="margin-top:22px;"
            >
              <tr>
                <td
                  style="
                    background-color:#302611;
                    border:1px solid #5a4515;
                    border-radius:999px;
                    padding:7px 17px;
                    color:#fbbf24;
                    font-size:10px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                  "
                >
                  &#10003;&nbsp; Secure Email Verification
                </td>
              </tr>
            </table>

          </td>
        </tr>


        <!-- ================= BODY ================= -->
        <tr>
          <td style="padding:38px 32px 34px;">

            <!-- Welcome -->
            <h2
              style="
                margin:0 0 10px;
                text-align:center;
                color:#ffffff;
                font-size:25px;
                line-height:1.3;
                font-weight:750;
                letter-spacing:-0.4px;
              "
            >
              Verify Your Email
            </h2>

            <p
              style="
                margin:0 auto 28px;
                max-width:430px;
                text-align:center;
                color:#9ca6b2;
                font-size:14px;
                line-height:1.7;
              "
            >
              Hello
              <strong style="color:#fbbf24;">
                ${name || "there"}
              </strong>,
              <br>
              use the verification code below to securely confirm your
              email address and continue with your Car Detailing account.
            </p>


            <!-- ================= OTP BOX ================= -->
            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                background-color:#171d25;
                border:1px solid #303944;
                border-radius:18px;
              "
            >
              <tr>
                <td
                  align="center"
                  style="padding:28px 18px 25px;"
                >

                  <p
                    style="
                      margin:0 0 14px;
                      color:#7f8a97;
                      font-size:10px;
                      font-weight:700;
                      letter-spacing:2px;
                      text-transform:uppercase;
                    "
                  >
                    Your Verification Code
                  </p>


                  <!-- OTP -->
                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="margin:auto;"
                  >
                    <tr>
                      <td
                        style="
                          background-color:#0d1218;
                          border:1px solid #3b4652;
                          border-radius:14px;
                          padding:17px 25px;
                        "
                      >
                        <span
                          style="
                            color:#fbbf24;
                            font-size:34px;
                            line-height:1;
                            font-weight:800;
                            letter-spacing:9px;
                          "
                        >
                          ${otp}
                        </span>
                      </td>
                    </tr>
                  </table>


                  <!-- Progress Bar -->
                  <table
                    role="presentation"
                    width="240"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="margin:22px auto 0;"
                  >
                    <tr>
                      <td
                        style="
                          background-color:#2b333d;
                          border-radius:999px;
                          height:5px;
                          font-size:0;
                          line-height:0;
                        "
                      >
                        <table
                          role="presentation"
                          width="75%"
                          cellpadding="0"
                          cellspacing="0"
                          border="0"
                        >
                          <tr>
                            <td
                              style="
                                background-color:#f59e0b;
                                border-radius:999px;
                                height:5px;
                                font-size:0;
                                line-height:0;
                              "
                            >
                              &nbsp;
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>


                  <!-- Expiry -->
                  <p
                    style="
                      margin:13px 0 0;
                      color:#7f8a97;
                      font-size:12px;
                    "
                  >
                    This verification code expires in
                    <strong style="color:#fbbf24;">
                      ${expiryMinutes} minutes
                    </strong>
                  </p>

                </td>
              </tr>
            </table>


            <!-- Hint -->
            <p
              style="
                margin:12px 0 0;
                text-align:center;
                color:#68737f;
                font-size:10px;
                line-height:1.5;
              "
            >
              For your security, this code can only be used once.
            </p>


            <!-- ================= SECURITY ================= -->
            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                margin-top:25px;
                background-color:#151b22;
                border:1px solid #29313a;
                border-radius:14px;
              "
            >
              <tr>
                <td style="padding:16px;">

                  <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                  >
                    <tr>

                      <!-- Lock Icon -->
                      <td
                        width="40"
                        valign="top"
                      >
                        <table
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          border="0"
                        >
                          <tr>
                            <td
                              width="30"
                              height="30"
                              align="center"
                              valign="middle"
                              style="
                                width:30px;
                                height:30px;
                                background-color:#302611;
                                border:1px solid #574313;
                                border-radius:8px;
                                color:#fbbf24;
                                font-size:14px;
                              "
                            >
                              &#128274;
                            </td>
                          </tr>
                        </table>
                      </td>


                      <!-- Security Text -->
                      <td style="padding-left:10px;">

                        <p
                          style="
                            margin:0 0 4px;
                            color:#e5e7eb;
                            font-size:12px;
                            font-weight:700;
                          "
                        >
                          Your security matters
                        </p>

                        <p
                          style="
                            margin:0;
                            color:#7f8a97;
                            font-size:11px;
                            line-height:1.55;
                          "
                        >
                          Never share this verification code with anyone.
                          Our team will never ask you for your OTP.
                        </p>

                      </td>

                    </tr>
                  </table>

                </td>
              </tr>
            </table>


            <!-- ================= CTA ================= -->
            <table
              role="presentation"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="margin:25px auto 0;"
            >
              <tr>
                <td
                  align="center"
                  style="
                    background-color:#f59e0b;
                    border-radius:10px;
                  "
                >
                  <a
                    href="${appUrl}"
                    target="_blank"
                    style="
                      display:inline-block;
                      padding:13px 28px;
                      color:#111111;
                      font-size:13px;
                      font-weight:800;
                      letter-spacing:0.3px;
                      text-decoration:none;
                    "
                  >
                    Open Car Detailing
                    &nbsp; &#8594;
                  </a>
                </td>
              </tr>
            </table>


            <!-- Didn't request -->
            <p
              style="
                margin:24px 0 0;
                text-align:center;
                color:#68737f;
                font-size:10px;
                line-height:1.7;
              "
            >
              Didn't request this verification email?
              <br>
              You can safely ignore this message.
            </p>

          </td>
        </tr>


        <!-- ================= SERVICES STRIP ================= -->
        <tr>
          <td
            style="
              padding:20px 25px;
              background-color:#0e1319;
              border-top:1px solid #252d36;
              border-bottom:1px solid #252d36;
            "
          >

            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
            >
              <tr>

                <td
                  align="center"
                  width="33%"
                  style="color:#89939e; font-size:10px;"
                >
                  &#10003;
                  <br>
                  <span style="color:#d1d5db;">
                    Professional Care
                  </span>
                </td>

                <td
                  align="center"
                  width="34%"
                  style="color:#89939e; font-size:10px;"
                >
                  &#10003;
                  <br>
                  <span style="color:#d1d5db;">
                    Trusted Service
                  </span>
                </td>

                <td
                  align="center"
                  width="33%"
                  style="color:#89939e; font-size:10px;"
                >
                  &#10003;
                  <br>
                  <span style="color:#d1d5db;">
                    Quality Guaranteed
                  </span>
                </td>

              </tr>
            </table>

          </td>
        </tr>


        <!-- ================= FOOTER ================= -->
        <tr>
          <td
            align="center"
            style="
              padding:26px 28px;
              background-color:#0b0f14;
            "
          >

            <p
              style="
                margin:0 0 7px;
                color:#fbbf24;
                font-size:13px;
                font-weight:800;
                letter-spacing:0.3px;
              "
            >
              Car<span style="color:#ffffff;">Detailing</span>
            </p>

            <p
              style="
                margin:0;
                color:#66717d;
                font-size:10px;
                line-height:1.6;
              "
            >
              Premium care for every journey.
            </p>

            <p style="margin:13px 0 0;">

              <span
                style="
                  color:#69737e;
                  font-size:10px;
                  margin:0 6px;
                "
              >
                Support
              </span>

              <span style="color:#353d46;">
                &bull;
              </span>

              <span
                style="
                  color:#69737e;
                  font-size:10px;
                  margin:0 6px;
                "
              >
                Privacy
              </span>

              <span style="color:#353d46;">
                &bull;
              </span>

              <span
                style="
                  color:#69737e;
                  font-size:10px;
                  margin:0 6px;
                "
              >
                Contact
              </span>

            </p>

            <p
              style="
                margin:12px 0 0;
                color:#4e5863;
                font-size:9px;
              "
            >
              &copy; ${new Date().getFullYear()} Car Detailing.
              All rights reserved.
            </p>

          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

<!--[if mso]>
</td></tr>
</table>
</td>
</tr>
</table>
<![endif]-->

</div>
`;



const sendOtpEmail = async ({ to, name, otp, expiryMinutes, appUrl }) => {
    const mailer = getTransporter();
    await mailer.sendMail({
        from: `"Car Detailing" <${process.env.SMTP_USER}>`|| process.env.EMAIL_FROM,
        to,
        subject: "Your Car Detailing verification code",
        html: otpEmailTemplate({ name, otp, expiryMinutes, appUrl }),
        text: `Your Car Detailing verification code is ${otp}. It expires in ${expiryMinutes} minutes.`,
    });
};

// =========================================================
// SHARED SIMPLE TEMPLATE (booking / status / invoice emails)
// =========================================================
// Reuses the same dark/amber "Car Detailing" branding as otpEmailTemplate
// above, but as a lighter single-card layout so we're not duplicating a
// 400-line table for every transactional email.
const simpleEmailTemplate = ({
  heading,
  greetingName,
  bodyLines = [],
  highlight,
  rows = [],
  footerNote,
  appUrl = env.CLIENT_URL,
}) => `
<div style="margin:0; padding:0; background-color:#0b0f14; font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0b0f14;">
    <tr>
      <td align="center" style="padding:40px 14px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px; max-width:560px; background-color:#11161d; border:1px solid #252c35; border-radius:20px; overflow:hidden;">

          <tr>
            <td align="center" style="padding:30px 28px; background-color:#171d25; border-bottom:1px solid #2a323d;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800; letter-spacing:-0.6px;">
                Car<span style="color:#f59e0b;">Detailing</span>
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 30px;">
              <h2 style="margin:0 0 14px; color:#ffffff; font-size:21px; font-weight:700;">${heading}</h2>

              <p style="margin:0 0 16px; color:#9ca6b2; font-size:14px; line-height:1.7;">
                Hi <strong style="color:#fbbf24;">${greetingName || "there"}</strong>,
              </p>

              ${bodyLines
                .map(
                  (line) =>
                    `<p style="margin:0 0 12px; color:#c6ccd3; font-size:14px; line-height:1.7;">${line}</p>`,
                )
                .join("")}

              ${
                highlight
                  ? `<div style="margin:20px 0; padding:16px 18px; background-color:#171d25; border:1px solid #303944; border-radius:14px; text-align:center;">
                       <span style="color:#fbbf24; font-size:20px; font-weight:800;">${highlight}</span>
                     </div>`
                  : ""
              }

              ${
                rows.length
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px; background-color:#171d25; border:1px solid #303944; border-radius:14px;">
                      ${rows
                        .map(
                          ([label, value]) => `
                        <tr>
                          <td style="padding:11px 16px; color:#7f8a97; font-size:12px; border-bottom:1px solid #232b33;">${label}</td>
                          <td style="padding:11px 16px; color:#e5e7eb; font-size:13px; font-weight:600; text-align:right; border-bottom:1px solid #232b33;">${value}</td>
                        </tr>`,
                        )
                        .join("")}
                    </table>`
                  : ""
              }

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px auto 0;">
                <tr>
                  <td align="center" style="background-color:#f59e0b; border-radius:10px;">
                    <a href="${appUrl || "#"}" target="_blank" style="display:inline-block; padding:12px 26px; color:#111111; font-size:13px; font-weight:800; text-decoration:none;">
                      View in Car Detailing &nbsp;&#8594;
                    </a>
                  </td>
                </tr>
              </table>

              ${
                footerNote
                  ? `<p style="margin:22px 0 0; text-align:center; color:#68737f; font-size:11px; line-height:1.6;">${footerNote}</p>`
                  : ""
              }
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:20px 28px; background-color:#0b0f14;">
              <p style="margin:0; color:#4e5863; font-size:9px;">&copy; ${new Date().getFullYear()} Car Detailing. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>
`;

const sendMailSafely = async ({ to, subject, html, text }) => {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: `"Car Detailing" <${process.env.SMTP_USER}>` || process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });
};

// Feature 1: sent right after a successful booking, and again on every
// repair-progress update. `event` is "booked" | "progress" | "invoice".
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const sendAppointmentConfirmationEmail = async ({
  to,
  name,
  appointment,
  workshopName,
  serviceNames = [],
}) => {
  await sendMailSafely({
    to,
    subject: "Your appointment is confirmed — Car Detailing",
    html: simpleEmailTemplate({
      heading: "Appointment Booked!",
      greetingName: name,
      bodyLines: [
        `Your appointment at <strong style="color:#fbbf24;">${workshopName}</strong> has been booked successfully. Here are the details:`,
      ],
      rows: [
        ["Date", formatDate(appointment.appointmentDate)],
        ["Time Slot", appointment.timeSlot],
        ["Vehicle", `${appointment.vehicle.make} ${appointment.vehicle.model} (${appointment.vehicle.regNumber})`],
        ["Services", serviceNames.join(", ") || "—"],
        ["Estimated Cost", appointment.estimatedCost != null ? `₹${appointment.estimatedCost}` : "To be confirmed"],
        ["Status", appointment.status],
      ],
      footerNote: "We'll email you again the moment the workshop updates your repair's progress.",
    }),
    text: `Your appointment at ${workshopName} on ${formatDate(appointment.appointmentDate)} (${appointment.timeSlot}) is booked. Estimated cost: ₹${appointment.estimatedCost ?? "TBD"}.`,
  });
};

// Feature 1 (continued): sent on every repair-progress / status update.
const sendAppointmentStatusEmail = async ({
  to,
  name,
  appointment,
  workshopName,
  newStatus,
  note,
}) => {
  const statusCopy = {
    CONFIRMED: "Your appointment has been confirmed by the workshop.",
    IN_PROGRESS: "Work has started on your vehicle.",
    COMPLETED: "Your repair/service is complete and your vehicle is ready.",
    CANCELLED: "Your appointment has been cancelled.",
  };

  await sendMailSafely({
    to,
    subject: `Update on your repair — now ${newStatus.replace("_", " ")}`,
    html: simpleEmailTemplate({
      heading: "Repair Progress Update",
      greetingName: name,
      bodyLines: [
        statusCopy[newStatus] || `Your appointment status changed to ${newStatus}.`,
        note ? `Note from the workshop: <em>${note}</em>` : "",
      ].filter(Boolean),
      highlight: newStatus.replace("_", " "),
      rows: [
        ["Workshop", workshopName],
        ["Vehicle", `${appointment.vehicle.make} ${appointment.vehicle.model} (${appointment.vehicle.regNumber})`],
        ["Date", formatDate(appointment.appointmentDate)],
      ],
    }),
    text: `Update: your appointment at ${workshopName} is now ${newStatus}.`,
  });
};

// Feature 4: invoice email, sent once the repair is marked COMPLETED.
const sendInvoiceEmail = async ({
  to,
  name,
  appointment,
  workshopName,
  serviceNames = [],
  attachmentBuffer,
}) => {
  await sendMailSafely({
    to,
    subject: `Invoice ${appointment.invoiceNumber} — Car Detailing`,
    html: simpleEmailTemplate({
      heading: "Your Invoice Is Ready",
      greetingName: name,
      bodyLines: [
        `Your service at <strong style="color:#fbbf24;">${workshopName}</strong> is complete. Your invoice is attached as a PDF.`,
      ],
      rows: [
        ["Invoice No.", appointment.invoiceNumber],
        ["Services", serviceNames.join(", ") || "—"],
        ["Estimated Cost", `₹${appointment.estimatedCost ?? 0}`],
        ["Final Cost", `₹${appointment.finalCost ?? appointment.estimatedCost ?? 0}`],
      ],
    }),
    text: `Your invoice ${appointment.invoiceNumber} is ready. Final cost: ₹${appointment.finalCost ?? appointment.estimatedCost ?? 0}.`,
  });

  if (attachmentBuffer) {
    const mailer = getTransporter();
    await mailer.sendMail({
      from: `"Car Detailing" <${process.env.SMTP_USER}>` || process.env.EMAIL_FROM,
      to,
      subject: `Invoice ${appointment.invoiceNumber} (PDF) — Car Detailing`,
      text: "Your invoice PDF is attached.",
      attachments: [
        {
          filename: `${appointment.invoiceNumber}.pdf`,
          content: attachmentBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  }
};

// Feature 8: OTP for changing profile email/phone.
const sendProfileUpdateOtpEmail = async ({ to, name, otp, expiryMinutes, field, newValue }) => {
  await sendMailSafely({
    to,
    subject: `Confirm your ${field} change — Car Detailing`,
    html: simpleEmailTemplate({
      heading: `Confirm Your ${field === "email" ? "Email" : "Phone"} Change`,
      greetingName: name,
      bodyLines: [
        `We received a request to change the ${field} on your account to <strong style="color:#fbbf24;">${newValue}</strong>. Use the code below to confirm this change.`,
      ],
      highlight: otp,
      footerNote: `This code expires in ${expiryMinutes} minutes. Didn't request this? You can safely ignore this email.`,
    }),
    text: `Your verification code to change your ${field} is ${otp}. It expires in ${expiryMinutes} minutes.`,
  });
};

const sendRepairPhotoEmail = async ({ to, name, appointment, workshopName, photoUrl, stage, caption }) => {
  await sendMailSafely({
    to,
    subject: `Repair photo update — ${stage === "MID_REPAIR" ? "repair in progress" : "repair completed"}`,
    html: simpleEmailTemplate({
      heading: "Repair Photo Update",
      greetingName: name,
      bodyLines: [
        `The workshop <strong style="color:#fbbf24;">${workshopName}</strong> shared a photo from your vehicle repair.`,
        caption ? `<em>${caption}</em>` : "",
        `<img src="${photoUrl}" alt="Repair photo" style="max-width:100%;border-radius:12px;margin-top:12px;" />`,
      ].filter(Boolean),
      highlight: stage === "MID_REPAIR" ? "Repair in progress" : "After repair",
    }),
    text: `Repair photo update from ${workshopName}: ${photoUrl}${caption ? `\n${caption}` : ""}`,
  });
};

const sendAdvisorCustomerEmail = async ({ to, name, advisorName, workshopName, subject, message, imageUrl }) => {
  await sendMailSafely({
    to,
    subject: subject || `Message from your service advisor — ${workshopName}`,
    html: simpleEmailTemplate({
      heading: "Message From Your Service Advisor",
      greetingName: name,
      bodyLines: [
        `Your service advisor <strong>${advisorName}</strong> from <strong style="color:#fbbf24;">${workshopName}</strong> sent you the following message:`,
        `<div style="white-space:pre-wrap;background:#171d25;padding:16px;border-radius:12px;">${message}</div>`,
        imageUrl ? `<img src="${imageUrl}" alt="Shared photo" style="max-width:100%;border-radius:12px;margin-top:12px;" />` : "",
        `<p style="margin-top:16px;font-size:13px;color:#9ca3af;">You can also view this conversation any time from the Community tab in your account.</p>`,
      ].filter(Boolean),
    }),
    text: `${advisorName} from ${workshopName}:\n${message}${imageUrl ? `\n${imageUrl}` : ""}`,
  });
};

export {
  sendOtpEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentStatusEmail,
  sendInvoiceEmail,
  sendProfileUpdateOtpEmail,
  sendRepairPhotoEmail,
  sendAdvisorCustomerEmail,
};
export default {
  sendOtpEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentStatusEmail,
  sendInvoiceEmail,
  sendProfileUpdateOtpEmail,
  sendRepairPhotoEmail,
  sendAdvisorCustomerEmail,
};