package com.emenu.features.master.util;

import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.models.User;
import com.emenu.features.master.models.Subscription;
import com.emenu.features.master.models.SubscriptionPayment;
import com.emenu.features.master.models.SubscriptionPlan;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.extern.slf4j.Slf4j;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Slf4j
public final class SubscriptionPdfReceiptGenerator {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter DATE_TIME_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");

    // Brand Contact Details
    private static final String BRAND_NAME = "ScanMe KH";
    private static final String BRAND_SLOGAN = "Digital Menu & Smart POS Platform";
    private static final String SUPPORT_EMAIL = "phatmenghor7@gmail.com";
    private static final String SUPPORT_TELEGRAM = "070411260";

    private SubscriptionPdfReceiptGenerator() {}

    public static byte[] generateReceiptPdf(Subscription subscription, BusinessSetting settings, User owner) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Modern Brand Primary Colors (Matching ScanMe KH #57823D Theme)
            Color primaryBrandColor  = new Color(87, 130, 61);      // Brand Green #57823D
            Color primaryDarkColor   = new Color(60, 90, 42);       // Brand Dark #3C5A2A
            Color cardBgColor        = new Color(244, 248, 241);    // Brand Soft Tint #F4F8F1
            Color tableHeaderBg      = new Color(235, 242, 230);    // Brand Header Green #EBF2E6
            Color borderColor        = new Color(209, 224, 201);    // Soft Border #D1E0C9
            Color darkTextColor      = new Color(22, 33, 16);       // Deep Charcoal #162110
            Color mutedTextColor     = new Color(100, 116, 139);    // Slate 500 #64748B
            Color statusGreenColor   = new Color(22, 163, 74);      // Emerald Green #16A34A

            // Modern Typography Fonts
            Font fontBrand = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, primaryBrandColor);
            Font fontSlogan = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, mutedTextColor);
            Font fontContactHead = FontFactory.getFont(FontFactory.HELVETICA, 8, mutedTextColor);

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, primaryDarkColor);
            Font fontReceiptId = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, primaryBrandColor);
            Font fontMuted = FontFactory.getFont(FontFactory.HELVETICA, 8, mutedTextColor);

            Font fontSectionHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, primaryDarkColor);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, darkTextColor);
            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 9, darkTextColor);

            Font fontTableHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, darkTextColor);
            Font fontTotalLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Font fontTotalAmount = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);
            Font fontStatusText = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, statusGreenColor);

            Business business = subscription != null ? subscription.getBusiness() : null;
            SubscriptionPlan plan = subscription != null ? subscription.getPlan() : null;
            SubscriptionPayment payment = subscription != null ? subscription.getPayment() : null;

            // Resolve Account Owner Name safely
            String ownerName = "-";
            if (owner != null) {
                if (owner.getFullName() != null && !owner.getFullName().isBlank()) {
                    ownerName = owner.getFullName().trim();
                } else if (owner.getUserIdentifier() != null && !owner.getUserIdentifier().isBlank()) {
                    ownerName = owner.getUserIdentifier().trim();
                }
            }

            // Resolve Owner / Business Email safely
            String resolvedEmail = "-";
            if (owner != null) {
                if (owner.getEmail() != null && !owner.getEmail().isBlank()) {
                    resolvedEmail = owner.getEmail().trim();
                } else if (owner.getUserIdentifier() != null && owner.getUserIdentifier().contains("@")) {
                    resolvedEmail = owner.getUserIdentifier().trim();
                }
            }
            if ("-".equals(resolvedEmail) && business != null && business.getEmail() != null && !business.getEmail().isBlank()) {
                resolvedEmail = business.getEmail().trim();
            }

            // Resolve Phone number safely
            String resolvedPhone = "-";
            if (owner != null && owner.getPhoneNumber() != null && !owner.getPhoneNumber().isBlank()) {
                resolvedPhone = owner.getPhoneNumber().trim();
            } else if (business != null && business.getPhone() != null && !business.getPhone().isBlank()) {
                resolvedPhone = business.getPhone().trim();
            }

            // Load Brand Logo dynamically from Classpath
            Image logoImg = null;
            try {
                InputStream logoStream = SubscriptionPdfReceiptGenerator.class.getResourceAsStream("/assets/image/scanmekhlogo.png");
                if (logoStream == null) {
                    logoStream = Thread.currentThread().getContextClassLoader().getResourceAsStream("assets/image/scanmekhlogo.png");
                }
                if (logoStream != null) {
                    byte[] logoBytes = logoStream.readAllBytes();
                    logoImg = Image.getInstance(logoBytes);
                }
            } catch (Exception e) {
                log.warn("Could not load ScanMe KH logo from classpath: {}", e.getMessage());
            }

            // Generate Sequential Counter Invoice ID format (e.g. SUB-20260907-00001)
            String generatedInvoiceNo = formatInvoiceNumber(subscription);

            // 1. Header Table
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{55, 45});

            PdfPCell cellLeft = new PdfPCell();
            cellLeft.setBorder(Rectangle.NO_BORDER);
            if (logoImg != null) {
                logoImg.scaleToFit(120f, 42f);
                cellLeft.addElement(logoImg);
                cellLeft.addElement(new Paragraph(BRAND_SLOGAN, fontSlogan));
            } else {
                cellLeft.addElement(new Paragraph(BRAND_NAME, fontBrand));
                cellLeft.addElement(new Paragraph(BRAND_SLOGAN, fontSlogan));
            }
            cellLeft.addElement(new Paragraph("Email: " + SUPPORT_EMAIL + " | Telegram: " + SUPPORT_TELEGRAM, fontContactHead));

            PdfPCell cellRight = new PdfPCell();
            cellRight.setBorder(Rectangle.NO_BORDER);
            cellRight.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Paragraph receiptTitle = new Paragraph("OFFICIAL SUBSCRIPTION RECEIPT", fontTitle);
            receiptTitle.setAlignment(Element.ALIGN_RIGHT);
            cellRight.addElement(receiptTitle);

            Paragraph receiptNo = new Paragraph("Invoice #" + generatedInvoiceNo, fontReceiptId);
            receiptNo.setAlignment(Element.ALIGN_RIGHT);
            cellRight.addElement(receiptNo);

            String issueDate = (subscription != null && subscription.getCreatedAt() != null)
                    ? subscription.getCreatedAt().format(DATE_TIME_FMT)
                    : ((subscription != null && subscription.getStartDate() != null) ? subscription.getStartDate().format(DATE_TIME_FMT) : "N/A");
            Paragraph datePara = new Paragraph("Issued Date: " + issueDate, fontMuted);
            datePara.setAlignment(Element.ALIGN_RIGHT);
            cellRight.addElement(datePara);

            headerTable.addCell(cellLeft);
            headerTable.addCell(cellRight);
            document.add(headerTable);

            document.add(new Paragraph(" "));

            // Primary Brand Green Accent Divider Line
            PdfPTable divider = new PdfPTable(1);
            divider.setWidthPercentage(100);
            PdfPCell dCell = new PdfPCell();
            dCell.setFixedHeight(2.5f);
            dCell.setBackgroundColor(primaryBrandColor);
            dCell.setBorder(Rectangle.NO_BORDER);
            divider.addCell(dCell);
            document.add(divider);

            document.add(new Paragraph(" "));

            // 2. UNIFIED MERGED CARD: Subscription & Payment Details
            PdfPTable mergedCardTable = new PdfPTable(1);
            mergedCardTable.setWidthPercentage(100);

            PdfPCell mergedCardCell = new PdfPCell();
            mergedCardCell.setPadding(14f);
            mergedCardCell.setBorder(Rectangle.NO_BORDER);
            mergedCardCell.setCellEvent(new RoundedCardCellEvent(cardBgColor, borderColor, 6f));

            // Merged Card Header Title
            mergedCardCell.addElement(new Paragraph("SUBSCRIPTION & PAYMENT DETAILS", fontSectionHeader));
            mergedCardCell.addElement(new Paragraph(" "));

            // 2-Column Inner Layout Inside Merged Card
            PdfPTable gridTable = new PdfPTable(2);
            gridTable.setWidthPercentage(100);
            gridTable.setWidths(new float[]{50, 50});

            String rawMethod = (payment != null && payment.getPaymentMethod() != null) ? payment.getPaymentMethod().name() : "BANK";
            String methodStr = "BANK".equalsIgnoreCase(rawMethod) ? "Bank Transfer" : toTitleCase(rawMethod.replace("_", " "));
            String refStr = (payment != null && payment.getReferenceNumber() != null && !payment.getReferenceNumber().isBlank() && !"N/A".equalsIgnoreCase(payment.getReferenceNumber()))
                    ? payment.getReferenceNumber()
                    : "-";
            String rawStatus = (subscription != null && subscription.getStatus() != null) ? subscription.getStatus() : "Active";
            String statusStr = toTitleCase(rawStatus);

            // Left Sub-cell: Subscriber Details
            PdfPCell gridLeft = new PdfPCell();
            gridLeft.setBorder(Rectangle.NO_BORDER);
            gridLeft.addElement(new Paragraph("Store Name: " + (business != null && business.getName() != null ? business.getName() : "-"), fontBold));
            gridLeft.addElement(new Paragraph("Account Owner: " + ownerName, fontNormal));
            gridLeft.addElement(new Paragraph("Email: " + resolvedEmail, fontNormal));
            gridLeft.addElement(new Paragraph("Phone: " + resolvedPhone, fontNormal));

            // Right Sub-cell: Payment & Transaction Details
            PdfPCell gridRight = new PdfPCell();
            gridRight.setBorder(Rectangle.NO_BORDER);
            gridRight.addElement(new Paragraph("Payment Method: " + methodStr, fontNormal));
            gridRight.addElement(new Paragraph("Reference No: " + refStr, fontNormal));
            
            Paragraph statusLine = new Paragraph();
            statusLine.add(new Chunk("Payment Status: ", fontNormal));
            statusLine.add(new Chunk(statusStr, fontStatusText));
            gridRight.addElement(statusLine);
            gridRight.addElement(new Paragraph("Issued Date: " + issueDate, fontNormal));

            gridTable.addCell(gridLeft);
            gridTable.addCell(gridRight);

            mergedCardCell.addElement(gridTable);
            mergedCardTable.addCell(mergedCardCell);
            document.add(mergedCardTable);

            document.add(new Paragraph(" "));

            // 3. Plan & Billing Details Table
            PdfPTable planTable = new PdfPTable(4);
            planTable.setWidthPercentage(100);
            planTable.setWidths(new float[]{35, 20, 25, 20});

            // Table Header with Clean Brand Green Background
            addTableHeaderCell(planTable, "Plan Description", fontTableHeader, tableHeaderBg, borderColor);
            addTableHeaderCell(planTable, "Billing Cycle", fontTableHeader, tableHeaderBg, borderColor);
            addTableHeaderCell(planTable, "Validity Period", fontTableHeader, tableHeaderBg, borderColor);
            addTableHeaderCell(planTable, "Price ($ USD)", fontTableHeader, tableHeaderBg, borderColor);

            // Table Data
            String planName = plan != null ? plan.getName() : "1 Month Premium";
            String duration = (plan != null && plan.getDurationType() != null) ? toTitleCase(plan.getDurationType().name()) : "Monthly";
            String startDateStr = (subscription != null && subscription.getStartDate() != null) ? subscription.getStartDate().toLocalDate().format(DATE_FMT) : "N/A";
            String endDateStr = (subscription != null && subscription.getEndDate() != null) ? subscription.getEndDate().toLocalDate().format(DATE_FMT) : "N/A";
            String validity = startDateStr + " - " + endDateStr;
            BigDecimal planPrice = plan != null ? plan.getPrice() : BigDecimal.ZERO;
            BigDecimal paidAmount = (payment != null && payment.getAmount() != null) ? payment.getAmount() : planPrice;

            addTableCell(planTable, planName, fontBold, borderColor);
            addTableCell(planTable, duration, fontNormal, borderColor);
            addTableCell(planTable, validity, fontNormal, borderColor);
            addTableCell(planTable, "$" + String.format("%.2f", paidAmount), fontBold, borderColor);

            document.add(planTable);

            document.add(new Paragraph(" "));

            // 4. Totals Summary Table
            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(45);
            totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalTable.setWidths(new float[]{55, 45});

            addSummaryRow(totalTable, "Subtotal:", "$" + String.format("%.2f", paidAmount), fontNormal);
            addSummaryRow(totalTable, "Tax & Fees (0%):", "$0.00", fontNormal);

            // Total Paid Row (Clean, No Filled Background, Top Bordered)
            Font fontTotalPaidLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkTextColor);
            Font fontTotalPaidVal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, primaryBrandColor);

            PdfPCell cellTotalLabel = new PdfPCell(new Phrase("Total Paid:", fontTotalPaidLabel));
            cellTotalLabel.setBorder(Rectangle.TOP);
            cellTotalLabel.setBorderColor(borderColor);
            cellTotalLabel.setBorderWidthTop(1.5f);
            cellTotalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            cellTotalLabel.setPadding(6f);

            PdfPCell cellTotalVal = new PdfPCell(new Phrase("$" + String.format("%.2f", paidAmount), fontTotalPaidVal));
            cellTotalVal.setBorder(Rectangle.TOP);
            cellTotalVal.setBorderColor(borderColor);
            cellTotalVal.setBorderWidthTop(1.5f);
            cellTotalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            cellTotalVal.setPadding(6f);

            totalTable.addCell(cellTotalLabel);
            totalTable.addCell(cellTotalVal);

            document.add(totalTable);

            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // 5. UNIFIED FRIENDLY SUPPORT CARD (Short, Warm, Concise)
            PdfPTable noteTable = new PdfPTable(1);
            noteTable.setWidthPercentage(100);

            PdfPCell noteCell = new PdfPCell();
            noteCell.setPadding(12f);
            noteCell.setBorder(Rectangle.NO_BORDER);
            noteCell.setCellEvent(new RoundedCardCellEvent(cardBgColor, borderColor, 6f));

            Paragraph noteHeading = new Paragraph("Thank you for your business!", fontSectionHeader);
            Paragraph noteBody = new Paragraph(
                "Your subscription is active. If you need any assistance with your plan, our support team is always here to help:",
                fontNormal
            );
            Paragraph contactBody = new Paragraph(
                "• Telegram Support: " + SUPPORT_TELEGRAM + "\n" +
                "• Email Support: " + SUPPORT_EMAIL,
                fontNormal
            );

            noteCell.addElement(noteHeading);
            noteCell.addElement(noteBody);
            noteCell.addElement(new Paragraph(" "));
            noteCell.addElement(contactBody);
            noteTable.addCell(noteCell);

            document.add(noteTable);

            document.add(new Paragraph(" "));

            // 6. Footer
            PdfPTable footerTable = new PdfPTable(1);
            footerTable.setWidthPercentage(100);

            PdfPCell footerCell = new PdfPCell();
            footerCell.setBorder(Rectangle.TOP);
            footerCell.setBorderColor(borderColor);
            footerCell.setPaddingTop(10f);

            Paragraph footerDesc = new Paragraph(
                "This is an official computer-generated receipt issued by " + BRAND_NAME + ". No physical signature is required.\n" +
                "© 2026 " + BRAND_NAME + " Platform. All rights reserved.",
                fontMuted
            );
            footerDesc.setAlignment(Element.ALIGN_CENTER);

            footerCell.addElement(footerDesc);
            footerTable.addCell(footerCell);

            document.add(footerTable);

            document.close();

        } catch (Exception e) {
            log.error("Failed to generate subscription PDF receipt: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate subscription PDF receipt: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    private static void addTableHeaderCell(PdfPTable table, String text, Font font, Color bgColor, Color borderColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(8f);
        cell.setBorderColor(borderColor);
        table.addCell(cell);
    }

    private static void addTableCell(PdfPTable table, String text, Font font, Color borderColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8f);
        cell.setBorderColor(borderColor);
        table.addCell(cell);
    }

    private static void addSummaryRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, font));
        cellLabel.setBorder(Rectangle.NO_BORDER);
        cellLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellLabel.setPadding(4f);

        PdfPCell cellVal = new PdfPCell(new Phrase(value, font));
        cellVal.setBorder(Rectangle.NO_BORDER);
        cellVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellVal.setPadding(4f);

        table.addCell(cellLabel);
        table.addCell(cellVal);
    }

    public static String formatInvoiceNumber(Subscription subscription) {
        if (subscription == null) {
            return "SUB-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-00001";
        }
        if (subscription.getPayment() != null && subscription.getPayment().getReferenceNumber() != null
                && subscription.getPayment().getReferenceNumber().startsWith("SUB-")) {
            return subscription.getPayment().getReferenceNumber();
        }
        var dt = subscription.getCreatedAt() != null ? subscription.getCreatedAt()
                : (subscription.getStartDate() != null ? subscription.getStartDate() : java.time.LocalDateTime.now());
        String datePart = dt.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        if (subscription.getId() == null) {
            return "SUB-" + datePart + "-00001";
        }
        int counterVal = Math.abs(subscription.getId().hashCode() % 100000);
        if (counterVal == 0) counterVal = 1;
        return String.format("SUB-%s-%05d", datePart, counterVal);
    }

    private static String toTitleCase(String text) {
        if (text == null || text.isBlank()) return "";
        String[] words = text.toLowerCase().split("_|\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isBlank()) {
                sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1)).append(" ");
            }
        }
        return sb.toString().trim();
    }

    // Custom Cell Event to Draw Native Frontend Rounded Corners (Border Radius)
    private static class RoundedCardCellEvent implements PdfPCellEvent {
        private final Color bgColor;
        private final Color borderColor;
        private final float radius;

        public RoundedCardCellEvent(Color bgColor, Color borderColor, float radius) {
            this.bgColor = bgColor;
            this.borderColor = borderColor;
            this.radius = radius;
        }

        @Override
        public void cellLayout(PdfPCell cell, Rectangle rect, PdfContentByte[] canvases) {
            PdfContentByte cb = canvases[PdfPTable.BACKGROUNDCANVAS];
            cb.saveState();
            float x = rect.getLeft() + 1f;
            float y = rect.getBottom() + 1f;
            float w = rect.getWidth() - 2f;
            float h = rect.getHeight() - 2f;

            if (bgColor != null) {
                cb.setColorFill(bgColor);
                cb.roundRectangle(x, y, w, h, radius);
                cb.fill();
            }
            if (borderColor != null) {
                cb.setColorStroke(borderColor);
                cb.setLineWidth(0.75f);
                cb.roundRectangle(x, y, w, h, radius);
                cb.stroke();
            }
            cb.restoreState();
        }
    }
}
