package edu.cit.lugatiman.grossery.features.consumption;


import edu.cit.lugatiman.grossery.features.grocery.GroceryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface MonthlyConsumptionRepository extends JpaRepository<MonthlyConsumption, Long> {
    Optional<MonthlyConsumption> findByGroceryItemAndMonthAndYear(GroceryItem groceryItem, String month, Integer year);
    
    @Modifying
    @Transactional
    void deleteByGroceryItem(GroceryItem groceryItem);
}
