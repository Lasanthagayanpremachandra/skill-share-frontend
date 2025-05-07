package com.skillshare.repository;

import com.skillshare.model.LearningPlan;
import com.skillshare.model.PlanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    Page<LearningPlan> findByUserId(Long userId, Pageable pageable);
    
    List<LearningPlan> findByUserIdAndStatus(Long userId, PlanStatus status);
    
    @Query("SELECT lp FROM LearningPlan lp WHERE lp.title LIKE %:query% OR lp.description LIKE %:query%")
    List<LearningPlan> searchLearningPlans(String query);
    
    @Query("SELECT lp FROM LearningPlan lp WHERE lp.user.id IN (SELECT f.id FROM User u JOIN u.following f WHERE u.id = :userId)")
    Page<LearningPlan> findFollowingUsersLearningPlans(Long userId, Pageable pageable);

    List<LearningPlan> findByUserIdOrderByCreatedAtDesc(Long userId);
}
