// TaskRepository.java (solo cambia esta línea, el resto queda igual)
package com.juanmera.tasksync.repositories;

import com.juanmera.tasksync.models.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    List<Task> findByTitleContainingIgnoreCase(String title);
    List<Task> findByCompleted(boolean completed);

    Page<Task> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Task> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
            String title,
            String content,
            Pageable pageable
    );
}