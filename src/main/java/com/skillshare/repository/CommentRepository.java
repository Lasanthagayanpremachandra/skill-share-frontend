package com.skillshare.repository;

import com.skillshare.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByPostId(Long postId, Pageable pageable);
    
    Page<Comment> findByUserId(Long userId, Pageable pageable);
    
    void deleteByPostId(Long postId);
    
    boolean existsByIdAndUserId(Long id, Long userId);
    
    boolean existsByIdAndPostUserId(Long id, Long userId);
}
