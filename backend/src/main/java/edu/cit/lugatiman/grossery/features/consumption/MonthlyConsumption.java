package edu.cit.lugatiman.grossery.features.consumption;

import edu.cit.lugatiman.grossery.features.grocery.GroceryItem;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "monthly_consumption")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyConsumption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "consumpt_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grocery_id", nullable = false)
    private GroceryItem groceryItem;

    @Column(name = "month")
    private String month;

    @Column(name = "year")
    private Integer year;

    @Column(name = "actual_consumption")
    private Double actualConsumption;

    @Column(name = "variance")
    private Double variance;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
