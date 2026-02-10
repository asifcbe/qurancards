import React from 'react';
import { Box, Typography, Button, Stack, Container, Fade, Zoom } from '@mui/material';
import { WifiOffRounded, RefreshRounded, CloudOffRounded } from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// Floating animation
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

// Pulse animation
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// Wave animation
const wave = keyframes`
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(14deg);
  }
  20% {
    transform: rotate(-8deg);
  }
  30% {
    transform: rotate(14deg);
  }
  40% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(10deg);
  }
  60% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
`;

const FloatingIcon = styled(Box)(({ theme }) => ({
  animation: `${float} 3s ease-in-out infinite`,
}));

const PulsingCircle = styled(Box)(({ theme, delay = 0 }) => ({
  position: 'absolute',
  borderRadius: '50%',
  border: '3px solid rgba(99, 102, 241, 0.3)',
  animation: `${pulse} 2s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const OfflinePage = ({ onRetry, isDarkMode = false }) => {
  const colors = {
    bg: isDarkMode ? 'linear-gradient(135deg, #0a0e1a 0%, #0f1419 50%, #1a1f2e 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    text: isDarkMode ? '#e3e8ef' : '#1a202c',
    textSecondary: isDarkMode ? '#9ca3af' : '#64748b',
    primary: '#6366F1',
    primaryLight: '#818CF8',
    paper: isDarkMode ? 'rgba(15, 20, 25, 0.8)' : 'rgba(255, 255, 255, 0.8)',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
          animation: `${float} 4s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
          animation: `${float} 5s ease-in-out infinite`,
          animationDelay: '1s',
        }}
      />

      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Box
            sx={{
              textAlign: 'center',
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              bgcolor: colors.paper,
              backdropFilter: 'blur(20px)',
              boxShadow: isDarkMode
                ? '0 20px 60px rgba(0, 0, 0, 0.3)'
                : '0 20px 60px rgba(0, 0, 0, 0.1)',
              position: 'relative',
            }}
          >
            {/* Animated Icon with Pulsing Circles */}
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              <PulsingCircle
                sx={{
                  width: 120,
                  height: 120,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                delay={0}
              />
              <PulsingCircle
                sx={{
                  width: 160,
                  height: 160,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                delay={0.5}
              />
              <PulsingCircle
                sx={{
                  width: 200,
                  height: 200,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                delay={1}
              />

              <Zoom in timeout={600}>
                <FloatingIcon>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <WifiOffRounded
                      sx={{
                        fontSize: 50,
                        color: 'white',
                        animation: `${wave} 3s ease-in-out infinite`,
                      }}
                    />
                  </Box>
                </FloatingIcon>
              </Zoom>
            </Box>

            {/* Content */}
            <Stack spacing={2.5}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: colors.text,
                      mb: 1,
                      letterSpacing: '-0.5px',
                    }}
                  >
                    No Internet Connection
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: colors.textSecondary,
                      fontWeight: 500,
                      lineHeight: 1.6,
                    }}
                  >
                    Please check your internet connection and try again. The app requires an active
                    connection to load Quran content.
                  </Typography>
                </Box>
              </Fade>

              <Fade in timeout={1200}>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={onRetry}
                    startIcon={<RefreshRounded />}
                    sx={{
                      bgcolor: colors.primary,
                      color: 'white',
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: `0 8px 24px rgba(99, 102, 241, 0.3)`,
                      '&:hover': {
                        bgcolor: colors.primaryLight,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 28px rgba(99, 102, 241, 0.4)`,
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Try Again
                  </Button>

                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      mt: 2,
                    }}
                  >
                    <CloudOffRounded fontSize="small" />
                    You're currently offline
                  </Typography>
                </Stack>
              </Fade>
            </Stack>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default OfflinePage;
