package edu.cit.lugatiman.grossery.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "receipt")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receipt_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grocery_id", nullable = false)
    private GroceryItem groceryItem;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
