package edu.cit.lugatiman.grossery.features.dashboard;

import lombok.Data;
import java.util.List;

@Data
public class DashboardComparisonDto {
    private String month;
    private Integer year;
    private List<ComparisonItemDto> items;

    @Data
    public static class ComparisonItemDto {
        private Long id;
        private String name;
        private Double expected;
        private Double actual;
        private Double variance;
    }
}
