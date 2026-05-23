package edu.cit.lugatiman.grossery.features.market;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MarketPriceDto {
    private String itemName;
    private Double currentPrice;
    private String unit;
    private String category;
    private String source; // DTI, Spoonacular, or Mock
    private String lastUpdated;
    
    // Detailed Product Attributes
    private String brand;
    private String variant;
    private String netContent;
    private String packaging;

    // Community Attributes
    private String storeName;
    private String storeLocation;
    private String receiptPath;

    // Backward-compatible 6-argument constructor
    public MarketPriceDto(String itemName, Double currentPrice, String unit, String category, String source, String lastUpdated) {
        this.itemName = itemName;
        this.currentPrice = currentPrice;
        this.unit = unit;
        this.category = category;
        this.source = source;
        this.lastUpdated = lastUpdated;
        this.brand = "N/A";
        this.variant = "N/A";
        this.netContent = "N/A";
        this.packaging = "N/A";
        this.storeName = "N/A";
        this.storeLocation = "N/A";
        this.receiptPath = null;
    }
}
