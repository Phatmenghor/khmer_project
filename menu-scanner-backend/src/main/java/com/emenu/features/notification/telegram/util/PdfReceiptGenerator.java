package com.emenu.features.notification.telegram.util;

import com.emenu.enums.common.ReceiptSize;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.order.models.Order;
import com.emenu.features.order.models.OrderDeliveryAddress;
import com.emenu.features.order.models.OrderItem;
import com.emenu.features.order.models.OrderItemCustomization;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.Ellipse2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URL;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public final class PdfReceiptGenerator {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm a");

    private PdfReceiptGenerator() {}

    public static byte[] generatePdfReceipt(Order order, BusinessSetting settings) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // 1. Resolve receipt width & font scale based on ReceiptSize (default 58mm)
        ReceiptSize size = settings != null && settings.getReceiptSize() != null ? settings.getReceiptSize() : ReceiptSize.SIZE_58MM;

        float widthPt;
        float fontScale;
        switch (size) {
            case SIZE_80MM:
                widthPt = 226.8f; // ~80mm width
                fontScale = 1.0f;
                break;
            case SIZE_112MM:
                widthPt = 317.5f; // ~112mm width
                fontScale = 1.25f;
                break;
            case SIZE_58MM:
            default:
                widthPt = 164.4f; // ~58mm width
                fontScale = 0.85f;
                break;
        }

        // 2. TWO-PASS RENDERING:
        //    Pass 1 → render into a scratch page (very tall) to measure actual y position after all content
        //    Pass 2 → re-render on an exactly-fitted single page

        float measuredHeight = measureContentHeight(order, settings, widthPt, fontScale);

        // Add a safe buffer so iText never overflows onto a second page
        float pageHeight = measuredHeight + 25f * fontScale;

        Rectangle pageSize = new Rectangle(widthPt, pageHeight);
        float margin = 4f * fontScale;
        Document document = new Document(pageSize, margin, margin, margin, margin);

        try {
            PdfWriter.getInstance(document, out);
            document.open();
            renderContent(document, order, settings, widthPt, fontScale);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF receipt: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    // ── Shared rendering logic (used by both Pass 1 measure and Pass 2 final) ──

    private static void renderContent(Document document, Order order, BusinessSetting settings,
                                      float widthPt, float fontScale) throws Exception {
        Business biz = order.getBusiness();

        // Fonts matching frontend Receipt.tsx (Courier Monospace)
        Font fontShopTitle = FontFactory.getFont(FontFactory.COURIER_BOLD, 12f * fontScale, Color.BLACK);
        Font fontShopDesc = FontFactory.getFont(FontFactory.COURIER, 6.5f * fontScale, Color.DARK_GRAY);
        Font fontShopContact = FontFactory.getFont(FontFactory.COURIER, 6f * fontScale, Color.DARK_GRAY);
        Font fontOrderNumHeader = FontFactory.getFont(FontFactory.COURIER_BOLD, 22f * fontScale, Color.BLACK);
        Font fontHeader = FontFactory.getFont(FontFactory.COURIER_BOLD, 8f * fontScale, Color.BLACK);
        Font fontBold = FontFactory.getFont(FontFactory.COURIER_BOLD, 6.5f * fontScale, Color.BLACK);
        Font fontNormal = FontFactory.getFont(FontFactory.COURIER, 6.5f * fontScale, Color.BLACK);
        Font fontMuted = FontFactory.getFont(FontFactory.COURIER, 6f * fontScale, Color.DARK_GRAY);
        Font fontTotal = FontFactory.getFont(FontFactory.COURIER_BOLD, 11f * fontScale, Color.BLACK);

        // ── 1. Business Logo (Circular, Top Center) ─────────────────────────────
        if (settings != null && settings.getLogoBusiness() != null) {
            String logoUrl = settings.getLogoBusiness().getSm();
            if (!hasText(logoUrl)) logoUrl = settings.getLogoBusiness().getMd();
            if (!hasText(logoUrl)) logoUrl = settings.getLogoBusiness().getO();
            if (hasText(logoUrl)) {
                try {
                    Image circularLogo = fetchAndMakeCircularLogo(logoUrl, 36f * fontScale);
                    if (circularLogo != null) document.add(circularLogo);
                } catch (Exception ignored) { /* Skip gracefully if unreachable */ }
            }
        }

        // ── 2. Shop Name, Description & Contact ─────────────────────────────────
        String shopName = biz != null && hasText(biz.getName()) ? biz.getName().toUpperCase() : "MY BUSINESS";
        Paragraph pShop = new Paragraph(shopName, fontShopTitle);
        pShop.setAlignment(Element.ALIGN_CENTER);
        pShop.setSpacingAfter(0f);
        document.add(pShop);

        if (biz != null && hasText(biz.getDescription())) {
            Paragraph pDesc = new Paragraph(biz.getDescription(), fontShopDesc);
            pDesc.setAlignment(Element.ALIGN_CENTER);
            pDesc.setSpacingAfter(0f);
            document.add(pDesc);
        }

        String phone = biz != null && hasText(biz.getPhone()) ? biz.getPhone() : "";
        String email = biz != null && hasText(biz.getEmail()) ? biz.getEmail() : "";
        if (hasText(phone) || hasText(email)) {
            StringBuilder contactSb = new StringBuilder();
            if (hasText(phone)) contactSb.append("Tel: ").append(phone);
            if (hasText(phone) && hasText(email)) contactSb.append(" | ");
            if (hasText(email)) contactSb.append("Email: ").append(email);
            Paragraph pContact = new Paragraph(contactSb.toString(), fontShopContact);
            pContact.setAlignment(Element.ALIGN_CENTER);
            pContact.setSpacingAfter(1f);
            document.add(pContact);
        }

        // ── Short Order Number (e.g. 009) ────────────────────────────────────────
        String fullOrderNum = order.getOrderNumber() != null ? order.getOrderNumber() : "";
        String shortOrderNum = fullOrderNum.contains("-")
                ? fullOrderNum.substring(fullOrderNum.lastIndexOf("-") + 1) : fullOrderNum;

        if (hasText(shortOrderNum)) {
            Paragraph pShortNum = new Paragraph(shortOrderNum, fontOrderNumHeader);
            pShortNum.setAlignment(Element.ALIGN_CENTER);
            pShortNum.setLeading(18f * fontScale);
            pShortNum.setSpacingBefore(0f);
            pShortNum.setSpacingAfter(1f);
            document.add(pShortNum);
        }

        document.add(createSolidThickLine(fontScale));

        // ── 3. Metadata Table ────────────────────────────────────────────────────
        PdfPTable metaTable = new PdfPTable(2);
        metaTable.setWidthPercentage(100);
        metaTable.setWidths(new float[]{32, 68});
        metaTable.setSpacingAfter(1f);

        addMetaRow(metaTable, "TRANS ID", fullOrderNum, fontNormal, fontBold);
        if (order.getCreatedAt() != null)
            addMetaRow(metaTable, "DATE/TIME", order.getCreatedAt().format(DATE_FMT), fontNormal, fontNormal);
        if (hasText(order.getCustomerName()))
            addMetaRow(metaTable, "CUSTOMER", order.getCustomerName(), fontNormal, fontNormal);
        if (hasText(order.getCustomerPhone()))
            addMetaRow(metaTable, "CONTACT", order.getCustomerPhone(), fontNormal, fontNormal);
        if (order.getDeliveryAddress() != null) {
            String addr = formatAddress(order.getDeliveryAddress());
            if (hasText(addr)) addMetaRow(metaTable, "ADDRESS", addr, fontNormal, fontNormal);
        }
        if (hasText(order.getSource()))
            addMetaRow(metaTable, "SOURCE", order.getSource().toUpperCase(), fontNormal, fontNormal);
        if (order.getOrderStatus() != null)
            addMetaRow(metaTable, "STATUS", order.getOrderStatus().name(), fontNormal, fontBold);
        document.add(metaTable);

        document.add(createDashedDividerLine(fontScale));

        // ── 4. Items Table ───────────────────────────────────────────────────────
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            PdfPTable itemsTable = new PdfPTable(5);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{38, 12, 18, 14, 18});

            addHeaderCell(itemsTable, "ITEM", Element.ALIGN_LEFT, fontHeader, false);
            addHeaderCell(itemsTable, "QTY", Element.ALIGN_RIGHT, fontHeader, true);
            addHeaderCell(itemsTable, "PRICE", Element.ALIGN_RIGHT, fontHeader, true);
            addHeaderCell(itemsTable, "DISC", Element.ALIGN_RIGHT, fontHeader, true);
            addHeaderCell(itemsTable, "TOTAL", Element.ALIGN_RIGHT, fontHeader, true);

            int idx = 1;
            for (OrderItem item : order.getItems()) {
                String name = item.getProductName() != null ? item.getProductName() : "Product";
                BigDecimal lineTotal = item.getTotalPrice() != null ? item.getTotalPrice()
                        : (item.getFinalPrice() != null
                            ? item.getFinalPrice().multiply(new BigDecimal(item.getQuantity()))
                            : BigDecimal.ZERO);
                BigDecimal displayOriginalPrice = item.getCurrentPrice() != null && item.getCurrentPrice().compareTo(BigDecimal.ZERO) > 0
                        ? item.getCurrentPrice()
                        : (item.getFinalPrice() != null ? item.getFinalPrice() : item.getUnitPrice());
                String discStr = "-";
                if (Boolean.TRUE.equals(item.getHasPromotion()) && item.getPromotionType() != null) {
                    discStr = "PERCENTAGE".equals(item.getPromotionType())
                            ? fmt(item.getPromotionValue()) + "%" : "$" + fmt(item.getPromotionValue());
                }

                addDataCell(itemsTable, idx++ + "." + name, Element.ALIGN_LEFT, fontNormal, false);
                addDataCell(itemsTable, String.valueOf(item.getQuantity()), Element.ALIGN_RIGHT, fontNormal, true);
                addDataCell(itemsTable, "$" + fmt(displayOriginalPrice), Element.ALIGN_RIGHT, fontNormal, true);
                addDataCell(itemsTable, discStr, Element.ALIGN_RIGHT, fontMuted, true);
                addDataCell(itemsTable, "$" + fmt(lineTotal), Element.ALIGN_RIGHT, fontBold, true);

                if (hasText(item.getSizeName()) && !"Standard".equalsIgnoreCase(item.getSizeName())
                        && !"null".equalsIgnoreCase(item.getSizeName()))
                    addSpanCell(itemsTable, "  (" + item.getSizeName() + ")", fontMuted);

                Set<OrderItemCustomization> customs = item.getItemCustomizations();
                if (customs != null && !customs.isEmpty()) {
                    for (OrderItemCustomization c : customs) {
                        BigDecimal adj = c.getPriceAdjustment() != null ? c.getPriceAdjustment() : BigDecimal.ZERO;
                        addSpanCell(itemsTable, "  + " + c.getName()
                                + (adj.compareTo(BigDecimal.ZERO) > 0 ? " (+$" + fmt(adj) + ")" : ""), fontMuted);
                    }
                }
            }
            itemsTable.setSpacingAfter(1f);
            document.add(itemsTable);
        }

        document.add(createDashedDividerLine(fontScale));

        // ── 5. Pricing Summary ───────────────────────────────────────────────────
        PdfPTable summaryTable = new PdfPTable(2);
        summaryTable.setWidthPercentage(100);
        summaryTable.setWidths(new float[]{65, 35});
        summaryTable.setSpacingAfter(1f);

        if (order.getSubtotal() != null)
            addMetaRow(summaryTable, "Subtotal", "$" + fmt(order.getSubtotal()), fontNormal, fontBold);
        if (order.getCustomizationTotal() != null && order.getCustomizationTotal().compareTo(BigDecimal.ZERO) > 0)
            addMetaRow(summaryTable, "Add-ons", "+$" + fmt(order.getCustomizationTotal()), fontNormal, fontNormal);
        if (order.getTaxAmount() != null || order.getTaxPercentage() != null) {
            String taxLabel = "Tax (" + (order.getTaxPercentage() != null ? fmt(order.getTaxPercentage()) : "0") + "%)";
            addMetaRow(summaryTable, taxLabel, "+$" + fmt(order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO), fontNormal, fontNormal);
        }
        if (order.getDeliveryFee() != null || order.getDeliveryOption() != null) {
            String delLabel = order.getDeliveryOption() != null && hasText(order.getDeliveryOption().getName())
                    ? "Delivery (" + order.getDeliveryOption().getName() + ")" : "Delivery";
            BigDecimal delFee = order.getDeliveryFee() != null ? order.getDeliveryFee()
                    : (order.getDeliveryOption() != null && order.getDeliveryOption().getPrice() != null
                        ? order.getDeliveryOption().getPrice() : BigDecimal.ZERO);
            addMetaRow(summaryTable, delLabel, "+$" + fmt(delFee), fontNormal, fontNormal);
        }
        String paymentMode = hasText(order.getCustomerPaymentMethod())
                ? order.getCustomerPaymentMethod()
                : (order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null);
        if (paymentMode != null)
            addMetaRow(summaryTable, "Payment Mode", paymentMode, fontNormal, fontBold);
        if (order.getPaymentStatus() != null)
            addMetaRow(summaryTable, "Payment Status", order.getPaymentStatus().name(), fontNormal, fontBold);
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            String discLabel = "Discount";
            if (hasText(order.getDiscountType())) {
                discLabel = "PERCENTAGE".equalsIgnoreCase(order.getDiscountType()) ? "Discount (%)" : "Discount (Fixed)";
            }
            addMetaRow(summaryTable, discLabel, "-$" + fmt(order.getDiscountAmount()), fontNormal, fontBold);
        }
        document.add(summaryTable);

        // ── 6. Total Amount Box ──────────────────────────────────────────────────
        document.add(createSolidThickLine(fontScale));
        PdfPTable totalTable = new PdfPTable(2);
        totalTable.setWidthPercentage(100);
        totalTable.setWidths(new float[]{50, 50});
        totalTable.setSpacingAfter(1f);
        if (order.getTotalAmount() != null)
            addMetaRow(totalTable, "TOTAL AMOUNT", "$" + fmt(order.getTotalAmount()), fontTotal, fontTotal);
        document.add(totalTable);
        document.add(createSolidThickLine(fontScale));

        // ── 7. Remarks ───────────────────────────────────────────────────────────
        if (hasText(order.getBusinessNote())) {
            String[] parts = order.getBusinessNote().split("\\|");
            List<String> cleanParts = new ArrayList<>();
            for (String p : parts) {
                String t = p.trim();
                if (hasText(t) && !t.startsWith("Discount Applied:")) {
                    cleanParts.add(t);
                }
            }
            if (!cleanParts.isEmpty()) {
                document.add(new Paragraph("Remarks:", fontHeader));
                for (String cp : cleanParts) {
                    Paragraph pPart = new Paragraph("  • " + cp, fontMuted);
                    document.add(pPart);
                }
                document.add(createDashedDividerLine(fontScale));
            }
        }

        // ── 8. Wi-Fi Details ─────────────────────────────────────────────────────
        if (settings != null && (hasText(settings.getWifiName()) || hasText(settings.getWifiPassword()))) {
            Paragraph pWifiHead = new Paragraph("WI-FI DETAILS", fontHeader);
            pWifiHead.setAlignment(Element.ALIGN_CENTER);
            document.add(pWifiHead);
            if (hasText(settings.getWifiName())) {
                Paragraph pWifi = new Paragraph("SSID: " + settings.getWifiName(), fontNormal);
                pWifi.setAlignment(Element.ALIGN_CENTER);
                document.add(pWifi);
            }
            if (hasText(settings.getWifiPassword())) {
                Paragraph pPass = new Paragraph("Password: " + settings.getWifiPassword(), fontNormal);
                pPass.setAlignment(Element.ALIGN_CENTER);
                document.add(pPass);
            }
            document.add(createDashedDividerLine(fontScale));
        }

        // ── 9. Footer ────────────────────────────────────────────────────────────
        Paragraph pFooter1 = new Paragraph("Thank you for your order!", fontMuted);
        pFooter1.setAlignment(Element.ALIGN_CENTER);
        pFooter1.setSpacingBefore(1f);
        document.add(pFooter1);
        Paragraph pFooter2 = new Paragraph("Please visit again", fontMuted);
        pFooter2.setAlignment(Element.ALIGN_CENTER);
        document.add(pFooter2);
    }

    // ── Circular Logo Generator (border-radius: 50%) ─────────────────────────

    private static Image fetchAndMakeCircularLogo(String urlStr, float displaySizePt) {
        try {
            URL url = new URL(urlStr);
            try (InputStream in = url.openStream()) {
                BufferedImage src = ImageIO.read(in);
                if (src == null) return null;

                int diameter = Math.min(src.getWidth(), src.getHeight());
                BufferedImage circleBuffer = new BufferedImage(diameter, diameter, BufferedImage.TYPE_INT_ARGB);

                Graphics2D g2 = circleBuffer.createGraphics();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setClip(new Ellipse2D.Float(0, 0, diameter, diameter));
                g2.drawImage(src, 0, 0, diameter, diameter, null);
                g2.dispose();

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(circleBuffer, "png", baos);

                Image img = Image.getInstance(baos.toByteArray());
                img.scaleToFit(displaySizePt, displaySizePt);
                img.setAlignment(Element.ALIGN_CENTER);
                img.setSpacingAfter(2f);
                return img;
            }
        } catch (Exception e) {
            return null;
        }
    }

    // ── Table Helper Functions ───────────────────────────────────────────────

    private static void addMetaRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell cell1 = new PdfPCell(new Phrase(label, labelFont));
        cell1.setBorder(Rectangle.NO_BORDER);
        cell1.setPaddingTop(0.8f);
        cell1.setPaddingBottom(0.8f);
        cell1.setPaddingLeft(0);

        PdfPCell cell2 = new PdfPCell(new Phrase(value, valueFont));
        cell2.setBorder(Rectangle.NO_BORDER);
        cell2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell2.setPaddingTop(0.8f);
        cell2.setPaddingBottom(0.8f);
        cell2.setPaddingRight(0);

        table.addCell(cell1);
        table.addCell(cell2);
    }

    private static void addHeaderCell(PdfPTable table, String text, int align, Font font, boolean noWrap) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderWidth(1.2f);
        cell.setHorizontalAlignment(align);
        cell.setPaddingBottom(1.5f);
        cell.setPaddingLeft(0);
        cell.setPaddingRight(0);
        if (noWrap) {
            cell.setNoWrap(true);
        }
        table.addCell(cell);
    }

    private static void addDataCell(PdfPTable table, String text, int align, Font font, boolean noWrap) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(align);
        cell.setPaddingTop(1f);
        cell.setPaddingBottom(1f);
        cell.setPaddingLeft(0);
        cell.setPaddingRight(0);
        if (noWrap) {
            cell.setNoWrap(true);
        }
        table.addCell(cell);
    }

    private static void addSpanCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setColspan(5);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPaddingBottom(0.8f);
        cell.setPaddingLeft(0);
        table.addCell(cell);
    }

    // 100% Full Width Crisp Divider Lines using 100% width PdfPTable
    private static PdfPTable createDashedDividerLine(float fontScale) {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell(new Phrase(""));
        cell.setBorder(Rectangle.TOP);
        cell.setBorderColor(Color.GRAY);
        cell.setBorderWidth(0.5f * fontScale);
        cell.setPadding(0);
        table.addCell(cell);
        table.setSpacingBefore(1f);
        table.setSpacingAfter(1f);
        return table;
    }

    private static PdfPTable createSolidThickLine(float fontScale) {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell(new Phrase(""));
        cell.setBorder(Rectangle.TOP);
        cell.setBorderColor(Color.BLACK);
        cell.setBorderWidth(1.0f * fontScale);
        cell.setPadding(0);
        table.addCell(cell);
        table.setSpacingBefore(1f);
        table.setSpacingAfter(1f);
        return table;
    }

    private static String formatAddress(OrderDeliveryAddress a) {
        if (a == null) return "";
        List<String> parts = new ArrayList<>();
        if (hasText(a.getHouseNumber())) parts.add("House " + a.getHouseNumber());
        if (hasText(a.getStreetNumber())) parts.add("St " + a.getStreetNumber());
        if (hasText(a.getVillage())) parts.add(a.getVillage());
        if (hasText(a.getCommune())) parts.add(a.getCommune());
        if (hasText(a.getDistrict())) parts.add(a.getDistrict());
        if (hasText(a.getProvince())) parts.add(a.getProvince());
        return String.join(", ", parts);
    }

    private static String fmt(BigDecimal amount) {
        if (amount == null) return "0";
        BigDecimal stripped = amount.stripTrailingZeros();
        if (stripped.scale() <= 0) {
            return stripped.toBigInteger().toString();
        }
        return String.format("%.2f", amount);
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    /**
     * Pass 1: Render content on a scratch page (5000pt tall) to measure actual content height.
     * Returns the distance from the top of the page to the lowest point of content.
     */
    private static float measureContentHeight(Order order, BusinessSetting settings, float widthPt, float fontScale) {
        try {
            ByteArrayOutputStream scratch = new ByteArrayOutputStream();
            float scratchHeight = 5000f;
            float margin = 4f * fontScale;
            Rectangle scratchPage = new Rectangle(widthPt, scratchHeight);
            Document doc = new Document(scratchPage, margin, margin, margin, margin);
            PdfWriter writer = PdfWriter.getInstance(doc, scratch);
            doc.open();

            renderContent(doc, order, settings, widthPt, fontScale);

            // iText reports position from bottom; convert to distance from top
            float usedFromTop = scratchHeight - writer.getVerticalPosition(true);
            doc.close();
            return Math.max(usedFromTop, 100f);
        } catch (Exception e) {
            // Fallback: estimate 400pt for a typical receipt
            return 400f;
        }
    }
}
