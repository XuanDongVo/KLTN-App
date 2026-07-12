package com.example.englishapp_server.repository.jpa.unit;

import com.example.englishapp_server.entity.UnitVocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UnitVocabularyRepository extends JpaRepository<UnitVocabulary, Long> {
    @Modifying
    @Query("DELETE FROM UnitVocabulary v WHERE v.unitImage.id = :imageId")
    void deleteByUnitImageId(@Param("imageId") Long imageId);
}
