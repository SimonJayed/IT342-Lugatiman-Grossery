package edu.cit.lugatiman.grossery.features.grocery;

import edu.cit.lugatiman.grossery.features.auth.User;
import edu.cit.lugatiman.grossery.features.consumption.MonthlyConsumption;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "grocery_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroceryItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "grocery_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "unit")
    private String unit;

    @Column(name = "expected_monthly_consumption")
    private Double expectedMonthlyConsumption;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @OneToMany(mappedBy = "groceryItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MonthlyConsumption> consumptionLogs;
}
