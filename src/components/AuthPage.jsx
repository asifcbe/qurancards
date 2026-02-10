import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
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
  InputAdornment
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import LockIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import PersonIcon from "@mui/icons-material/PersonOutline";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { createUserDocument, initializeUserSettings, registerActiveDevice } from "../firestoreDB";
import logo from "../assets/meandquranlogo.jpeg";
import hifdhModeImage from "../assets/hifdhmode.png";
import {
  CheckCircle as CheckIcon,
  Security as SecurityIcon,
  Psychology as PsychologyIcon,
  Repeat as RepeatIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as SparkleIcon,
} from "@mui/icons-material";

// Helper to get or generate a unique device ID (Local to this file as well)
const getDeviceId = () => {
  let deviceId = localStorage.getItem('qurancards_device_id');
  if (!deviceId) {
    deviceId = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('qurancards_device_id', deviceId);
  }
  return deviceId;
};

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
        await createUserDocument(userCredential.user.uid, { email, displayName });
        await initializeUserSettings(userCredential.user.uid);
      }
      await registerActiveDevice(userCredential.user.uid, getDeviceId());
      onAuthSuccess(userCredential.user);
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
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
      await createUserDocument(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
      });
      await initializeUserSettings(result.user.uid);
      await registerActiveDevice(result.user.uid, getDeviceId());
      onAuthSuccess(result.user);
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "MeAndQuran",
    "operatingSystem": "Web",
    "applicationCategory": "EducationalApplication",
    "description": "A web application to help users memorize the Quran page by page using a science-backed progressive accumulation technique.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#F8FAFC",
      py: 6,
      px: 2,
    }}>
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Box>
            <Helmet>
              <title>{isLogin ? "Sign In | MeAndQuran - Quran Memorization (Hifz/Hifdh)" : "Create Account | MeAndQuran - Master Quran Memorization"}</title>
              <meta name="description" content={isLogin ? "Sign in to your MeAndQuran account to continue your Quran memorization (Hifz/Hifdh) journey." : "Join MeAndQuran and start memorizing the Quran page by page with our smart hifz/hifdh mode."} />
              <meta name="keywords" content="Quran memorization, Hifz, Hifdh, Memorize Quran, Hifz Quran, Quran Hifdh, Quran Memorization App, Learn Quran, Hifz Program, Hifdh companion, Islamic app, Tahfiz, Tahfeedh" />
              <script type="application/ld+json">
                {JSON.stringify(structuredData)}
              </script>
            </Helmet>

            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box 
                component="img" 
                src={logo} 
                alt="MeAndQuran Logo" 
                sx={{ 
                  height: 80, 
                  width: 80, 
                  mb: 2, 
                  borderRadius: "20px",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                }} 
              />
              <Typography variant="h1" sx={{ fontWeight: 800, color: "#0F172A", mb: 1, letterSpacing: "-1.5px", fontSize: "2.5rem" }}>
                MeAndQuran
              </Typography>
              <Typography variant="h2" sx={{ color: "#64748B", fontWeight: 500, fontSize: "1.1rem" }}>
                {isLogin ? "Welcome back! Please enter your details." : "Join thousands on their hifdh journey."}
              </Typography>
            </Box>

            <Card elevation={0} sx={{ 
              borderRadius: "28px", 
              border: "1px solid #E2E8F0",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)",
              overflow: "hidden",
              bgcolor: "#FFFFFF"
            }}>
              

              <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: "14px" }}>
                    {error}
                  </Alert>
                )}

                <Stack spacing={2.5} component="form" onSubmit={handleEmailAuth}>
                  {!isLogin && (
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={loading}
                      placeholder="Ahmed Ali"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "#94A3B8" }} /></InputAdornment>,
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
                    />
                  )}

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="ahmed@example.com"
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: "#94A3B8" }} /></InputAdornment>,
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "#94A3B8" }} /></InputAdornment>,
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    sx={{
                      py: 2,
                      borderRadius: "14px",
                      background: "#6366F1",
                      boxShadow: "none",
                      fontSize: "1rem",
                      fontWeight: 700,
                      textTransform: "none",
                      "&:hover": { background: "#4F46E5", boxShadow: "0 8px 20px rgba(99, 102, 241, 0.2)" }
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? "Sign in" : "Create Account")}
                  </Button>

                  <Box sx={{ position: "relative", py: 1 }}>
                    <Divider><Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>OR</Typography></Divider>
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: "14px",
                      borderColor: "#E2E8F0",
                      color: "#0F172A",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": { borderColor: "#6366F1", bgcolor: "#F5F7FF" }
                    }}
                  >
                    Continue with Google
                  </Button>

                  <Box sx={{ textAlign: "center", mt: 1 }}>
                    <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500 }}>
                      {isLogin ? "New here? " : "Already have an account? "}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: "#6366F1", fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                        onClick={() => { setIsLogin(!isLogin); setError(""); }}
                      >
                        {isLogin ? "Create account" : "Sign in"}
                      </Typography>
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>

              {/* Secure Transaction Footer */}
              <Box sx={{ 
                bgcolor: "#F8FAFC", 
                py: 2, 
                px: 3, 
                borderTop: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1
              }}>
                <SecurityIcon sx={{ fontSize: 16, color: "#10B981" }} />
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Secure one-time payments via <strong>Razorpay</strong>
                </Typography>
              </Box>
            </Card>

            {/* Hifdh Mode Image Showcase */}
            <Box sx={{ 
              mt: 4,
              mb: 0,
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
              border: "3px solid #E0E7FF"
            }}>
              <Box
                component="img"
                src={hifdhModeImage}
                alt="Smart Hifdh Mode"
                sx={{
                  width: "100%",
                  height: "auto",
                  display: "block"
                }}
              />
            </Box>

            {/* Hifdh Mode Explanation */}
            <Fade in timeout={1200}>
              <Card elevation={0} sx={{ 
                mt: 4,
                borderRadius: "28px", 
                border: "2px solid #E0E7FF",
                background: "linear-gradient(135deg, #F5F7FF 0%, #EEF2FF 100%)",
                overflow: "hidden"
              }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  {/* Header */}
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Box sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 16px rgba(99, 102, 241, 0.25)"
                    }}>
                      <PsychologyIcon sx={{ fontSize: 32, color: "white" }} />
                    </Box>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: "#1E293B", letterSpacing: "-0.5px", fontSize: "1.5rem" }}>
                        Smart Hifdh Mode
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6366F1", fontWeight: 600 }}>
                        Science-backed repetition technique
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Description */}
                  <Typography variant="body2" sx={{ color: "#475569", mb: 4, lineHeight: 1.8, fontWeight: 500 }}>
                    Our revolutionary Hifdh mode uses <strong>progressive accumulation</strong> — the same technique 
                    used by Quran memorization experts worldwide. Each verse builds upon the previous ones.
                  </Typography>

                  {/* Visual Steps */}
                  <Stack spacing={2.5} sx={{ mb: 4 }}>
                    {[
                      { step: "1", text: "Verse 1", reps: "× 10 times", color: "#10B981", icon: "🎯" },
                      { step: "2", text: "Verse 2", reps: "× 10 times", color: "#3B82F6", icon: "📖" },
                      { step: "3", text: "Verses 1 + 2", reps: "× 10 times", color: "#8B5CF6", icon: "🔗" },
                      { step: "4", text: "Verse 3", reps: "× 10 times", color: "#F59E0B", icon: "✨" },
                      { step: "5", text: "Verses 1 + 2 + 3", reps: "× 10 times", color: "#EC4899", icon: "🌟" },
                    ].map((item) => (
                      <Box key={item.step} sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        borderRadius: "16px",
                        bgcolor: "rgba(255, 255, 255, 0.7)",
                        border: `2px solid ${item.color}20`,
                        transition: "all 0.3s",
                        "&:hover": {
                          transform: "translateX(8px)",
                          boxShadow: `0 8px 16px ${item.color}20`,
                          borderColor: `${item.color}40`
                        }
                      }}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "12px",
                          bgcolor: item.color,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          flexShrink: 0
                        }}>
                          {item.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#1E293B" }}>
                            {item.text}
                          </Typography>
                        </Box>
                        <Box sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: "8px",
                          bgcolor: `${item.color}15`,
                          border: `1px solid ${item.color}30`
                        }}>
                          <Typography variant="caption" sx={{ color: item.color, fontWeight: 700 }}>
                            {item.reps}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>

                  {/* Continue pattern indicator */}
                  <Box sx={{ 
                    textAlign: "center", 
                    py: 2,
                    mb: 4,
                    borderRadius: "12px",
                    bgcolor: "rgba(99, 102, 241, 0.05)",
                    border: "1px dashed #6366F1"
                  }}>
                    <RepeatIcon sx={{ fontSize: 24, color: "#6366F1", mb: 0.5 }} />
                    <Typography variant="body2" sx={{ color: "#6366F1", fontWeight: 700 }}>
                      Pattern continues until end of page...
                    </Typography>
                  </Box>

                  {/* Result Box */}
                  <Box sx={{
                    p: 3,
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    color: "white",
                    textAlign: "center",
                    boxShadow: "0 12px 24px rgba(16, 185, 129, 0.3)"
                  }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                      <SparkleIcon sx={{ fontSize: 28 }} />
                      <Typography variant="h4" sx={{ fontWeight: 900 }}>
                        100% Memorized
                      </Typography>
                      <SparkleIcon sx={{ fontSize: 28 }} />
                    </Stack>
                    <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600, mb: 2 }}>
                      By setting repetitions ≥ 10, you'll have reviewed the entire page 
                      <strong> hundreds of times</strong> by the end!
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <TrendingUpIcon sx={{ fontSize: 18 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Deep Retention
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PsychologyIcon sx={{ fontSize: 18 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Focused Mind
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CheckIcon sx={{ fontSize: 18 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Proven Method
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
            
            <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 4, color: "#94A3B8", fontWeight: 500 }}>
              By continuing, you agree to our Terms and Privacy Policy.
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};


export default AuthPage;
