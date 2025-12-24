import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, createTheme, CssBaseline, 
  Container, AppBar, Toolbar, Typography, 
  Box, Button, Drawer, List, ListItem, 
  ListItemText, Divider, IconButton,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from './db';
import MemorizeView from './components/MemorizeView';
import SettingsView from './components/SettingsView';
import ProfileSelection from './components/ProfileSelection';

const App = () => {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [view, setView] = useState('memorize'); // 'memorize', 'settings', 'profiles'
  const [drawerOpen, setDrawerOpen] = useState(false);

  const settings = useLiveQuery(() => db.settings.get('default'));

  const theme = createTheme({
    palette: {
      mode: settings?.theme || 'light',
      primary: {
        main: '#2e7d32', // Islamic Green
      },
      background: {
        default: settings?.theme === 'dark' ? '#121212' : '#fdfaf5', // Slightly off-white/cream for paper feel
      }
    },
    typography: {
      fontFamily: '"Amiri", "Inter", sans-serif',
    }
  });

  useEffect(() => {
    // Load last used profile or show profile selection
    const loadProfile = async () => {
      const profiles = await db.profiles.toArray();
      if (profiles.length > 0) {
        setCurrentProfile(profiles[0]);
      } else {
        setView('profiles');
      }
    };
    loadProfile();
  }, []);

  if (!currentProfile && view !== 'profiles') {
    return <ProfileSelection onSelect={setCurrentProfile} onComplete={() => setView('memorize')} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Quran Memorizer
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {currentProfile?.name}
          </Typography>
          <IconButton color="inherit" onClick={() => setView('settings')}>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            <ListItem button onClick={() => { setView('memorize'); setDrawerOpen(false); }}>
              <ListItemText primary="Memorize" />
            </ListItem>
            <ListItem button onClick={() => { setView('settings'); setDrawerOpen(false); }}>
              <ListItemText primary="Settings" />
            </ListItem>
            <ListItem button onClick={() => { setView('profiles'); setDrawerOpen(false); }}>
              <ListItemText primary="Switch Profile" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4, minHeight: '80vh' }}>
        {view === 'memorize' && <MemorizeView profile={currentProfile} settings={settings} />}
        {view === 'settings' && <SettingsView settings={settings} />}
        {view === 'profiles' && (
          <ProfileSelection 
            onSelect={(p) => { setCurrentProfile(p); setView('memorize'); }} 
          />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;
