package edu.cit.lugatiman.grossery.features.consumption;

import lombok.Data;

@Data
public class ConsumptionDto {
    private String month;
    private Integer year;
    private Double actualConsumption;
}
