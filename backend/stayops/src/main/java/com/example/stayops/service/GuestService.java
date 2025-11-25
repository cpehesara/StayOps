package com.example.stayops.service;

import com.example.stayops.dto.GuestCreateDTO;
import com.example.stayops.dto.GuestRegistrationDTO;
import com.example.stayops.dto.GuestResponseDTO;
import com.example.stayops.dto.GuestUpdateDTO;
import com.example.stayops.entity.GuestAccount;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface GuestService {

    /**
     * Create a guest and optionally upload an identity image.
     *
     * @param dto           Guest data (JSON)
     * @param identityImage Identity image file (optional)
     * @return created GuestResponseDTO
     */
    GuestResponseDTO createGuest(GuestCreateDTO dto, MultipartFile identityImage);

    /**
     * Update an existing guest and optionally upload a new identity image.
     *
     * @param guestId       Guest unique ID
     * @param dto           Updated guest data
     * @param identityImage New identity image file (optional)
     * @return updated GuestResponseDTO
     */
    GuestResponseDTO updateGuest(String guestId, GuestUpdateDTO dto, MultipartFile identityImage);

    /**
     * Get guest details by guest ID.
     *
     * @param guestId Guest unique ID
     * @return GuestResponseDTO
     */
    GuestResponseDTO getGuestById(String guestId);

    /**
     * Get all guests.
     *
     * @return List of GuestResponseDTO
     */
    List<GuestResponseDTO> getAllGuests();

    /**
     * Delete a guest by ID.
     *
     * @param guestId Guest unique ID
     */
    void deleteGuest(String guestId);

    /**
     * Register a guest from mobile app.
     *
     * @param dto GuestRegistrationDTO
     * @return created GuestAccount
     */
    GuestAccount registerGuestFromMobile(GuestRegistrationDTO dto);

    /**
     * Register a guest from web registration link (email confirmation flow)
     *
     * @param dto GuestRegistrationDTO
     * @param token Email confirmation token
     * @return created GuestAccount
     */
    GuestAccount registerGuestFromWeb(GuestRegistrationDTO dto, String token);

    /**
     * Return the guest's QR image as a full data URL (e.g. data:image/png;base64,...).
     * This is useful for frontends that want to render the image directly.
     *
     * @param guestId guest id
     * @return data url string or null if not present
     */
    String getGuestQrCodeDataUrl(String guestId);

    /**
     * Get guest information by email confirmation token
     *
     * @param token Email confirmation token
     * @return Guest email and ID
     */
    GuestResponseDTO getGuestByToken(String token);
}