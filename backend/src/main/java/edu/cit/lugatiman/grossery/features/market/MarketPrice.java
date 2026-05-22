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

    @Column(nullable = false, unique = true)
    private String itemName;

    private Double price;
    private String unit;
    private String category;
    private String source;
    private Instant lastUpdated;
}
