import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  Login as LoginIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

import { guestAuthAPI } from "../api/guestAuth";

const TestGuestLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [response, setResponse] = useState(null);
  const [tokenValidation, setTokenValidation] = useState(null);
  const [formData, setFormData] = useState({
    email: "test@example.com",
    password: "password123",
  });

  const [credentialOptions] = useState([
    { email: "test@example.com", password: "password123", label: "Default Test User" },
    { email: "guest@hotel.com", password: "guest123", label: "Hotel Guest" },
    { email: "admin@hotel.com", password: "admin123", label: "Admin User" },
    { email: "user@example.com", password: "user123", label: "Example User" },
    { email: "demo@demo.com", password: "demo", label: "Demo User" },
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const testLogin = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setResponse(null);
    setTokenValidation(null);

    try {
      console.log("Testing login with:", formData);
      
      const loginResponse = await guestAuthAPI.login(formData);
      
      setSuccess("Login successful!");
      setResponse({
        type: "login",
        status: "success",
        data: loginResponse,
        token: loginResponse.token || loginResponse.accessToken || loginResponse.jwtToken || "No token found",
      });

    } catch (error) {
      console.error("Login test error:", error);
      setError(`Login failed: ${error.message}`);
      setResponse({
        type: "login",
        status: "error",
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testTokenValidation = async () => {
    const token = guestAuthAPI.getToken();
    if (!token) {
      setError("No token found. Please login first.");
      return;
    }

    setLoading(true);
    try {
      const isValid = await guestAuthAPI.validateToken(token);
      
      setTokenValidation({
        token: token,
        isValid: isValid,
        timestamp: new Date().toISOString(),
      });
      
      if (isValid) {
        setSuccess("Token is valid!");
      } else {
        setError("Token is invalid or expired");
      }
    } catch (error) {
      console.error("Token validation error:", error);
      setError(`Token validation failed: ${error.message}`);
      setTokenValidation({
        token: token,
        isValid: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setError("");
    setResponse(null);
    
    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "OPTIONS",
      });
      
      setSuccess("Connection to backend successful!");
      setResponse({
        type: "connection",
        status: "success",
        message: "Backend server is reachable",
        serverStatus: response.status
      });
    } catch (error) {
      setError(`Cannot connect to backend: ${error.message}`);
      setResponse({
        type: "connection",
        status: "error",
        error: error.message,
        suggestion: "Make sure your Spring Boot application is running on localhost:8080"
      });
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (credentials) => {
    setFormData(credentials);
    setError("");
    setSuccess("");
    setResponse(null);
  };

  const testEndpointAvailability = async () => {
    setLoading(true);
    setError("");
    setResponse(null);
    
    try {
      // Test if the endpoint exists with a HEAD request
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "HEAD",
      });
      
      setResponse({
        type: "endpoint-test",
        status: "success",
        message: "Auth endpoint is available",
        statusCode: response.status,
        headers: [...response.headers.entries()],
      });
      
      setSuccess(`Auth endpoint responds with status: ${response.status}`);
    } catch (error) {
      setError(`Cannot reach auth endpoint: ${error.message}`);
      setResponse({
        type: "endpoint-test",
        status: "error",
        error: error.message,
        suggestion: "Check if Spring Boot backend is running on localhost:8080"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setResponse(null);
    setTokenValidation(null);
    setError("");
    setSuccess("");
    guestAuthAPI.logout();
  };

  const currentToken = guestAuthAPI.getToken();

  return (
    <Box
      p={4}
      sx={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h4"
        sx={{ color: "black", fontWeight: "bold", mb: 2 }}
      >
        Guest Authentication Test
      </Typography>
      
      <Typography variant="body2" sx={{ color: "gray", mb: 4, textAlign: "center" }}>
        Testing Spring Boot AuthController endpoints:<br />
        POST /api/v1/auth/login | POST /api/v1/auth/validate-token<br />
        <strong>Current Status: 401 Unauthorized - Check backend guest users</strong>
      </Typography>

      {/* Current Token Status */}
      {currentToken && (
        <Box mb={3} sx={{ textAlign: "center" }}>
          <Chip
            icon={<SecurityIcon />}
            label="Token Stored"
            color="success"
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <Typography variant="caption" sx={{ display: "block", color: "gray", wordBreak: "break-all" }}>
            {currentToken.substring(0, 50)}...
          </Typography>
        </Box>
      )}

      {/* Quick Credential Options */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          maxWidth: 600,
          width: "100%",
          border: "1px solid #ddd",
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: "black", fontWeight: "bold", mb: 2 }}>
          Quick Test Credentials
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {credentialOptions.map((cred, index) => (
            <Button
              key={index}
              variant="outlined"
              size="small"
              onClick={() => setCredentials(cred)}
              sx={{
                color: "black",
                borderColor: "#ddd",
                "&:hover": { backgroundColor: "#f8f8f8" },
                fontSize: "0.75rem",
              }}
            >
              {cred.label}
            </Button>
          ))}
        </Box>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: "100%",
          border: "2px solid black",
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Box display="flex" alignItems="center" mb={3}>
          <PersonIcon sx={{ mr: 1, color: "black" }} />
          <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>
            Login Test
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          InputLabelProps={{ style: { color: "black" } }}
          InputProps={{
            style: { color: "black" },
            sx: {
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "black",
              },
            },
          }}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          InputLabelProps={{ style: { color: "black" } }}
          InputProps={{
            style: { color: "black" },
            sx: {
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "black",
              },
            },
          }}
        />

        <Box mt={3} display="flex" gap={2} flexDirection="column">
          <Button
            fullWidth
            variant="outlined"
            onClick={testEndpointAvailability}
            disabled={loading}
            sx={{
              color: "green",
              borderColor: "green",
              "&:hover": { backgroundColor: "#f0fff0" },
            }}
          >
            Test Auth Endpoint
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={testConnection}
            disabled={loading}
            sx={{
              color: "blue",
              borderColor: "blue",
              "&:hover": { backgroundColor: "#f0f8ff" },
            }}
          >
            Test Backend Connection
          </Button>
          
          <Button
            fullWidth
            variant="contained"
            onClick={testLogin}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <LoginIcon />
              )
            }
            sx={{
              backgroundColor: "black",
              color: "white",
              "&:hover": { backgroundColor: "#333" },
              "&:disabled": { backgroundColor: "#ccc" },
            }}
          >
            {loading ? "Testing Login..." : "Test Login"}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={testTokenValidation}
            disabled={loading || !currentToken}
            startIcon={<SecurityIcon />}
            sx={{
              color: "black",
              borderColor: "black",
              "&:hover": { backgroundColor: "#f0f0f0" },
            }}
          >
            Validate Current Token
          </Button>

          <Button
            variant="text"
            onClick={clearAll}
            size="small"
            sx={{ color: "gray" }}
          >
            Clear All & Logout
          </Button>
        </Box>

        <Box mt={2}>
          <Typography variant="caption" sx={{ color: "gray", display: "block" }}>
            <strong>Troubleshooting 401 Error:</strong><br />
            1. Check if backend has guest users in database<br />
            2. Verify password encoding matches backend<br />
            3. Confirm AuthController is properly configured<br />
            4. Check Spring Security configuration
          </Typography>
        </Box>
      </Paper>

      {/* Login Response */}
      {response && (
        <Card sx={{ mb: 3, maxWidth: 600, width: "100%" }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold", mb: 2 }}>
              Login Response
            </Typography>
            <Box
              sx={{
                backgroundColor: response.status === "success" ? "#f0f8f0" : "#fff0f0",
                p: 2,
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.875rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              {JSON.stringify(response, null, 2)}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Token Validation Response */}
      {tokenValidation && (
        <Card sx={{ mb: 3, maxWidth: 600, width: "100%" }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              {tokenValidation.isValid ? (
                <CheckIcon sx={{ color: "green", mr: 1 }} />
              ) : (
                <CancelIcon sx={{ color: "red", mr: 1 }} />
              )}
              <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>
                Token Validation Result
              </Typography>
            </Box>
            
            <Box
              sx={{
                backgroundColor: tokenValidation.isValid ? "#f0f8f0" : "#fff0f0",
                p: 2,
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.875rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              {JSON.stringify(tokenValidation, null, 2)}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TestGuestLogin;
