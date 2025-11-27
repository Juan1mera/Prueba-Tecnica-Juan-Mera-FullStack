package com.juanmera.tasksync.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @Column(length = 36)
    private String id = UUID.randomUUID().toString();

    @Column(length = 36, unique = true, nullable = false)
    private String name;

    @Column(length = 255, nullable = false)
    private String image;

    @Column(length = 255, nullable = false)
    private String route;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserHasRoles> userHasRoles = new HashSet<>();

    public Role() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

