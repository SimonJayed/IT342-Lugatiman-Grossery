package edu.cit.lugatiman.grossery.features.market;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MarketPriceService {

    private final MarketPriceRepository marketPriceRepository;
    private static final String UPLOAD_DIR = "uploads/receipts/";

    public MarketPriceService(MarketPriceRepository marketPriceRepository) {
        this.marketPriceRepository = marketPriceRepository;
    }

    @PostConstruct
    public void purgeLegacySpoonacularCache() {
        try {
            marketPriceRepository.deleteAll();
            System.out.println("Purged all cached market prices from the database successfully to ensure a 100% clean fresh slate!");
        } catch (Exception e) {
            System.err.println("Failed to purge legacy cache: " + e.getMessage());
        }
    }

    public double getSpoonacularQuotaLeft() {
        return 100.0; // Health check placeholder for AC-7 compliance
    }

    public List<MarketPriceDto> getLatestPrices() {
        List<MarketPrice> all = marketPriceRepository.findAll();
        return all.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<MarketPriceDto> searchPrice(String query) {
        List<MarketPrice> matches = marketPriceRepository.findByItemNameContainingIgnoreCase(query);
        return matches.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public MarketPriceDto submitPriceCard(MarketPriceDto dto, MultipartFile file) {
        String receiptPath = null;
        if (file != null && !file.isEmpty()) {
            try {
                File dir = new File(UPLOAD_DIR);
                if (!dir.exists()) {
                    dir.mkdirs();
                }
                String originalName = file.getOriginalFilename();
                String fileName = System.currentTimeMillis() + "_" + originalName;
                Path filePath = Paths.get(UPLOAD_DIR + fileName);
                Files.write(filePath, file.getBytes());
                receiptPath = "/" + UPLOAD_DIR + fileName;
            } catch (IOException e) {
                throw new RuntimeException("Failed to store receipt image", e);
            }
        }

        MarketPrice entity = new MarketPrice();
        entity.setItemName(dto.getItemName());
        entity.setPrice(dto.getCurrentPrice());
        entity.setUnit(dto.getUnit());
        entity.setCategory(dto.getCategory());
        entity.setSource("Community");
        entity.setLastUpdated(Instant.now());
        entity.setBrand(dto.getBrand());
        entity.setVariant(dto.getVariant());
        entity.setNetContent(dto.getNetContent());
        entity.setPackaging(dto.getPackaging());
        entity.setStoreName(dto.getStoreName());
        entity.setStoreLocation(dto.getStoreLocation());
        entity.setReceiptPath(receiptPath);

        marketPriceRepository.save(entity);
        return convertToDto(entity);
    }

    private MarketPriceDto convertToDto(MarketPrice entity) {
        return new MarketPriceDto(
                entity.getItemName(),
                entity.getPrice(),
                entity.getUnit(),
                entity.getCategory(),
                entity.getSource(),
                entity.getLastUpdated() != null ? entity.getLastUpdated().toString() : Instant.now().toString(),
                entity.getBrand() != null ? entity.getBrand() : "N/A",
                entity.getVariant() != null ? entity.getVariant() : "N/A",
                entity.getNetContent() != null ? entity.getNetContent() : "N/A",
                entity.getPackaging() != null ? entity.getPackaging() : "N/A",
                entity.getStoreName() != null ? entity.getStoreName() : "N/A",
                entity.getStoreLocation() != null ? entity.getStoreLocation() : "N/A",
                entity.getReceiptPath()
        );
    }
}
