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

            // 3. Merchant / Company Name Section (No redundant grey label above)
            String displayName = (merchantName != null && !merchantName.isBlank()) ? merchantName : "Company Name";
            g2d.setColor(new Color(20, 20, 20));
            g2d.setFont(new Font("SansSerif", Font.BOLD, 26));
            g2d.drawString(displayName, 50, 195);

            // 4. Formatted Amount & Currency Section
            int currentY = 245;
            if (amount != null && amount > 0) {
                String formattedAmt;
                if ("KHR".equalsIgnoreCase(currency)) {
                    formattedAmt = new DecimalFormat("#,##0").format(amount);
                } else {
                    formattedAmt = new DecimalFormat("#,##0.00").format(amount);
                }
                String currStr = (currency != null ? currency.toUpperCase() : "USD");

                g2d.setColor(Color.BLACK);
                g2d.setFont(new Font("SansSerif", Font.BOLD, 40));
                g2d.drawString(formattedAmt, 50, currentY);

                int amtWidth = g2d.getFontMetrics().stringWidth(formattedAmt);
                g2d.setFont(new Font("SansSerif", Font.BOLD, 22));
                g2d.setColor(new Color(60, 60, 60));
                g2d.drawString(currStr, 50 + amtWidth + 12, currentY - 4);

                currentY += 40;
            } else {
                currentY += 15;
            }

            // 5. Dashed Separator Line
            g2d.setColor(new Color(210, 210, 210));
            Stroke dashedStroke = new BasicStroke(2, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 10.0f, new float[]{8.0f, 6.0f}, 0.0f);
            g2d.setStroke(dashedStroke);
            int lineY = Math.max(285, currentY);
            g2d.drawLine(40, lineY, cardWidth - 40, lineY);

            // 6. Rounded Container Frame around QR Code (from Official Standee/Tag Design)
            int frameWidth = 440;
            int frameHeight = 440;
            int frameX = (cardWidth - frameWidth) / 2;
            int frameY = lineY + 25;

            g2d.setColor(Color.WHITE);
            g2d.fillRoundRect(frameX, frameY, frameWidth, frameHeight, 24, 24);
            g2d.setColor(new Color(230, 230, 230));
            g2d.setStroke(new BasicStroke(2));
            g2d.drawRoundRect(frameX, frameY, frameWidth, frameHeight, 24, 24);

            // 7. Embedded QR Code inside Rounded Frame
            int qrSize = 400;
            int qrX = (cardWidth - qrSize) / 2;
            int qrY = frameY + (frameHeight - qrSize) / 2;

            byte[] qrBytes = generatePngQrCode(qrContent, qrSize, qrSize);
            BufferedImage qrImg = ImageIO.read(new ByteArrayInputStream(qrBytes));
            g2d.drawImage(qrImg, qrX, qrY, qrSize, qrSize, null);

            // 8. Footer Section (Scan. Pay. Done. & Member Branding)
            int footerStartY = frameY + frameHeight + 35;
            g2d.setColor(new Color(110, 110, 110));
            g2d.setFont(new Font("SansSerif", Font.PLAIN, 16));
            String tagline = "Scan. Pay. Done.";
            int tagWidth = g2d.getFontMetrics().stringWidth(tagline);
            g2d.drawString(tagline, (cardWidth - tagWidth) / 2, footerStartY);

            // Member of KHQR footer logo
            int memberY = footerStartY + 30;
            g2d.setFont(new Font("SansSerif", Font.PLAIN, 12));
            g2d.setColor(new Color(130, 130, 130));
            g2d.drawString("Member of", 45, memberY);

            boolean redLogoDrawn = false;
            try (InputStream redLogoStream = QrImageUtils.class.getResourceAsStream("/assets/khqr/KHQR Logo red.png")) {
                if (redLogoStream != null) {
                    BufferedImage redLogoImg = ImageIO.read(redLogoStream);
                    if (redLogoImg != null) {
                        int rLogoWidth = 110;
                        int rLogoHeight = (int) ((double) redLogoImg.getHeight() / redLogoImg.getWidth() * rLogoWidth);
                        g2d.drawImage(redLogoImg, 45, memberY + 8, rLogoWidth, rLogoHeight, null);
                        redLogoDrawn = true;
                    }
                }
            } catch (Exception ignored) {
            }

            if (!redLogoDrawn) {
                try (InputStream bgLogoStream = QrImageUtils.class.getResourceAsStream("/assets/khqr/KHQR available here - logo with bg.png")) {
                    if (bgLogoStream != null) {
                        BufferedImage bgLogoImg = ImageIO.read(bgLogoStream);
                        if (bgLogoImg != null) {
                            int rLogoWidth = 100;
                            int rLogoHeight = (int) ((double) bgLogoImg.getHeight() / bgLogoImg.getWidth() * rLogoWidth);
                            g2d.drawImage(bgLogoImg, 45, memberY + 8, rLogoWidth, rLogoHeight, null);
                            redLogoDrawn = true;
                        }
                    }
                } catch (Exception ignored) {
                }
            }

            if (!redLogoDrawn) {
                g2d.setFont(new Font("SansSerif", Font.BOLD, 14));
                g2d.setColor(new Color(226, 26, 26));
                g2d.drawString("KHQR", 45, memberY + 22);
            }

            g2d.setFont(new Font("SansSerif", Font.PLAIN, 12));
            g2d.setColor(new Color(130, 130, 130));
            String acceptLabel = "Accepted here";
            int accLblWidth = g2d.getFontMetrics().stringWidth(acceptLabel);
            g2d.drawString(acceptLabel, cardWidth - 45 - accLblWidth, memberY);

            g2d.setFont(new Font("SansSerif", Font.BOLD, 13));
            g2d.setColor(new Color(30, 30, 30));
            String acceptText = "Bakong & KHQR Banks";
            int accWidth = g2d.getFontMetrics().stringWidth(acceptText);
            g2d.drawString(acceptText, cardWidth - 45 - accWidth, memberY + 20);

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
