package com.example.englishapp_server.repository.jpa.unit;


import com.example.englishapp_server.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {
    List<Unit> findByIsDeletedFalse();
}
