package edu.cit.lugatiman.grossery.dto;

import lombok.Data;

@Data
public class ConsumptionDto {
    private String month;
    private Integer year;
    private Double actualConsumption;
}
