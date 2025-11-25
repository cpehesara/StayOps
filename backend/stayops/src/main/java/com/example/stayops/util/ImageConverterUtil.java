package com.example.stayops.util;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.Base64;

public class ImageConverterUtil {

    // --- Original methods (kept as-is) ---

    public static File base64ToPng(String base64Image, String outputPath) throws IOException {
        if (base64Image.contains(",")){
            base64Image = base64Image.split(",")[1];
        }

        byte[] imageBytes = Base64.getDecoder().decode(base64Image);
        try (OutputStream out = new FileOutputStream(outputPath)){
            out.write(imageBytes);
        }
        return new File(outputPath);
    }

    public static String pngToBase64(File file) throws IOException {
        BufferedImage bufferedImage = ImageIO.read(file);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "png", outputStream);

        return Base64.getEncoder().encodeToString(outputStream.toByteArray());
    }

    // made static (was non-static in your snippet) so other classes can call it directly
    public static BufferedImage base64ToBufferedImage (String base64Image) throws IOException {
        if (base64Image.contains(",")){
            base64Image = base64Image.split(",")[1];
        }
        byte[] imageBytes = Base64.getDecoder().decode(base64Image);
        try (InputStream in = new ByteArrayInputStream(imageBytes)){
            return ImageIO.read(in);
        }
    }

    public static String bufferedImageToBase64(BufferedImage image) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(image, "png", outputStream);
        return Base64.getEncoder().encodeToString(outputStream.toByteArray());
    }

    // --- New helper methods (added) ---

    /**
     * Convert a base64 or data-url string into raw bytes.
     */
    public static byte[] base64ToBytes(String base64Image) {
        if (base64Image == null) return null;
        if (base64Image.contains(",")) {
            base64Image = base64Image.split(",")[1];
        }
        return Base64.getDecoder().decode(base64Image);
    }

    /**
     * Convert raw image bytes to a data URL string like: data:image/png;base64,<payload>
     * Attempts to detect PNG/JPEG. Falls back to image/png if uncertain.
     */
    public static String bytesToBase64DataUrl(byte[] imageBytes) {
        if (imageBytes == null) return null;
        String mime = detectImageMimeType(imageBytes);
        String base64 = Base64.getEncoder().encodeToString(imageBytes);
        return "data:" + mime + ";base64," + base64;
    }

    /**
     * Basic mime type detection for common image formats based on magic numbers.
     * Supports png and jpeg detection; falls back to image/png.
     */
    public static String detectImageMimeType(byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length < 4) {
            return "image/png";
        }

        // PNG: 89 50 4E 47
        if ((imageBytes[0] & 0xFF) == 0x89 &&
                (imageBytes[1] & 0xFF) == 0x50 &&
                (imageBytes[2] & 0xFF) == 0x4E &&
                (imageBytes[3] & 0xFF) == 0x47) {
            return "image/png";
        }

        // JPEG: FF D8 FF
        if ((imageBytes[0] & 0xFF) == 0xFF &&
                (imageBytes[1] & 0xFF) == 0xD8 &&
                (imageBytes[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }

        // default
        return "image/png";
    }
}
