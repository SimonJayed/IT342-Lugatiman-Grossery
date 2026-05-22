package edu.cit.lugatiman.grossery.features.market;

import edu.cit.lugatiman.grossery.payload.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestParam;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market-prices")
public class MarketPriceController {

    private final MarketPriceService marketPriceService;

    public MarketPriceController(MarketPriceService marketPriceService) {
        this.marketPriceService = marketPriceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getMarketPrices(@RequestParam(required = false) String query) {
        if (query != null && !query.trim().isEmpty()) {
            List<MarketPriceDto> prices = marketPriceService.searchPrice(query.trim());
            double quotaLeft = marketPriceService.getSpoonacularQuotaLeft();
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("prices", prices);
            responseData.put("spoonacularQuotaLeft", quotaLeft);
            
            ApiResponse response = new ApiResponse(true, "Market price search successful", responseData);
            return ResponseEntity.ok(response);
        }

        List<MarketPriceDto> prices = marketPriceService.getLatestPrices();
        double quotaLeft = marketPriceService.getSpoonacularQuotaLeft();
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("prices", prices);
        responseData.put("spoonacularQuotaLeft", quotaLeft);

        ApiResponse response = new ApiResponse(true, "Market prices retrieved successfully", responseData);
        return ResponseEntity.ok(response);
    }
}
