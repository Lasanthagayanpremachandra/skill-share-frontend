package com.skillshare.controller;

import com.skillshare.dto.PostRequest;
import com.skillshare.model.Post;
import com.skillshare.model.PostType;
import com.skillshare.model.User;
import com.skillshare.repository.PostRepository;
import com.skillshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<Post>> getPosts(Pageable pageable) {
        return ResponseEntity.ok(postRepository.findAll(pageable));
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<Post>> getFeed(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(postRepository.findFollowingUsersPosts(user.getId(), pageable));
    }

    @PostMapping
    public ResponseEntity<Post> createPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PostRequest postRequest
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setContent(postRequest.getContent());
        post.setUser(user);
        post.setType(PostType.valueOf(postRequest.getType()));

        // Handle media URLs if provided
        // This would typically involve storing the URLs in the post entity
        // You might need to add a mediaUrls field to your Post entity

        return ResponseEntity.ok(postRepository.save(post));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody Post updatedPost
    ) {
        return postRepository.findById(id)
                .map(post -> {
                    if (!post.getUser().getEmail().equals(userDetails.getUsername())) {
                        return ResponseEntity.badRequest()
                                .body("You can only update your own posts");
                    }
                    post.setContent(updatedPost.getContent());
                    return ResponseEntity.ok(postRepository.save(post));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        return postRepository.findById(id)
                .map(post -> {
                    if (!post.getUser().getEmail().equals(userDetails.getUsername())) {
                        return ResponseEntity.badRequest()
                                .body("You can only delete your own posts");
                    }
                    postRepository.delete(post);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return postRepository.findById(id)
                .map(post -> {
                    post.getLikes().add(user);
                    return ResponseEntity.ok(postRepository.save(post));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikePost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return postRepository.findById(id)
                .map(post -> {
                    post.getLikes().remove(user);
                    return ResponseEntity.ok(postRepository.save(post));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
