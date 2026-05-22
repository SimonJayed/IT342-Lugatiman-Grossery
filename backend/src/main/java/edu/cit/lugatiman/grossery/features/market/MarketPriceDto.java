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
}
