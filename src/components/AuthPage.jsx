import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Stack,
  Divider,
  CircularProgress,
  Fade,
  Zoom,
  useTheme
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { createUserDocument, initializeUserSettings } from "../firestoreDB";

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document and initialize settings
        await createUserDocument(userCredential.user.uid, {
          email,
          displayName,
        });
        await initializeUserSettings(userCredential.user.uid);
      }
      onAuthSuccess(userCredential.user);
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Create user document if new user
      await createUserDocument(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
      });
      await initializeUserSettings(result.user.uid);
      onAuthSuccess(result.user);
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a192f 0%, #1a365d 50%, #0f4c81 100%)",
        position: "relative",
        overflow: "hidden",
        py: 4,
        px: 2,
        "&::before": {
          content: '""',
          position: "absolute",
          top: "10%",
          right: "-10%",
          width: "40%",
          height: "40%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-5%",
          left: "-5%",
          width: "35%",
          height: "35%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Card
            sx={{
              width: "100%",
              borderRadius: 4,
              boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
              overflow: "hidden",
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              position: "relative",
              zIndex: 1
            }}
          >
            {/* Header with gradient */}
            <Box sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #0f4c81 100%)",
              p: { xs: 3, sm: 4 },
              textAlign: "center",
              color: "white",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "-50%",
                right: "-20%",
                width: "60%",
                height: "200%",
                background: "rgba(255, 255, 255, 0.05)",
                transform: "rotate(25deg)",
              }
            }}>
              <Zoom in timeout={800}>
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      textAlign: "center",
                      mb: 1,
                      fontWeight: 900,
                      fontSize: { xs: '2rem', sm: '2.5rem' },
                      textShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      letterSpacing: '-0.5px',
                      background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.9) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    📖 Quran Memorizer
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      textAlign: "center",
                      color: "rgba(255,255,255,0.95)",
                      fontWeight: 600,
                      fontSize: "1.1rem"
                    }}
                  >
                    {isLogin ? "Welcome Back ✨" : "Begin Your Journey 🌙"}
                  </Typography>
                </Box>
              </Zoom>
            </Box>

            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {error && (
                <Fade in>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2,
                      border: "1px solid rgba(211, 47, 47, 0.3)",
                      boxShadow: "0 2px 8px rgba(211, 47, 47, 0.15)"
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <Stack spacing={3} component="form" onSubmit={handleEmailAuth}>
                {/* Display Name (Register only) */}
                {!isLogin && (
                  <Fade in timeout={400}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      placeholder="e.g., Ahmed"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={loading}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)" }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: "rgba(59, 130, 246, 0.03)",
                          transition: "all 0.3s ease",
                          '&:hover': {
                            background: "rgba(59, 130, 246, 0.06)",
                          },
                          '&:hover fieldset': {
                            borderColor: '#3b82f6',
                          },
                          '&.Mui-focused': {
                            background: "rgba(59, 130, 246, 0.08)",
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: "2px"
                          }
                        }
                      }}
                    />
                  </Fade>
                )}

                {/* Email */}
                <Fade in timeout={500}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: "rgba(59, 130, 246, 0.03)",
                        transition: "all 0.3s ease",
                        '&:hover': {
                          background: "rgba(59, 130, 246, 0.06)",
                        },
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                        },
                        '&.Mui-focused': {
                          background: "rgba(59, 130, 246, 0.08)",
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: "2px"
                        }
                      }
                    }}
                  />
                </Fade>

                {/* Password */}
                <Fade in timeout={600}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)" }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: "rgba(59, 130, 246, 0.03)",
                        transition: "all 0.3s ease",
                        '&:hover': {
                          background: "rgba(59, 130, 246, 0.06)",
                        },
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                        },
                        '&.Mui-focused': {
                          background: "rgba(59, 130, 246, 0.08)",
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: "2px"
                        }
                      }
                    }}
                  />
                </Fade>

                {/* Submit Button */}
                <Fade in timeout={700}>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #0f4c81 100%)",
                      color: "white",
                      py: 1.8,
                      fontWeight: 700,
                      textTransform: "none",
                      fontSize: "1.05rem",
                      borderRadius: 2.5,
                      mt: 1,
                      boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                      '&:hover': {
                        background: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 50%, #0c3b6b 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)"
                      },
                      '&:active': {
                        transform: "translateY(0px)",
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : isLogin ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </Fade>

                {/* Divider */}
                <Divider sx={{ my: 1, color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>OR</Divider>

                {/* Google Sign In */}
                <Fade in timeout={800}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    sx={{
                      py: 1.8,
                      textTransform: "none",
                      fontSize: "1.05rem",
                      borderRadius: 2.5,
                      borderWidth: "2px",
                      borderColor: "rgba(0,0,0,0.15)",
                      color: "#333",
                      fontWeight: 700,
                      background: "rgba(255, 255, 255, 0.7)",
                      backdropFilter: "blur(10px)",
                      '&:hover': {
                        borderWidth: "2px",
                        borderColor: "#3b82f6",
                        bgcolor: "rgba(59, 130, 246, 0.08)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                      },
                      '&:active': {
                        transform: "translateY(0px)",
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Continue with Google"
                    )}
                  </Button>
                </Fade>

                {/* Toggle Login/Register */}
                <Fade in timeout={900}>
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {isLogin ? "Don't have an account? " : "Already have an account? "}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          color: "#3b82f6",
                          fontWeight: 800,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": { 
                            color: "#1e40af",
                            textDecoration: "underline",
                          }
                        }}
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setError("");
                          setEmail("");
                          setPassword("");
                          setDisplayName("");
                        }}
                      >
                        {isLogin ? "Sign up" : "Sign in"}
                      </Typography>
                    </Typography>
                  </Box>
                </Fade>
              </Stack>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default AuthPage;
