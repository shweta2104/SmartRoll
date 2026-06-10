package com.smartroll.backend.controller;

import java.util.List;

public class StudentBulkEmailRequest {

    public List<Long> studentIds;
    public String subject;
    public String body;

    public StudentBulkEmailRequest() {
    }

    public StudentBulkEmailRequest(List<Long> studentIds, String subject, String body) {
        this.studentIds = studentIds;
        this.subject = subject;
        this.body = body;
    }

    public List<Long> getStudentIds() {
        return studentIds;
    }

    public void setStudentIds(List<Long> studentIds) {
        this.studentIds = studentIds;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
}
