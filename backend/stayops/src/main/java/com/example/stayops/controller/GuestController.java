package com.example.stayops.controller;

import com.example.stayops.dto.GuestCreateDTO;
import com.example.stayops.dto.GuestRegistrationDTO;
import com.example.stayops.dto.GuestResponseDTO;
import com.example.stayops.entity.GuestAccount;
import com.example.stayops.service.GuestService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/v1/guests")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class GuestController {

    private final GuestService guestService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GuestResponseDTO> createGuest(
            @RequestPart("guest") String guestJson,
            @RequestPart(value = "identityImage", required = false) MultipartFile identityImage) throws IOException {

        GuestCreateDTO guestDto = objectMapper.readValue(guestJson, GuestCreateDTO.class);

        GuestResponseDTO response = guestService.createGuest(guestDto, identityImage);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<GuestAccount> registerGuest(@Valid @RequestBody GuestRegistrationDTO dto) {
        return new ResponseEntity<>(guestService.registerGuestFromMobile(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuestResponseDTO> getGuest(@PathVariable("id") String guestId) {
        return ResponseEntity.ok(guestService.getGuestById(guestId));
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<GuestResponseDTO>> getAllGuests() {
        return ResponseEntity.ok(guestService.getAllGuests());
    }

    /**
     * New endpoint:
     * Returns the QR image bytes directly with a correct Content-Type so frontend can fetch:
     * <img src="http://.../api/v1/guests/{id}/qr" />
     */
    @GetMapping("/{id}/qr")
    public ResponseEntity<byte[]> getGuestQrImage(@PathVariable("id") String guestId) {
        String dataUrl = guestService.getGuestQrCodeDataUrl(guestId);
        if (dataUrl == null) {
            return ResponseEntity.notFound().build();
        }

        // dataUrl format: data:<mime-type>;base64,<payload>
        try {
            if (!dataUrl.contains(",")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
            String[] parts = dataUrl.split(",", 2);
            String meta = parts[0]; // e.g. data:image/png;base64
            String base64 = parts[1];

            String mime = "image/png";
            if (meta.contains(":") && meta.contains(";")) {
                mime = meta.substring(meta.indexOf(":") + 1, meta.indexOf(";"));
            }

            byte[] imageBytes = Base64.getDecoder().decode(base64);
            MediaType mediaType = MediaType.parseMediaType(mime);
            return ResponseEntity.ok().contentType(mediaType).body(imageBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
