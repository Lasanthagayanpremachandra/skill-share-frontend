package com.skillshare.repository;

import com.skillshare.model.Post;
import com.skillshare.model.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Post> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.user.id IN (SELECT f.id FROM User u JOIN u.following f WHERE u.id = :userId)")
    Page<Post> findFollowingUsersPosts(Long userId, Pageable pageable);
    
    Page<Post> findByType(PostType type, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.content LIKE %:query%")
    List<Post> searchPosts(String query);
    
    @Query("SELECT COUNT(l) FROM Post p JOIN p.likes l WHERE p.id = :postId")
    Long countLikesByPostId(Long postId);
    
    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM Post p JOIN p.likes l WHERE p.id = :postId AND l.id = :userId")
    boolean isPostLikedByUser(Long postId, Long userId);
}
