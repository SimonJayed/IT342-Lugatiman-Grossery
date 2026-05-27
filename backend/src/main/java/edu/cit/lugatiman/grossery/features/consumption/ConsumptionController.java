package edu.cit.lugatiman.grossery.features.consumption;


import edu.cit.lugatiman.grossery.payload.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groceries")
public class ConsumptionController {

    @Autowired
    private ConsumptionService consumptionService;

    @PostMapping("/{id}/consumption")
    public ResponseEntity<ApiResponse> logConsumption(@PathVariable Long id, @RequestBody ConsumptionDto dto, Authentication authentication) {
        String email = authentication.getName();
        ConsumptionResponseDto responseDto = consumptionService.logConsumption(email, id, dto);
        return ResponseEntity.ok(new ApiResponse(true, "Consumption logged successfully", responseDto));
    }
}
