package com.skillshare.controller;

import com.skillshare.model.LearningPlan;
import com.skillshare.model.LearningStep;
import com.skillshare.model.User;
import com.skillshare.repository.LearningPlanRepository;
import com.skillshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/learning-plans")
@RequiredArgsConstructor
public class LearningPlanController {

    private final LearningPlanRepository learningPlanRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<LearningPlan>> getLearningPlans(Pageable pageable) {
        return ResponseEntity.ok(learningPlanRepository.findAll(pageable));
    }

    @GetMapping("/my-plans")
    public ResponseEntity<Page<LearningPlan>> getMyLearningPlans(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(learningPlanRepository.findByUserId(user.getId(), pageable));
    }

    @PostMapping
    public ResponseEntity<LearningPlan> createLearningPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody LearningPlanRequest request
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        LearningPlan plan = new LearningPlan();
        plan.setTitle(request.title());
        plan.setDescription(request.description());
        plan.setUser(user);
        plan.setTargetCompletionDate(request.targetCompletionDate());

        if (request.steps() != null) {
            for (int i = 0; i < request.steps().size(); i++) {
                LearningStepRequest stepRequest = request.steps().get(i);
                LearningStep step = new LearningStep();
                step.setTitle(stepRequest.title());
                step.setDescription(stepRequest.description());
                step.setResourceUrl(stepRequest.resourceUrl());
                step.setOrderIndex(i);
                step.setLearningPlan(plan);
                plan.getSteps().add(step);
            }
        }

        return ResponseEntity.ok(learningPlanRepository.save(plan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLearningPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody LearningPlanRequest request
    ) {
        return learningPlanRepository.findById(id)
                .map(plan -> {
                    if (!plan.getUser().getEmail().equals(userDetails.getUsername())) {
                        return ResponseEntity.badRequest()
                                .body("You can only update your own learning plans");
                    }
                    plan.setTitle(request.title());
                    plan.setDescription(request.description());
                    plan.setTargetCompletionDate(request.targetCompletionDate());
                    
                    // Update steps
                    plan.getSteps().clear();
                    if (request.steps() != null) {
                        for (int i = 0; i < request.steps().size(); i++) {
                            LearningStepRequest stepRequest = request.steps().get(i);
                            LearningStep step = new LearningStep();
                            step.setTitle(stepRequest.title());
                            step.setDescription(stepRequest.description());
                            step.setResourceUrl(stepRequest.resourceUrl());
                            step.setOrderIndex(i);
                            step.setLearningPlan(plan);
                            plan.getSteps().add(step);
                        }
                    }
                    
                    return ResponseEntity.ok(learningPlanRepository.save(plan));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLearningPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        return learningPlanRepository.findById(id)
                .map(plan -> {
                    if (!plan.getUser().getEmail().equals(userDetails.getUsername())) {
                        return ResponseEntity.badRequest()
                                .body("You can only delete your own learning plans");
                    }
                    learningPlanRepository.delete(plan);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

record LearningPlanRequest(
    String title,
    String description,
    java.time.LocalDateTime targetCompletionDate,
    List<LearningStepRequest> steps
) {}

record LearningStepRequest(
    String title,
    String description,
    String resourceUrl
) {}
