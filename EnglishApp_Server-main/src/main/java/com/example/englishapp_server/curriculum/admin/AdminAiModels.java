package com.example.englishapp_server.curriculum.admin;

import java.util.List;

public class AdminAiModels {
    
    public static class ImageCaptionRequest {
        private String imageUrl;

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }

    public static class ImageCaptionResponse {
        private String caption;
        private double confidence;
        private List<String> objects;
        private String source;

        public String getCaption() {
            return caption;
        }

        public void setCaption(String caption) {
            this.caption = caption;
        }

        public double getConfidence() {
            return confidence;
        }

        public void setConfidence(double confidence) {
            this.confidence = confidence;
        }

        public List<String> getObjects() {
            return objects;
        }

        public void setObjects(List<String> objects) {
            this.objects = objects;
        }

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }
    }
}
