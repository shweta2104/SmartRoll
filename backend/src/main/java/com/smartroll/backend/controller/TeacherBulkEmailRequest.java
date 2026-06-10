package com.smartroll.backend.controller;

import java.util.List;

public class TeacherBulkEmailRequest {

    public List<Long> teacherIds;
    public String subject;
    public String body;

    public TeacherBulkEmailRequest() {
    }

    public TeacherBulkEmailRequest(List<Long> teacherIds, String subject, String body) {
        this.teacherIds = teacherIds;
        this.subject = subject;
        this.body = body;
    }

    public List<Long> getTeacherIds() {
        return teacherIds;
    }

    public void setTeacherIds(List<Long> teacherIds) {
        this.teacherIds = teacherIds;
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
