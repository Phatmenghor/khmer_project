package com.emenu.features.bakong.common;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Path2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.text.DecimalFormat;
import java.util.EnumMap;
import java.util.Map;

public final class QrImageUtils {

    private QrImageUtils() {
    }

    public static byte[] generatePngQrCode(String qrContent, int width, int height) throws Exception {
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.MARGIN, 1);

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix bitMatrix = writer.encode(qrContent, BarcodeFormat.QR_CODE, width, height, hints);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", out);
            return out.toByteArray();
        }
    }

    public static byte[] generateKhqrMerchantCard(String qrContent, String merchantName, Double amount, String currency) {
        try {
            int cardWidth = 600;
            int cardHeight = 775;

            BufferedImage cardImage = new BufferedImage(cardWidth, cardHeight, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2d = cardImage.createGraphics();

            // High Quality Rendering Hints
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);

            // 1. Pure White Card Background (Matching SVG: M21 21H421V601H421V21Z fill="white")
            g2d.setColor(Color.WHITE);
            g2d.fillRect(0, 0, cardWidth, cardHeight);

            // 2. Official KHQR Red Header (#E21A1A) with bottom-right diagonal tab pointing down
            int mainHeaderHeight = 105;
            int tabBottomY = 154;
            int tabIndentX = 50;

            g2d.setColor(new Color(226, 26, 26)); // Official KHQR Red #E21A1A

            Path2D headerPath = new Path2D.Double();
            headerPath.moveTo(0, 0);
            headerPath.lineTo(cardWidth, 0);
            headerPath.lineTo(cardWidth, tabBottomY);
            headerPath.lineTo(cardWidth - tabIndentX, mainHeaderHeight);
            headerPath.lineTo(0, mainHeaderHeight);
            headerPath.closePath();
            g2d.fill(headerPath);

            // Centered White KHQR Logo inside Red Header Banner
            boolean logoDrawn = false;
            try (InputStream logoStream = QrImageUtils.class.getResourceAsStream("/assets/khqr/KHQR Logo.png")) {
                if (logoStream != null) {
                    BufferedImage logoImg = ImageIO.read(logoStream);
                    if (logoImg != null) {
                        int logoWidth = 170;
                        int logoHeight = (int) ((double) logoImg.getHeight() / logoImg.getWidth() * logoWidth);
                        int logoX = (cardWidth - logoWidth) / 2;
                        int logoY = (mainHeaderHeight - logoHeight) / 2 - 1;
                        g2d.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight, null);
                        logoDrawn = true;
                    }
                }
            } catch (Exception ignored) {
            }

            if (!logoDrawn) {
                drawFallbackKhqrText(g2d, cardWidth, mainHeaderHeight);
            }

            // 3. Bolder & Larger Merchant Name (Matching SVG: "Company Name" style)
            String displayName = (merchantName != null && !merchantName.isBlank()) ? merchantName : "Company Name";
            g2d.setColor(new Color(20, 20, 20));
            g2d.setFont(new Font("SansSerif", Font.BOLD, 26));
            g2d.drawString(displayName, 45, 160);

            // 4. Bolder & Larger Formatted Amount & Currency Section
            int currentY = 220;
            if (amount != null && amount > 0) {
                String formattedAmt;
                if ("KHR".equalsIgnoreCase(currency)) {
                    formattedAmt = new DecimalFormat("#,##0").format(amount);
                } else {
                    formattedAmt = new DecimalFormat("#,##0.00").format(amount);
                }
                String currStr = (currency != null ? currency.toUpperCase() : "USD");

                g2d.setColor(Color.BLACK);
                g2d.setFont(new Font("SansSerif", Font.BOLD, 48));
                g2d.drawString(formattedAmt, 45, currentY);

                int amtWidth = g2d.getFontMetrics().stringWidth(formattedAmt);
                g2d.setFont(new Font("SansSerif", Font.BOLD, 24));
                g2d.setColor(new Color(30, 30, 30));
                g2d.drawString(currStr, 45 + amtWidth + 16, currentY - 5);

                currentY += 40;
            } else {
                currentY += 15;
            }

            // 5. Dashed Line Separator (Matching SVG stroke="black" stroke-opacity="0.5" stroke-dasharray="8 8")
            g2d.setColor(new Color(0, 0, 0, 85));
            Stroke dashedStroke = new BasicStroke(1.5f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 10.0f, new float[]{8.0f, 8.0f}, 0.0f);
            g2d.setStroke(dashedStroke);
            int lineY = Math.max(265, currentY);
            g2d.drawLine(30, lineY, cardWidth - 30, lineY);

            // 6. Direct QR Code Placement (Matching KHQR - digital payment.svg)
            int qrSize = 450;
            int qrX = (cardWidth - qrSize) / 2;
            int qrY = lineY + 20;

            byte[] qrBytes = generatePngQrCode(qrContent, qrSize, qrSize);
            BufferedImage qrImg = ImageIO.read(new ByteArrayInputStream(qrBytes));
            g2d.drawImage(qrImg, qrX, qrY, qrSize, qrSize, null);

            // 7. Center Bakong Logo Badge Overlay on QR Code
            int centerX = qrX + (qrSize / 2);
            int centerY = qrY + (qrSize / 2);

            boolean centerLogoDrawn = false;
            try (InputStream bgLogoStream = QrImageUtils.class.getResourceAsStream("/assets/khqr/KHQR available here - logo with bg.png")) {
                if (bgLogoStream != null) {
                    BufferedImage bgLogoImg = ImageIO.read(bgLogoStream);
                    if (bgLogoImg != null) {
                        int badgeRadius = 34; // 68px diameter
                        int whiteRadius = 38; // 76px outer white circle padding

                        // White Outer Circular Padding
                        g2d.setColor(Color.WHITE);
                        g2d.fillOval(centerX - whiteRadius, centerY - whiteRadius, whiteRadius * 2, whiteRadius * 2);

                        // Draw Red KHQR Badge centered
                        g2d.drawImage(bgLogoImg, centerX - badgeRadius, centerY - (badgeRadius * bgLogoImg.getHeight() / bgLogoImg.getWidth()), badgeRadius * 2, (badgeRadius * 2 * bgLogoImg.getHeight() / bgLogoImg.getWidth()), null);
                        centerLogoDrawn = true;
                    }
                }
            } catch (Exception ignored) {
            }

            if (!centerLogoDrawn) {
                // Fallback circular red emblem badge if image is missing
                int badgeRadius = 32;
                int whiteRadius = 36;
                g2d.setColor(Color.WHITE);
                g2d.fillOval(centerX - whiteRadius, centerY - whiteRadius, whiteRadius * 2, whiteRadius * 2);
                g2d.setColor(new Color(226, 26, 26));
                g2d.fillOval(centerX - badgeRadius, centerY - badgeRadius, badgeRadius * 2, badgeRadius * 2);
                g2d.setColor(Color.WHITE);
                g2d.setFont(new Font("SansSerif", Font.BOLD, 14));
                FontMetrics fm = g2d.getFontMetrics();
                g2d.drawString("KHQR", centerX - (fm.stringWidth("KHQR") / 2), centerY + 5);
            }

            g2d.dispose();

            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                ImageIO.write(cardImage, "PNG", baos);
                return baos.toByteArray();
            }
        } catch (Exception ex) {
            try {
                return generatePngQrCode(qrContent, 400, 400);
            } catch (Exception e) {
                return new byte[0];
            }
        }
    }

    private static void drawFallbackKhqrText(Graphics2D g2d, int cardWidth, int headerHeight) {
        g2d.setColor(Color.WHITE);
        g2d.setFont(new Font("SansSerif", Font.BOLD, 36));
        FontMetrics fm = g2d.getFontMetrics();
        int x = (cardWidth - fm.stringWidth("KHQR")) / 2;
        int y = ((headerHeight - fm.getHeight()) / 2) + fm.getAscent() - 5;
        g2d.drawString("KHQR", x, y);
    }
}
