package com.example.demo.controller;

import com.example.demo.service.PredictionService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.io.IOException;
import java.util.Map;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class ImageController {

    private final PredictionService predictionService;

    // ✅ Constructor Injection (Best Practice)
    public ImageController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping("/predict")
    public ResponseEntity<?> predict(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> prediction = predictionService.predict(file);
            return ResponseEntity.ok(prediction); // ✅ Return full response as JSON
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Prediction failed!"));
        }
    }
}
