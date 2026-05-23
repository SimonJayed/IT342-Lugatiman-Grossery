package edu.cit.lugatiman.grossery.features.market;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "market_prices")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MarketPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String itemName;

    private Double price;
    private String unit;
    private String category;
    private String source;
    private Instant lastUpdated;

    // Detailed Product Attributes
    private String brand;
    private String variant;
    private String netContent;
    private String packaging;

    // Community Attributes
    private String storeName;
    private String storeLocation;
    private String receiptPath;
}
