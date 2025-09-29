package com.example.stayops.exception;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
    ApiError error = new ApiError(HttpStatus.NOT_FOUND, ex.getMessage());
    return new ResponseEntity<>(error, error.getStatus());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
    String msg = ex.getBindingResult().getFieldErrors()
            .stream()
            .map(fe -> fe.getField() + " : " + fe.getDefaultMessage())
            .collect(Collectors.joining("; "));
    ApiError error = new ApiError(HttpStatus.BAD_REQUEST, "Validation failed: " + msg);
    return new ResponseEntity<>(error, error.getStatus());
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException ex) {
    ApiError error = new ApiError(HttpStatus.BAD_REQUEST, "Validation failed: " + ex.getMessage());
    return new ResponseEntity<>(error, error.getStatus());
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiError> handleAll(Exception ex) {
    log.error("Unhandled exception", ex);
    ApiError error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", ex.getMessage());
    return new ResponseEntity<>(error, error.getStatus());
  }
}
