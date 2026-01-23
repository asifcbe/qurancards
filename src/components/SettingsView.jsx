import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Card, CardContent, 
  FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, Slider, Button,
  Stack, Divider, Alert, Fade, Zoom, Chip
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MicIcon from '@mui/icons-material/Mic';
import RepeatIcon from '@mui/icons-material/Repeat';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PersonIcon from '@mui/icons-material/Person';
import { fetchReciters } from '../api';
import { updateSettings } from '../firestoreDB';
import { UserContext } from '../contexts/UserContext';

const SettingsView = ({ settings, onSettingsChange }) => {
  const [reciters, setReciters] = useState([]);
  const { currentUser, logout } = useContext(UserContext);

  useEffect(() => {
    fetchReciters().then(setReciters);
  }, []);

  const handleChange = async (field, value) => {
    if (currentUser) {
      try {
        await updateSettings(currentUser.uid, { [field]: value });
        if (onSettingsChange) onSettingsChange({ ...settings, [field]: value });
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a192f 0%, #1a365d 50%, #0f4c81 100%)',
        py: 4,
        px: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "20%",
          right: "-15%",
          width: "45%",
          height: "45%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
          filter: "blur(50px)",
        }
      }}
    >
      <Box sx={{ maxWidth: 650, mx: 'auto', position: "relative", zIndex: 1 }}>
        <Fade in timeout={500}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Zoom in timeout={700}>
                <Typography 
                  variant="h3" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 900,
                    fontSize: { xs: '2.2rem', sm: '2.8rem' },
                    color: 'white',
                    mb: 1,
                    textShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    letterSpacing: '-0.5px'
                  }}
                >
                  ⚙️ Settings
                </Typography>
              </Zoom>
              <Typography 
                variant="body1"
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500,
                  fontSize: "1.05rem"
                }}
              >
                Customize your experience
              </Typography>
            </Box>
            
            {/* Main Settings Card */}
            <Card sx={{ 
              mb: 3, 
              borderRadius: 3,
              boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
              background: 'rgba(255, 255, 255, 0.97)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              overflow: "hidden"
            }}>
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Stack spacing={4}>
                  {/* Reciter Selection */}
                  <Fade in timeout={600}>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                        <Box sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)"
                        }}>
                          <MicIcon sx={{ color: "white", fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f4c81', fontSize: "1.2rem" }}>
                          Reciter
                        </Typography>
                      </Box>
                      <FormControl fullWidth>
                        <Select
                          value={settings?.reciter || 7}
                          onChange={(e) => handleChange('reciter', e.target.value)}
                          sx={{
                            borderRadius: 2,
                            background: "rgba(59, 130, 246, 0.03)",
                            transition: "all 0.3s ease",
                            '&:hover': {
                              background: "rgba(59, 130, 246, 0.06)",
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(59, 130, 246, 0.2)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#3b82f6',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#3b82f6',
                              borderWidth: "2px"
                            }
                          }}
                        >
                          {reciters.map(r => (
                            <MenuItem key={r.id} value={r.id}>
                              {r.reciter_name} {r.style ? `(${r.style})` : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Fade>

                  <Divider sx={{ borderColor: 'rgba(59, 130, 246, 0.1)' }} />

                  {/* Repetitions */}
                  <Fade in timeout={700}>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                        <Box sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(245, 158, 11, 0.25)"
                        }}>
                          <RepeatIcon sx={{ color: "white", fontSize: 24 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f4c81', fontSize: "1.2rem" }}>
                            Repetitions
                          </Typography>
                          <Chip 
                            label={`${settings?.repetitions || 5}x`}
                            size="small"
                            sx={{
                              mt: 0.5,
                              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                              color: "white",
                              fontWeight: 700,
                              fontSize: "0.85rem"
                            }}
                          />
                        </Box>
                      </Box>
                      <Slider
                        value={settings?.repetitions || 5}
                        min={1}
                        max={20}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                        onChange={(e, v) => handleChange('repetitions', v)}
                        sx={{
                          '& .MuiSlider-thumb': {
                            width: 20,
                            height: 20,
                            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            boxShadow: '0 0 0 8px rgba(245, 158, 11, 0.16)',
                            '&:hover': {
                              boxShadow: '0 0 0 10px rgba(245, 158, 11, 0.2)',
                            }
                          },
                          '& .MuiSlider-track': {
                            background: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
                            border: "none",
                            height: 6
                          },
                          '& .MuiSlider-rail': {
                            backgroundColor: 'rgba(245, 158, 11, 0.12)',
                            height: 6
                          },
                          '& .MuiSlider-mark': {
                            backgroundColor: 'rgba(245, 158, 11, 0.3)',
                            height: 8,
                            width: 2
                          }
                        }}
                      />
                    </Box>
                  </Fade>

                  <Divider sx={{ borderColor: 'rgba(59, 130, 246, 0.1)' }} />

                  {/* Theme Toggle */}
                  <Fade in timeout={800}>
                    <Box sx={{
                      p: 3,
                      borderRadius: 2,
                      background: settings?.theme === 'dark' 
                        ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.08) 0%, rgba(15, 76, 129, 0.08) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.08) 100%)',
                      border: settings?.theme === 'dark'
                        ? '2px solid rgba(30, 64, 175, 0.15)'
                        : '2px solid rgba(245, 158, 11, 0.15)',
                      transition: "all 0.3s ease"
                    }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={settings?.theme === 'dark'} 
                            onChange={(e) => handleChange('theme', e.target.checked ? 'dark' : 'light')}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#1e40af',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: 'rgba(30, 64, 175, 0.5)',
                              },
                              '& .MuiSwitch-track': {
                                backgroundColor: 'rgba(245, 158, 11, 0.5)',
                              }
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {settings?.theme === 'dark' ? (
                              <DarkModeIcon sx={{ fontSize: 22, color: '#1e40af' }} />
                            ) : (
                              <LightModeIcon sx={{ fontSize: 22, color: '#f59e0b' }} />
                            )}
                            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
                              {settings?.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  </Fade>
                </Stack>
              </CardContent>
            </Card>
            
            {/* Account Section */}
            <Fade in timeout={900}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
                background: 'rgba(255, 255, 255, 0.97)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                overflow: "hidden"
              }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                    <Box sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
                    }}>
                      <PersonIcon sx={{ color: "white", fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f4c81', fontSize: "1.2rem" }}>
                      Account
                    </Typography>
                  </Box>
                  {currentUser && (
                    <Box sx={{ 
                      mb: 3,
                      p: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(5, 150, 105, 0.06) 100%)',
                      border: '2px solid rgba(16, 185, 129, 0.15)'
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f4c81', mb: 0.5 }}>
                        Email:
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', mb: 2, fontWeight: 500 }}>
                        {currentUser.email}
                      </Typography>
                      {currentUser.displayName && (
                        <>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f4c81', mb: 0.5 }}>
                            Name:
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#666', fontWeight: 500 }}>
                            {currentUser.displayName}
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                  <Button 
                    variant="contained" 
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={logout}
                    fullWidth
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      py: 1.8,
                      fontSize: "1.05rem",
                      borderRadius: 2.5,
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      boxShadow: "0 4px 16px rgba(239, 68, 68, 0.3)",
                      '&:hover': {
                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)"
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default SettingsView;
