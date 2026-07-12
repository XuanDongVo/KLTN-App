package com.example.englishapp_server.repository.jpa.unit;
import com.example.englishapp_server.entity.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {
    @Query("SELECT q FROM QuestionBank q JOIN FETCH q.unit WHERE q.unit.id = :unitId")
    List<QuestionBank> findByUnitId(@Param("unitId") Long unitId);
    @Query(value = "SELECT * FROM question_banks WHERE unit_id = :unitId ORDER BY RAND() LIMIT 5", nativeQuery = true)
    List<QuestionBank> findRandom5ByUnitId(@Param("unitId") Long unitId);

}