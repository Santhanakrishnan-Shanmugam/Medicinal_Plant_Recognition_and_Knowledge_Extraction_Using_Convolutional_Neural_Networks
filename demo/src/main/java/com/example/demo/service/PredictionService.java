package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import java.io.IOException;
import java.util.Map;

@Service
public class PredictionService {

    private final String FLASK_API_URL ="http://192.168.127.24:5003/predict"; //http://192.168.127.24:5003
    public Map<String, Object> predict(MultipartFile file) throws IOException {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // Prepare the image as form data
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            // Send request to Flask API
            ResponseEntity<Map> response = restTemplate.exchange(FLASK_API_URL, HttpMethod.POST, requestEntity, Map.class);

            if (response.getBody() != null) {
                return response.getBody(); // Returns full JSON response from Flask
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Map.of("error", "Prediction failed!");
    }
}
