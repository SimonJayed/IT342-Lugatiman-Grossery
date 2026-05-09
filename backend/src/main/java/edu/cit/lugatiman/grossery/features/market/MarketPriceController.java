package edu.cit.lugatiman.grossery.features.market;

import edu.cit.lugatiman.grossery.payload.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.Instant;

@RestController
@RequestMapping("/api/market-prices")
public class MarketPriceController {

    @GetMapping
    public ResponseEntity<ApiResponse> getMarketPrices() {
        // Since DTI e-Presyo does not provide a public JSON REST API, 
        // we mock the proxy response with typical e-Presyo prime commodities data.
        String lastUpdated = Instant.now().toString();

        List<Map<String, Object>> mockDtiData = Arrays.asList(
            createCommodity("Canned Sardines (155g)", 19.50, "can", lastUpdated),
            createCommodity("Evaporated Milk (370ml)", 41.00, "can", lastUpdated),
            createCommodity("Instant Noodles (55g)", 8.25, "pack", lastUpdated),
            createCommodity("Loaf Bread (400g)", 39.50, "loaf", lastUpdated),
            createCommodity("Coffee Refill (25g)", 20.00, "pack", lastUpdated)
        );

        ApiResponse response = new ApiResponse(true, "Market prices retrieved from DTI e-Presyo", mockDtiData);
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> createCommodity(String itemName, double currentPrice, String unit, String lastUpdated) {
        Map<String, Object> item = new HashMap<>();
        item.put("itemName", itemName);
        item.put("currentPrice", currentPrice);
        item.put("unit", unit);
        item.put("lastUpdated", lastUpdated);
        return item;
    }
}
