package com.skillshare.controller;

import com.skillshare.model.User;
import com.skillshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request
    ) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(user -> {
                    user.setName(request.name());
                    user.setBio(request.bio());
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/me/profile-picture")
    public ResponseEntity<?> updateProfilePicture(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file
    ) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(user -> {
                    // TODO: Handle profile picture upload and storage
                    // user.setProfilePicture(uploadedFileUrl);
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<?> followUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        if (userRepository.findByEmail(userDetails.getUsername()).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return userRepository.findById(id)
                .map(userToFollow -> {
                    User currentUser = userRepository.findByEmail(userDetails.getUsername()).get();
                    currentUser.getFollowing().add(userToFollow);
                    userRepository.save(currentUser);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<?> unfollowUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        if (userRepository.findByEmail(userDetails.getUsername()).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return userRepository.findById(id)
                .map(userToUnfollow -> {
                    User currentUser = userRepository.findByEmail(userDetails.getUsername()).get();
                    currentUser.getFollowing().remove(userToUnfollow);
                    userRepository.save(currentUser);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userRepository.searchUsers(query));
    }
}

record UpdateProfileRequest(
    String name,
    String bio
) {}
