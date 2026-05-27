package edu.cit.lugatiman.grossery.features.grocery;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class GroceryDto {
    private Long id;
    private String itemName;
    private String categoryName;
    private String unit;
    private Double expectedMonthlyConsumption;
    private LocalDate expirationDate;
    private List<String> receiptPaths;
}
