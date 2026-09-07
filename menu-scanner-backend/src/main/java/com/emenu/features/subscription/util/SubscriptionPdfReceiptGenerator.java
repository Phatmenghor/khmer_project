package com.emenu.features.subscription.util;

import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.models.User;
import com.emenu.features.subscription.models.Subscription;
import com.emenu.features.subscription.models.SubscriptionPayment;
import com.emenu.features.subscription.models.SubscriptionPlan;
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

            // Frontend Theme Colors (Gold/Bronze #8D6B2A, Soft Gold #FAF6EE, Slate 900 #0F172A)
            Color primaryColor = new Color(141, 107, 42);      // Frontend Gold/Bronze #8D6B2A
            Color primaryLightBg = new Color(250, 246, 238);  // Soft Gold Tint #FAF6EE
            Color cardBgColor = new Color(248, 250, 252);     // Slate 50 #F8FAFC
            Color borderColor = new Color(226, 232, 240);     // Slate 200 #E2E8F0
            Color darkTextColor = new Color(15, 23, 42);      // Slate 900 #0F172A
            Color mutedTextColor = new Color(100, 116, 139);  // Slate 500 #64748B
            Color statusGreenColor = new Color(22, 163, 74);   // Success Green #16A34A

            // Apple-Style English Typography Fonts
            Font fontBrand = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, primaryColor);
            Font fontSlogan = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, mutedTextColor);
            Font fontContactHead = FontFactory.getFont(FontFactory.HELVETICA, 8, mutedTextColor);

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, darkTextColor);
            Font fontReceiptId = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, primaryColor);
            Font fontMuted = FontFactory.getFont(FontFactory.HELVETICA, 8, mutedTextColor);

            Font fontSectionHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, primaryColor);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, darkTextColor);
            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 9, darkTextColor);

            Font fontTableHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, primaryColor);
            Font fontTotalLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkTextColor);
            Font fontTotalAmount = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, primaryColor);
            Font fontStatusText = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, statusGreenColor);

            Business business = subscription.getBusiness();
            SubscriptionPlan plan = subscription.getPlan();
            SubscriptionPayment payment = subscription.getPayment();

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

            // Generate Readable Invoice ID format (e.g. SUB-20260907-19271AEE)
            String datePart = subscription.getCreatedAt() != null
                    ? subscription.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                    : (subscription.getStartDate() != null ? subscription.getStartDate().format(DateTimeFormatter.ofPattern("yyyyMMdd")) : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")));
            String codePart = subscription.getId() != null
                    ? subscription.getId().toString().substring(0, 8).toUpperCase()
                    : "00000000";
            String generatedInvoiceNo = "SUB-" + datePart + "-" + codePart;

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

            Paragraph receiptTitle = new Paragraph("Official Subscription Receipt", fontTitle);
            receiptTitle.setAlignment(Element.ALIGN_RIGHT);
            cellRight.addElement(receiptTitle);

            Paragraph receiptNo = new Paragraph("Invoice #" + generatedInvoiceNo, fontReceiptId);
            receiptNo.setAlignment(Element.ALIGN_RIGHT);
            cellRight.addElement(receiptNo);

            String issueDate = subscription.getCreatedAt() != null
                    ? subscription.getCreatedAt().format(DATE_TIME_FMT)
                    : (subscription.getStartDate() != null ? subscription.getStartDate().format(DATE_TIME_FMT) : "N/A");
            Paragraph datePara = new Paragraph("Issued Date: " + issueDate, fontMuted);
            datePara.setAlignment(Element.ALIGN_RIGHT);
            cellRight.addElement(datePara);

            headerTable.addCell(cellLeft);
            headerTable.addCell(cellRight);
            document.add(headerTable);

            document.add(new Paragraph(" "));

            // Primary Gold Accent Divider
            PdfPTable divider = new PdfPTable(1);
            divider.setWidthPercentage(100);
            PdfPCell dCell = new PdfPCell();
            dCell.setFixedHeight(2.5f);
            dCell.setBackgroundColor(primaryColor);
            dCell.setBorder(Rectangle.NO_BORDER);
            divider.addCell(dCell);
            document.add(divider);

            document.add(new Paragraph(" "));

            // 2. Information Cards (Subscriber Info & Payment Details with Native Border Radius)
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{49, 51});

            // Card 1: Subscriber Information (No Business ID)
            PdfPCell bizCell = new PdfPCell();
            bizCell.setPadding(12f);
            bizCell.setBorder(Rectangle.NO_BORDER);
            bizCell.setCellEvent(new RoundedCardCellEvent(cardBgColor, borderColor, 8f));

            bizCell.addElement(new Paragraph("Subscriber Information", fontSectionHeader));
            bizCell.addElement(new Paragraph("Store Name: " + (business != null ? business.getName() : "N/A"), fontBold));
            if (owner != null) {
                bizCell.addElement(new Paragraph("Account Owner: " + owner.getFullName(), fontNormal));
                bizCell.addElement(new Paragraph("Email: " + (owner.getEmail() != null ? owner.getEmail() : "N/A"), fontNormal));
                bizCell.addElement(new Paragraph("Phone: " + (owner.getPhoneNumber() != null ? owner.getPhoneNumber() : "N/A"), fontNormal));
            }

            // Card 2: Payment Details (Clean status text with no filled background box)
            PdfPCell payMetaCell = new PdfPCell();
            payMetaCell.setPadding(12f);
            payMetaCell.setBorder(Rectangle.NO_BORDER);
            payMetaCell.setCellEvent(new RoundedCardCellEvent(cardBgColor, borderColor, 8f));

            payMetaCell.addElement(new Paragraph("Payment Details", fontSectionHeader));
            String rawMethod = payment != null && payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : "BANK";
            String methodStr = toTitleCase(rawMethod.replace("_", " "));
            String refStr = payment != null && payment.getReferenceNumber() != null && !payment.getReferenceNumber().isBlank()
                    ? payment.getReferenceNumber()
                    : "N/A";
            String rawStatus = subscription.getStatus() != null ? subscription.getStatus() : "Active";
            String statusStr = toTitleCase(rawStatus);

            payMetaCell.addElement(new Paragraph("Payment Method: " + methodStr, fontNormal));
            payMetaCell.addElement(new Paragraph("Reference No: " + refStr, fontNormal));
            
            Paragraph statusLine = new Paragraph();
            statusLine.add(new Chunk("Payment Status: ", fontNormal));
            statusLine.add(new Chunk(statusStr, fontStatusText));
            payMetaCell.addElement(statusLine);

            infoTable.addCell(bizCell);
            infoTable.addCell(payMetaCell);
            document.add(infoTable);

            document.add(new Paragraph(" "));

            // 3. Plan & Billing Details Table
            PdfPTable planTable = new PdfPTable(4);
            planTable.setWidthPercentage(100);
            planTable.setWidths(new float[]{35, 20, 25, 20});

            // Table Header with Rounded Top Corners
            addTableHeaderCell(planTable, "Plan Description", fontTableHeader, primaryLightBg, borderColor);
            addTableHeaderCell(planTable, "Billing Cycle", fontTableHeader, primaryLightBg, borderColor);
            addTableHeaderCell(planTable, "Validity Period", fontTableHeader, primaryLightBg, borderColor);
            addTableHeaderCell(planTable, "Price ($ USD)", fontTableHeader, primaryLightBg, borderColor);

            // Table Data (Clean Plan Name)
            String planName = plan != null ? plan.getName() : "1 Month Premium";
            String duration = plan != null && plan.getDurationType() != null ? toTitleCase(plan.getDurationType().name()) : "Monthly";
            String startDateStr = subscription.getStartDate() != null ? subscription.getStartDate().toLocalDate().format(DATE_FMT) : "N/A";
            String endDateStr = subscription.getEndDate() != null ? subscription.getEndDate().toLocalDate().format(DATE_FMT) : "N/A";
            String validity = startDateStr + " - " + endDateStr;
            BigDecimal planPrice = plan != null ? plan.getPrice() : BigDecimal.ZERO;
            BigDecimal paidAmount = payment != null && payment.getAmount() != null ? payment.getAmount() : planPrice;

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
            totalTable.setWidths(new float[]{50, 50});

            addSummaryRow(totalTable, "Subtotal:", "$" + String.format("%.2f", paidAmount), fontNormal);
            addSummaryRow(totalTable, "Tax & Fees (0%):", "$0.00", fontNormal);

            PdfPCell cellTotalLabel = new PdfPCell(new Phrase("Total Paid:", fontTotalLabel));
            cellTotalLabel.setBackgroundColor(primaryLightBg);
            cellTotalLabel.setBorderColor(primaryColor);
            cellTotalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            cellTotalLabel.setPadding(6f);

            PdfPCell cellTotalVal = new PdfPCell(new Phrase("$" + String.format("%.2f", paidAmount), fontTotalAmount));
            cellTotalVal.setBackgroundColor(primaryLightBg);
            cellTotalVal.setBorderColor(primaryColor);
            cellTotalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            cellTotalVal.setPadding(6f);

            totalTable.addCell(cellTotalLabel);
            totalTable.addCell(cellTotalVal);

            document.add(totalTable);

            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // 5. Support & Appreciation Card with Native Border Radius
            PdfPTable noteTable = new PdfPTable(1);
            noteTable.setWidthPercentage(100);

            PdfPCell noteCell = new PdfPCell();
            noteCell.setPadding(12f);
            noteCell.setBorder(Rectangle.NO_BORDER);
            noteCell.setCellEvent(new RoundedCardCellEvent(cardBgColor, borderColor, 8f));

            Paragraph noteHeading = new Paragraph("Thank you for choosing " + BRAND_NAME + "!", fontSectionHeader);
            Paragraph noteBody = new Paragraph(
                "We appreciate your trust in our platform. Your subscription powers continuous online menu availability, " +
                "QR ordering, and instant staff notifications for your store.",
                fontNormal
            );
            Paragraph contactBody = new Paragraph(
                "Need help or have questions regarding your plan? Reach out to our team anytime:\n" +
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
