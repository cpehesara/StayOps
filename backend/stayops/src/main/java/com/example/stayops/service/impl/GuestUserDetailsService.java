package com.example.stayops.service.impl;

import com.example.stayops.entity.GuestAccount;
import com.example.stayops.repository.GuestAccountRepository;
import com.example.stayops.security.GuestUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GuestUserDetailsService implements UserDetailsService {

    private final GuestAccountRepository guestAccountRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Attempting to load user with email: {}", email);

        GuestAccount guestAccount = guestAccountRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("Guest account not found for email: {}", email);
                    return new UsernameNotFoundException("Guest account not found with email: " + email);
                });

        log.debug("Found guest account for email: {}, activated: {}", email, guestAccount.isActivated());

        return new GuestUserDetails(guestAccount);
    }

    public boolean existsByEmail(String email) {
        return guestAccountRepository.findByEmail(email).isPresent();
    }
}