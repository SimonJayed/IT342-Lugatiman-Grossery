package edu.cit.lugatiman.grossery.features.market;

import edu.cit.lugatiman.grossery.payload.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping
    public ResponseEntity<ApiResponse> submitPriceCard(
            @RequestParam("itemName") String itemName,
            @RequestParam("price") Double price,
            @RequestParam("unit") String unit,
            @RequestParam("category") String category,
            @RequestParam("brand") String brand,
            @RequestParam("variant") String variant,
            @RequestParam("netContent") String netContent,
            @RequestParam("packaging") String packaging,
            @RequestParam("storeName") String storeName,
            @RequestParam("storeLocation") String storeLocation,
            @RequestParam(value = "receipt", required = false) MultipartFile file
    ) {
        MarketPriceDto dto = new MarketPriceDto();
        dto.setItemName(itemName);
        dto.setCurrentPrice(price);
        dto.setUnit(unit);
        dto.setCategory(category);
        dto.setSource("Community");
        dto.setBrand(brand);
        dto.setVariant(variant);
        dto.setNetContent(netContent);
        dto.setPackaging(packaging);
        dto.setStoreName(storeName);
        dto.setStoreLocation(storeLocation);

        MarketPriceDto saved = marketPriceService.submitPriceCard(dto, file);
        return ResponseEntity.ok(new ApiResponse(true, "Community price card submitted successfully", saved));
    }
}
