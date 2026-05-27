package edu.cit.lugatiman.grossery.features.dashboard;


import edu.cit.lugatiman.grossery.payload.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/comparison")
    public ResponseEntity<ApiResponse> getComparison(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) Integer year,
            Authentication authentication) {
        String email = authentication.getName();
        DashboardComparisonDto comparison = dashboardService.getComparisonData(email, month, year);
        return ResponseEntity.ok(new ApiResponse(true, "Dashboard comparison retrieved", comparison));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse> getSummary(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) Integer year,
            Authentication authentication) {
        String email = authentication.getName();
        DashboardComparisonDto summary = dashboardService.getComparisonData(email, month, year);
        return ResponseEntity.ok(new ApiResponse(true, "Dashboard summary retrieved", summary));
    }
}
