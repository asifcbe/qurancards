import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Box, Typography, Card, CardContent,
  Button, Stack, Avatar, Fade, Container, Divider
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SpeedIcon from '@mui/icons-material/Speed';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const DownloadView = ({ onBack }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <Box sx={{ py: 6, px: 2, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Fade in timeout={600}>
          <Box>
            {/* Back Button */}
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{ mb: 4, color: '#64748B', fontWeight: 600 }}
            >
              Back to Settings
            </Button>

            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Helmet>
                <title>Download App | MeAndQuran</title>
                <meta name="description" content="Download the MeAndQuran app for a faster, offline-ready Quran memorization experience on iOS, Android, and Desktop." />
              </Helmet>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#0EA5E9', mx: 'auto', mb: 3 }}>
                <CloudDownloadIcon sx={{ fontSize: 48 }} />
              </Avatar>
              <Typography variant="h1" sx={{ fontWeight: 800, color: '#0F172A', mb: 2, letterSpacing: '-1.5px', fontSize: '2.5rem' }}>
                Download MeAndQuran
              </Typography>
              <Typography variant="h2" sx={{ color: '#64748B', fontWeight: 500, maxWidth: 600, mx: 'auto', fontSize: '1.25rem' }}>
                Install our app for a faster, offline-ready experience. Access your Hifdh journey anytime, anywhere.
              </Typography>
            </Box>

            {/* Install Button Card */}
            {isInstallable && (
              <Fade in timeout={800}>
                <Card elevation={0} sx={{
                  borderRadius: '24px',
                  border: '2px solid #0EA5E9',
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                  color: 'white',
                  mb: 4,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Ready to Install!</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.95, mb: 3 }}>
                      Your browser supports one-click installation. Click below to add MeAndQuran to your device.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<GetAppIcon />}
                      onClick={handleInstallClick}
                      sx={{
                        bgcolor: 'white',
                        color: '#0EA5E9',
                        fontWeight: 700,
                        borderRadius: '12px',
                        py: 1.5,
                        '&:hover': { bgcolor: '#F8FAFC' }
                      }}
                    >
                      Install Now
                    </Button>
                  </CardContent>
                  <GetAppIcon sx={{
                    position: 'absolute',
                    right: -30,
                    bottom: -30,
                    fontSize: 200,
                    opacity: 0.1,
                    transform: 'rotate(-15deg)'
                  }} />
                </Card>
              </Fade>
            )}

            {/* Benefits Section */}
            <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid #E2E8F0', mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 3 }}>
                  Why Install?
                </Typography>
                <Stack spacing={3}>
                  {[
                    { icon: <SpeedIcon />, title: 'Faster Performance', desc: 'Lightning-fast loading and smooth navigation' },
                    // { icon: <WifiOffIcon />, title: 'Offline Access', desc: 'Access previously loaded content without internet' },
                    { icon: <CheckCircleIcon />, title: 'Native Experience', desc: 'Runs like a native app with no browser UI' }
                  ].map((benefit, idx) => (
                    <Stack key={idx} direction="row" spacing={2} alignItems="flex-start">
                      <Avatar sx={{ bgcolor: '#F0F9FF', color: '#0EA5E9', width: 48, height: 48 }}>
                        {benefit.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {benefit.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>
                          {benefit.desc}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Platform Instructions */}
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 3 }}>
              Installation Instructions
            </Typography>

            <Stack spacing={3}>
              {/* iOS */}
              <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#F5F5F7', color: '#000' }}>
                      <AppleIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      iOS (iPhone/iPad)
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      <strong>1.</strong> Open this page in <strong>Safari</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      <strong>2.</strong> Tap the <strong>Share</strong> button (box with arrow)
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      <strong>3.</strong> Scroll down and tap <strong>"Add to Home Screen"</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      <strong>4.</strong> Tap <strong>"Add"</strong> in the top right
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Android */}
              <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#E8F5E9', color: '#4CAF50' }}>
                      <AndroidIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      Android
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      <strong>1.</strong> Open this page in <strong>Chrome</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      <strong>2.</strong> Tap the <strong>menu</strong> (three dots) in the top right
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      <strong>3.</strong> Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      <strong>4.</strong> Tap <strong>"Install"</strong> to confirm
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Desktop */}
              <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#EDE7F6', color: '#6366F1' }}>
                      <DesktopWindowsIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      Desktop (Windows/Mac)
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      <strong>1.</strong> Open this page in <strong>Chrome</strong> or <strong>Edge</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      <strong>2.</strong> Look for the <strong>install icon</strong> in the address bar (computer with arrow)
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      <strong>3.</strong> Click the icon and select <strong>"Install"</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      <strong>Alternative:</strong> Click the menu (three dots) → <strong>"Install MeAndQuran"</strong>
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>

            {/* Footer Note */}
            <Box sx={{ mt: 6, p: 3, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                Once installed, the app will appear on your home screen and can be launched like any other app.
                You'll get the full experience with faster loading and offline support.
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default DownloadView;
