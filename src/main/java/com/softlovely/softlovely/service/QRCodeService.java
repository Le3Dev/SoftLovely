package com.softlovely.softlovely.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.Base64;

@Service
public class QRCodeService {

    @Value("${app.base-url}")
    private String baseUrl;

    public String generateQRCodeBase64(String data, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, width, height);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        
        byte[] qrCodeBytes = outputStream.toByteArray();
        String base64QRCode = Base64.getEncoder().encodeToString(qrCodeBytes);
        
        return "data:image/png;base64," + base64QRCode;
    }

    public String generateQRCodeForCouple(String uniqueHash) throws Exception {
        String url = baseUrl + "/c/" + uniqueHash;
        return generateQRCodeBase64(url, 300, 300);
    }

    public String generateUniqueHash(String coupleId) {
        return java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 32);
    }
}

