package com.skillshare.repository;

import com.skillshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.name LIKE %:query% OR u.email LIKE %:query%")
    List<User> searchUsers(String query);
    
    @Query("SELECT u FROM User u WHERE u.id IN (SELECT f.id FROM User user JOIN user.following f WHERE user.id = :userId)")
    List<User> findFollowingByUserId(Long userId);
    
    @Query("SELECT u FROM User u WHERE u.id IN (SELECT f.id FROM User user JOIN user.followers f WHERE user.id = :userId)")
    List<User> findFollowersByUserId(Long userId);
}
