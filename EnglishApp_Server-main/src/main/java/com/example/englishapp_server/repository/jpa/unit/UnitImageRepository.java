package com.example.englishapp_server.repository.jpa.unit;

import com.example.englishapp_server.entity.UnitImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UnitImageRepository extends JpaRepository<UnitImage, Long> {
    @Query("SELECT DISTINCT u FROM UnitImage u LEFT JOIN FETCH u.vocabularies WHERE u.unit.id = :unitId AND u.isDeleted = false")
    List<UnitImage> findByUnitIdAndIsDeletedFalse(@Param("unitId") Long unitId);
}