import React, { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ThemeProvider, createTheme, CssBaseline, 
  Container, AppBar, Toolbar, Typography, 
  Box, IconButton, CircularProgress, Stack, Tooltip, Button, Avatar, Link,
  Snackbar, Alert
} from '@mui/material';
import logo from './assets/meandquranlogo.jpeg';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeRounded from '@mui/icons-material/HomeRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import MenuBookRounded from '@mui/icons-material/MenuBookRounded';
import GroupRounded from '@mui/icons-material/GroupRounded';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PoliciesView from './components/PoliciesView';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  useNavigate, 
  useLocation,
  Navigate
} from 'react-router-dom';
import { UserContext, UserProvider } from './contexts/UserContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { 
  getProfiles, getSettings, initializeUserSettings, checkUserAccess,
  validateDeviceSession, registerActiveDevice 
} from './firestoreDB';
import AuthPage from './components/AuthPage';
import MemorizeView from './components/MemorizeView';
import SettingsView from './components/SettingsView';
import ProfileSelection from './components/ProfileSelection';
import AccessDenied from './components/AccessDenied';
import AdminPanel from './components/AdminPanel';
import Dashboard from './components/Dashboard';
import ContactView from './components/ContactView';
import DownloadView from './components/DownloadView';
import OfflinePage from './components/OfflinePage';

// Helper to get or generate a unique device ID
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

const AppContent = ({ settingsFromWrapper, onSettingsChange }) => {
  const { currentUser, loading: authLoading, logout } = useContext(UserContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentProfile, setCurrentProfile] = useState(null);
  const [settings, setSettings] = useState(settingsFromWrapper);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Device Session Management
  useEffect(() => {
    const handleDeviceSession = async () => {
      if (currentUser) {
        const deviceId = getDeviceId();
        
        // Register this device as the active one if we just logged in or refreshed
        // We only do this on initial load in this effect
        await registerActiveDevice(currentUser.uid, deviceId);

        // Periodically check if another device has taken over
        const interval = setInterval(async () => {
          const { isValid } = await validateDeviceSession(currentUser.uid, deviceId);
          if (!isValid) {
            setSessionError("Your account is being used on another device. Logging out...");
            setTimeout(() => {
              logout();
              navigate('/login');
            }, 3000);
          }
        }, 15000); // Check every 15 seconds

        return () => clearInterval(interval);
      }
    };
    handleDeviceSession();
  }, [currentUser]);

  // Update local settings when props change
  useEffect(() => {
    if (settingsFromWrapper) {
      setSettings(settingsFromWrapper);
    }
  }, [settingsFromWrapper]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (currentUser) {
      setIsAdmin(currentUser.email === import.meta.env.VITE_ADMIN_EMAIL);
    }
  }, [currentUser]);

  // Check user access
  useEffect(() => {
    const checkAccess = async () => {
      if (currentUser) {
        const access = await checkUserAccess(currentUser.uid);
        setHasAccess(access);
      }
    };
    checkAccess();
  }, [currentUser]);

  // Load user settings and profile
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          await initializeUserSettings(currentUser.uid);
          const userSettings = await getSettings(currentUser.uid);
          setSettings(userSettings);
          onSettingsChange(userSettings);
          
          const profiles = await getProfiles(currentUser.uid);
          if (profiles.length > 0) {
            const profile = profiles[0];
            // Navigate to page 30 for non-subscribers if they are on default page
            const access = await checkUserAccess(currentUser.uid);
            if (!access && (!profile.currentPage || profile.currentPage === 1)) {
              profile.currentPage = 30;
            }
            setCurrentProfile(profile);
            // Only navigate home if we're on root or login
            if (location.pathname === '/' || location.pathname === '/login') {
              navigate('/');
            }
          } else {
            navigate('/profiles');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadUserData();
  }, [currentUser]);

  // No early return for !currentUser to allow public views

  // Show offline page for all routes except dashboard
  const isDashboardRoute = location.pathname === '/dashboard';
  if (!isOnline && !isDashboardRoute) {
    return (
      <ThemeProvider theme={createTheme({ palette: { mode: settings?.theme || 'light' } })}>
        <CssBaseline />
        <OfflinePage 
          onRetry={() => setIsOnline(navigator.onLine)}
          isDarkMode={settings?.theme === 'dark'}
        />
      </ThemeProvider>
    );
  }

  // Main layout handles view routing

  const theme = createTheme({
    palette: {
      mode: settings?.theme || 'light',
      primary: { main: '#6366f1' }, // Indigo
      secondary: { main: '#0f172a' }, // Slate
      background: {
        default: settings?.theme === 'dark' ? '#0f172a' : '#f8fafc',
        paper: settings?.theme === 'dark' ? '#1e293b' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      h6: { fontWeight: 700, letterSpacing: '-0.5px' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: settings?.theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid',
            borderColor: settings?.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            color: settings?.theme === 'dark' ? '#fff' : '#1e293b',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '8px 20px',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Helmet>
        <title>MeAndQuran - Master Quran Memorization (Hifz/Hifdh)</title>
        <meta name="description" content="Master Quran memorization (Hifz/Hifdh) with MeAndQuran. Use our science-backed progressive accumulation technique to memorize one page a day. The best Quran memorization app for Muslims." />
        <meta name="keywords" content="Quran memorization, Hifz, Hifdh, Memorize Quran, Hifz Quran, Quran Hifdh, Quran Memorization App, Learn Quran, Hifz Program, Hifdh companion, Islamic app, Tahfiz, Tahfeedh" />
      </Helmet>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 2, px: { xs: 2, sm: 4 } }}>
          <Box 
            component="img" 
            src={logo} 
            alt="MeAndQuran" 
            onClick={() => navigate('/')}
            sx={{ 
              height: 40, 
              width: 40,
              borderRadius: '12px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.05) rotate(5deg)'
              }
            }} 
          />
          <Typography 
            variant="h6" 
            onClick={() => navigate('/')}
            sx={{ 
              fontWeight: 800,
              cursor: 'pointer',
              display: { xs: 'none', sm: 'block' },
              color: 'inherit'
            }}
          >
            MeAndQuran
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1} alignItems="center">
            {currentUser && (
              <>
                <Tooltip title={t('home')}>
                  <IconButton color="inherit" onClick={() => navigate('/')} size="medium">
                    <HomeRounded />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('dashboard')}>
                  <IconButton color="inherit" onClick={() => navigate('/dashboard')} size="medium">
                    <DashboardRounded />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('profiles')}>
                  <IconButton color="inherit" onClick={() => navigate('/profiles')} size="medium">
                    <GroupRounded />
                  </IconButton>
                </Tooltip>
                {/* Removed Admin from here, moved to settings */}
                <Tooltip title={t('settings')}>
                  <IconButton color="inherit" onClick={() => navigate('/settings')} size="medium">
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            {currentUser && !hasAccess && !isAdmin && (
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/subscription')}
                sx={{
                  bgcolor: '#10B981',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  px: 2,
                  py: 0.5,
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  '&:hover': {
                    bgcolor: '#059669',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  },
                  display: { xs: 'none', md: 'flex' }
                }}
              >
                Go Premium
              </Button>
            )}

            {currentUser && (
              <Box 
                onClick={() => navigate('/profiles')}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5, 
                  ml: 1, 
                  pl: 1.5,
                  pr: 0.5,
                  py: 0.5,
                  borderRadius: '12px',
                  bgcolor: settings?.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: settings?.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, display: { xs: 'none', md: 'block' } }}>
                  {currentProfile?.name || 'User'}
                </Typography>
                <Avatar 
                  src={currentUser?.photoURL} 
                  alt={currentUser?.displayName || currentProfile?.name}
                  sx={{ 
                    width: 32, 
                    height: 32,
                    border: '2px solid #6366f1'
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Avatar>
              </Box>
            )}

            {currentUser && (
              <Tooltip title={t('signOut')}>
                <IconButton color="inherit" onClick={logout} size="medium">
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth={location.pathname === '/' ? false : 'lg'} 
        disableGutters={location.pathname === '/'} 
        sx={{ mt: location.pathname === '/' ? 0 : 2, mb: 4, minHeight: '80vh' }}
      >
        
        <Routes>
          {/* Public Legal Routes */}
          <Route path="/privacy" element={<PoliciesView initialTab={0} onBack={() => navigate(-1)} />} />
          <Route path="/terms" element={<PoliciesView initialTab={1} onBack={() => navigate(-1)} />} />
          <Route path="/refund" element={<PoliciesView initialTab={2} onBack={() => navigate(-1)} />} />
          <Route path="/contact" element={<ContactView onBack={() => navigate(-1)} />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={!currentUser ? <AuthPage onAuthSuccess={() => navigate('/')} /> : <Navigate to="/" />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            currentUser ? (
              loading ? <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box> :
              currentProfile ? <MemorizeView profile={currentProfile} settings={settings} onUpgrade={() => navigate('/subscription')} /> :
              <Navigate to="/profiles" />
            ) : <Navigate to="/login" />
          } />

          <Route path="/dashboard" element={
            currentUser ? <Dashboard profile={currentProfile} /> : <Navigate to="/login" />
          } />

          <Route path="/settings" element={
            currentUser ? (
              <SettingsView
                settings={settings}
                isAdmin={isAdmin}
                profile={currentProfile}
                onSettingsChange={(newSettings) => {
                  setSettings(newSettings);
                  onSettingsChange(newSettings);
                }}
                onUpgrade={() => navigate('/subscription')}
                onAdminAccess={() => navigate('/admin')}
                onPrivacy={() => navigate('/privacy')}
                onTerms={() => navigate('/terms')}
                onRefund={() => navigate('/refund')}
                onContact={() => navigate('/contact')}
                onDownload={() => navigate('/download')}
                onSwitchProfile={() => navigate('/profiles')}
              />
            ) : <Navigate to="/login" />
          } />

          <Route path="/subscription" element={
            currentUser ? (
              <AccessDenied 
                onAccessGranted={async () => {
                  const access = await checkUserAccess(currentUser.uid);
                  setHasAccess(access);
                  navigate('/');
                }} 
                onBack={() => navigate(-1)}
                onPrivacy={() => navigate('/privacy')}
                onTerms={() => navigate('/terms')}
                onRefund={() => navigate('/refund')}
              />
            ) : <Navigate to="/login" />
          } />

          <Route path="/admin" element={
            currentUser && isAdmin ? <AdminPanel onBack={() => navigate('/settings')} /> : <Navigate to="/login" />
          } />

          <Route path="/profiles" element={
            currentUser ? (
              <ProfileSelection
                onSelect={(p) => {
                  setCurrentProfile(p);
                  navigate('/');
                }}
              />
            ) : <Navigate to="/login" />
          } />

          <Route path="/download" element={
            <DownloadView onBack={() => navigate('/settings')} />
          } />

          {/* Fallback redirect for missing routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
      <Box 
        component="footer" 
        sx={{ 
          py: 4, 
          textAlign: 'center', 
          borderTop: '1px solid',
          borderColor: settings?.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          mt: 'auto'
        }}
      >
        <Stack 
          direction="row" 
          spacing={{ xs: 2, sm: 3 }} 
          justifyContent="center" 
          flexWrap="wrap"
          sx={{ mb: 1.5, px: 2 }}
        >
          <Link 
            component="button" 
            onClick={() => navigate('/privacy')}
            sx={{ color: '#64748B', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600 }}
          >
            Privacy Policy
          </Link>
          <Link 
            component="button" 
            onClick={() => navigate('/terms')}
            sx={{ color: '#64748B', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600 }}
          >
            Terms & Conditions
          </Link>
          <Link 
            component="button" 
            onClick={() => navigate('/refund')}
            sx={{ color: '#64748B', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600 }}
          >
            Refund Policy
          </Link>
          <Link 
            component="button" 
            onClick={() => navigate('/contact')}
            sx={{ color: '#64748B', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600 }}
          >
            Contact
          </Link>
        </Stack>
        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
          © 2026 MeAndQuran. All rights reserved. Payments securely handled by Razorpay.
        </Typography>
      </Box>

      {/* Global Session Error Notification */}
      <Snackbar 
        open={Boolean(sessionError)} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%', fontWeight: 700 }}>
          {sessionError}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Router>
      <UserProvider>
        <AppContentWrapper />
      </UserProvider>
    </Router>
  );
};

const AppContentWrapper = () => {
  const { currentUser } = useContext(UserContext);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (currentUser) {
        const userSettings = await getSettings(currentUser.uid);
        setSettings(userSettings);
      }
    };
    loadSettings();
  }, [currentUser]);

  return (
    <LanguageProvider userSettings={settings}>
      <AppContent settingsFromWrapper={settings} onSettingsChange={setSettings} />
    </LanguageProvider>
  );
};

export default App;
