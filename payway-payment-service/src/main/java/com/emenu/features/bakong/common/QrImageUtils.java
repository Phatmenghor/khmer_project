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
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
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
            int cardHeight = 920;

            BufferedImage cardImage = new BufferedImage(cardWidth, cardHeight, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2d = cardImage.createGraphics();

            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);

            // 1. Card Background (White)
            g2d.setColor(Color.WHITE);
            g2d.fillRect(0, 0, cardWidth, cardHeight);

            // 2. Red Top Header Banner with angled bottom-right cutout
            int headerHeight = 140;
            g2d.setColor(new Color(226, 26, 26)); // Official KHQR Red #E21A1A
            
            Path2D headerPath = new Path2D.Double();
            headerPath.moveTo(0, 0);
            headerPath.lineTo(cardWidth, 0);
            headerPath.lineTo(cardWidth, headerHeight - 35);
            headerPath.lineTo(cardWidth - 45, headerHeight);
            headerPath.lineTo(0, headerHeight);
            headerPath.closePath();
            g2d.fill(headerPath);

            // Draw White KHQR Logo inside Red Header
            boolean logoDrawn = false;
            try (InputStream logoStream = QrImageUtils.class.getResourceAsStream("/assets/khqr/KHQR Logo.png")) {
                if (logoStream != null) {
                    BufferedImage logoImg = ImageIO.read(logoStream);
                    if (logoImg != null) {
                        int logoWidth = 155;
                        int logoHeight = (int) ((double) logoImg.getHeight() / logoImg.getWidth() * logoWidth);
                        int logoX = (cardWidth - logoWidth) / 2;
                        int logoY = (headerHeight - logoHeight) / 2 - 5;
                        g2d.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight, null);
                        logoDrawn = true;
                    }
                }
            } catch (Exception ignored) {
            }

            if (!logoDrawn) {
                drawFallbackKhqrText(g2d, cardWidth, headerHeight);
            }

            // 3. Merchant / Company Name Section
            g2d.setColor(new Color(110, 110, 110));
            g2d.setFont(new Font("SansSerif", Font.PLAIN, 18));
            g2d.drawString("Company Name", 50, 185);

            String displayName = (merchantName != null && !merchantName.isBlank()) ? merchantName : "eMenu Merchant";
            g2d.setColor(new Color(15, 15, 15));
            g2d.setFont(new Font("SansSerif", Font.BOLD, 28));
            g2d.drawString(displayName, 50, 225);

            // 4. Formatted Amount & Currency
            if (amount != null && amount > 0) {
                String formattedAmt;
                if ("KHR".equalsIgnoreCase(currency)) {
                    formattedAmt = new DecimalFormat("#,##0").format(amount);
                } else {
                    formattedAmt = new DecimalFormat("#,##0.00").format(amount);
                }
                String currStr = (currency != null ? currency.toUpperCase() : "USD");

                g2d.setColor(Color.BLACK);
                g2d.setFont(new Font("SansSerif", Font.BOLD, 42));
                g2d.drawString(formattedAmt, 50, 285);

                int amtWidth = g2d.getFontMetrics().stringWidth(formattedAmt);
                g2d.setFont(new Font("SansSerif", Font.BOLD, 22));
                g2d.setColor(new Color(70, 70, 70));
                g2d.drawString(currStr, 50 + amtWidth + 14, 280);
            }

            // 5. Dashed Separator Line
            g2d.setColor(new Color(215, 215, 215));
            Stroke dashedStroke = new BasicStroke(2, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 10.0f, new float[]{8.0f, 6.0f}, 0.0f);
            g2d.setStroke(dashedStroke);
            g2d.drawLine(40, 318, cardWidth - 40, 318);

            // 6. Rounded Container Frame around QR Code (from Official Standee Design)
            int frameWidth = 430;
            int frameHeight = 430;
            int frameX = (cardWidth - frameWidth) / 2;
            int frameY = 345;

            g2d.setColor(Color.WHITE);
            g2d.fillRoundRect(frameX, frameY, frameWidth, frameHeight, 28, 28);
            g2d.setColor(new Color(225, 225, 225));
            g2d.setStroke(new BasicStroke(2));
            g2d.drawRoundRect(frameX, frameY, frameWidth, frameHeight, 28, 28);

            // 7. Embedded QR Code inside Rounded Frame
            int qrSize = 390;
            int qrX = (cardWidth - qrSize) / 2;
            int qrY = frameY + (frameHeight - qrSize) / 2;

            byte[] qrBytes = generatePngQrCode(qrContent, qrSize, qrSize);
            BufferedImage qrImg = ImageIO.read(new ByteArrayInputStream(qrBytes));
            g2d.drawImage(qrImg, qrX, qrY, qrSize, qrSize, null);

            // 8. Footer Section (Scan. Pay. Done. & Member Branding)
            g2d.setColor(new Color(100, 100, 100));
            g2d.setFont(new Font("SansSerif", Font.PLAIN, 16));
            String tagline = "Scan. Pay. Done.";
            int tagWidth = g2d.getFontMetrics().stringWidth(tagline);
            g2d.drawString(tagline, (cardWidth - tagWidth) / 2, 805);

            // Member of KHQR footer text
            g2d.setFont(new Font("SansSerif", Font.BOLD, 13));
            g2d.setColor(new Color(226, 26, 26));
            g2d.drawString("Member of KHQR", 45, 855);

            g2d.setFont(new Font("SansSerif", Font.PLAIN, 13));
            g2d.setColor(new Color(110, 110, 110));
            String acceptText = "Accepted via Bakong & KHQR Banks";
            int accWidth = g2d.getFontMetrics().stringWidth(acceptText);
            g2d.drawString(acceptText, cardWidth - 45 - accWidth, 855);

            // Bottom Red Bar Accent
            g2d.setColor(new Color(226, 26, 26));
            g2d.fillRect(0, cardHeight - 12, cardWidth, 12);

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
