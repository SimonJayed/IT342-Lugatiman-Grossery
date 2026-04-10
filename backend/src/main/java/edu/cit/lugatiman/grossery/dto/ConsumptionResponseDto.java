package edu.cit.lugatiman.grossery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ConsumptionResponseDto {
    private Double variance;
    private String status;
}
