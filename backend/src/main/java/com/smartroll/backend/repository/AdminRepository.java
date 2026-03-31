package com.smartroll.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartroll.backend.entity.Admin;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {

    Optional<Admin> findByUserId(Integer userId);

    Optional<Admin> findByEmail(String email);
}
