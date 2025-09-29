package com.example.stayops.security;

import com.example.stayops.entity.GuestAccount;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.Objects;

@Getter
public class GuestUserDetails implements UserDetails {

    private final GuestAccount guestAccount;

    public GuestUserDetails(GuestAccount guestAccount) {
        this.guestAccount = Objects.requireNonNull(guestAccount, "GuestAccount cannot be null");
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_GUEST"));
    }

    @Override
    public String getPassword() {
        return guestAccount.getPassword();
    }

    @Override
    public String getUsername() {
        return guestAccount.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // You can add logic here if you want to handle account expiration
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // You can add logic here if you want to handle account locking
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // You can add logic here if you want to handle credential expiration
    }

    @Override
    public boolean isEnabled() {
        return guestAccount.isActivated();
    }

    // Additional utility methods
    public String getEmail() {
        return guestAccount.getEmail();
    }

    public String getGuestId() {
        return guestAccount.getGuest() != null ? guestAccount.getGuest().getGuestId() : null;
    }

    public String getFullName() {
        if (guestAccount.getGuest() != null) {
            return guestAccount.getGuest().getFirstName() + " " + guestAccount.getGuest().getLastName();
        }
        return null;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        GuestUserDetails that = (GuestUserDetails) obj;
        return Objects.equals(guestAccount.getEmail(), that.guestAccount.getEmail());
    }

    @Override
    public int hashCode() {
        return Objects.hash(guestAccount.getEmail());
    }

    @Override
    public String toString() {
        return "GuestUserDetails{" +
                "email='" + guestAccount.getEmail() + '\'' +
                ", activated=" + guestAccount.isActivated() +
                '}';
    }
}