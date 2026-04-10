package edu.cit.lugatiman.grossery.repository;

import edu.cit.lugatiman.grossery.entity.GroceryItem;
import edu.cit.lugatiman.grossery.entity.MonthlyConsumption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MonthlyConsumptionRepository extends JpaRepository<MonthlyConsumption, Long> {
    Optional<MonthlyConsumption> findByGroceryItemAndMonthAndYear(GroceryItem groceryItem, String month, Integer year);
}
