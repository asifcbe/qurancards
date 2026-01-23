import React, { useState, useEffect, useContext } from 'react';
import { 
  ThemeProvider, createTheme, CssBaseline, 
  Container, AppBar, Toolbar, Typography, 
  Box, IconButton, CircularProgress, Stack, Tooltip
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuBookRounded from '@mui/icons-material/MenuBookRounded';
import GroupRounded from '@mui/icons-material/GroupRounded';
import { UserContext, UserProvider } from './contexts/UserContext';
import { getProfiles, getSettings, initializeUserSettings } from './firestoreDB';
import AuthPage from './components/AuthPage';
import MemorizeView from './components/MemorizeView';
import SettingsView from './components/SettingsView';
import ProfileSelection from './components/ProfileSelection';

const AppContent = () => {
  const { currentUser, loading: authLoading, logout } = useContext(UserContext);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [view, setView] = useState('memorize');
  const [loading, setLoading] = useState(true);

  // Load user settings and profile
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          await initializeUserSettings(currentUser.uid);
          const userSettings = await getSettings(currentUser.uid);
          setSettings(userSettings);
          
          const profiles = await getProfiles(currentUser.uid);
          if (profiles.length > 0) {
            setCurrentProfile(profiles[0]);
            setView('memorize');
          } else {
            setView('profiles');
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

  // Show auth page if not logged in
  if (!currentUser) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  // Show loading spinner while loading user data
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#0c1424"
      >
        <CircularProgress size={50} sx={{ color: '#f7c948' }} />
      </Box>
    );
  }

  // Show profile selection if no profile exists and not already in profiles view
  if (!currentProfile && view !== 'profiles') {
    return (
      <ThemeProvider
        theme={createTheme({
          palette: {
            primary: { main: '#0f4c81' },
            secondary: { main: '#f7c948' },
            background: { default: '#e9eef7' },
          },
          typography: { fontFamily: '"Amiri", "Inter", sans-serif' },
        })}
      >
        <CssBaseline />
        <ProfileSelection onSelect={setCurrentProfile} onComplete={() => setView('memorize')} />
      </ThemeProvider>
    );
  }

  const theme = createTheme({
    palette: {
      mode: settings?.theme || 'light',
      primary: { main: '#0f4c81' }, // Deep ocean blue
      secondary: { main: '#f7c948' }, // Warm amber accent
      background: {
        default: settings?.theme === 'dark' ? '#0b1220' : '#e9eef7',
        paper: settings?.theme === 'dark' ? '#0f1f32' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Amiri", "Inter", sans-serif',
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 1,
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={1} sx={{ background: 'linear-gradient(135deg, #0f4c81 0%, #0b1f36 100%)' }}>
        <Toolbar sx={{ gap: 1 }}>
          <MenuBookRounded />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Quran Memorizer
          </Typography>
          {currentProfile && (
            <Typography
              variant="subtitle2"
              sx={{ mr: 1, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}
            >
              {currentProfile.name}
            </Typography>
          )}
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Memorize">
              <IconButton color="inherit" onClick={() => setView('memorize')} size="small">
                <MenuBookRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton color="inherit" onClick={() => setView('settings')} size="small">
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Profiles">
              <IconButton color="inherit" onClick={() => setView('profiles')} size="small">
                <GroupRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sign out">
              <IconButton color="inherit" onClick={logout} size="small">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 2, mb: 4, minHeight: '80vh' }}>
        {view === 'memorize' && (
          <MemorizeView profile={currentProfile} settings={settings} />
        )}
        {view === 'settings' && (
          <SettingsView
            settings={settings}
            onSettingsChange={(newSettings) => setSettings(newSettings)}
          />
        )}
        {view === 'profiles' && (
          <ProfileSelection
            onSelect={(p) => {
              setCurrentProfile(p);
              setView('memorize');
            }}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
