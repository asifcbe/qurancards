import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Card, CardContent, 
  Button, TextField, List, ListItem, 
  ListItemText, ListItemSecondaryAction,
  IconButton, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress,
  Fade, Zoom
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { UserContext } from '../contexts/UserContext';
import { getProfiles, createProfile, deleteProfile } from '../firestoreDB';
import { getJuzStartPage } from '../api';

const ProfileSelection = ({ onSelect }) => {
  const { currentUser } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [juz, setJuz] = useState(1);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load profiles from Firestore
  useEffect(() => {
    const loadProfiles = async () => {
      if (currentUser) {
        try {
          const data = await getProfiles(currentUser.uid);
          setProfiles(data);
        } catch (error) {
          console.error('Error loading profiles:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadProfiles();
  }, [currentUser]);

  const handleAddProfile = async () => {
    if (name.trim() && currentUser) {
      try {
        const newProfile = await createProfile(currentUser.uid, {
          name,
          currentJuz: juz,
          currentPage: getJuzStartPage(juz),
          memorizedPages: []
        });
        setProfiles([...profiles, newProfile]);
        onSelect(newProfile);
        setOpen(false);
        setName('');
        setJuz(1);
      } catch (error) {
        console.error('Error creating profile:', error);
      }
    }
  };

  const handleDelete = async (profileId, e) => {
    e.stopPropagation();
    if (currentUser) {
      try {
        await deleteProfile(currentUser.uid, profileId);
        setProfiles(profiles.filter(p => p.id !== profileId));
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

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
          top: "-10%",
          right: "-10%",
          width: "50%",
          height: "50%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
          filter: "blur(60px)",
        }
      }}
    >
      <Box sx={{ maxWidth: 600, mx: 'auto', position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ textAlign: 'center', mb: 5, color: 'white' }}>
            <Zoom in timeout={700}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 900,
                  mb: 1.5,
                  fontSize: { xs: '2.2rem', sm: '2.8rem' },
                  textShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  letterSpacing: '-0.5px',
                  background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.85) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                👤 Select Profile
              </Typography>
            </Zoom>
            <Typography 
              variant="body1"
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 500,
                fontSize: "1.1rem"
              }}
            >
              Continue your Quran journey ✨
            </Typography>
          </Box>
        </Fade>

        {/* Profiles List */}
        <Box sx={{ mb: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: 'white' }} size={48} />
            </Box>
          ) : profiles.length === 0 ? (
            <Fade in timeout={600}>
              <Card
                sx={{
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
                  p: 4,
                  textAlign: 'center',
                  border: "1px solid rgba(255, 255, 255, 0.3)"
                }}
              >
                <MenuBookIcon sx={{ fontSize: 64, color: "rgba(59, 130, 246, 0.3)", mb: 2 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#333',
                    fontWeight: 700,
                    mb: 1
                  }}
                >
                  No profiles yet
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666',
                    fontWeight: 500
                  }}
                >
                  Create your first profile to begin memorizing
                </Typography>
              </Card>
            </Fade>
          ) : (
            profiles.map((profile, idx) => (
              <Zoom 
                key={profile.id}
                in 
                timeout={600 + idx * 100}
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                <Card
                  onClick={() => onSelect(profile)}
                  sx={{
                    mb: 2.5,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.97)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    position: "relative",
                    overflow: "hidden",
                    '&::before': {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: "linear-gradient(90deg, #3b82f6 0%, #f59e0b 100%)",
                      transform: "scaleX(0)",
                      transformOrigin: "left",
                      transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                    },
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 16px 56px rgba(0,0,0,0.3)',
                      background: 'rgba(255, 255, 255, 1)',
                      borderColor: 'rgba(59, 130, 246, 0.4)',
                      '&::before': {
                        transform: "scaleX(1)"
                      }
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
                      }}>
                        <PersonIcon sx={{ color: "white", fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 800,
                            color: '#0f4c81',
                            mb: 0.5,
                            fontSize: "1.2rem"
                          }}
                        >
                          {profile.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#666',
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5
                          }}
                        >
                          <MenuBookIcon sx={{ fontSize: 16 }} />
                          Page {profile.currentPage}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton 
                      onClick={(e) => handleDelete(profile.id, e)}
                      sx={{
                        color: '#ff5252',
                        transition: "all 0.3s ease",
                        '&:hover': {
                          bgcolor: 'rgba(255, 82, 82, 0.15)',
                          transform: "scale(1.1)"
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardContent>
                </Card>
              </Zoom>
            ))
          )}
        </Box>

        {/* Add Profile Button */}
        <Fade in timeout={800}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              py: 2,
              fontWeight: 800,
              fontSize: '1.05rem',
              textTransform: 'none',
              borderRadius: 3,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.3)',
                borderColor: 'rgba(255, 255, 255, 0.6)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 28px rgba(0,0,0,0.25)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            Create New Profile
          </Button>
        </Fade>
      </Box>

      {/* Create Profile Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }
        }}
      >
        <Box sx={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #0f4c81 100%)',
          p: 3,
          color: 'white',
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "-50%",
            right: "-30%",
            width: "80%",
            height: "200%",
            background: "rgba(255, 255, 255, 0.05)",
            transform: "rotate(25deg)",
          }
        }}>
          <DialogTitle sx={{ p: 0, fontWeight: 900, fontSize: '1.6rem', position: "relative", zIndex: 1 }}>
            ✨ Create New Profile
          </DialogTitle>
        </Box>
        
        <DialogContent sx={{ p: 4 }}>
          <TextField
            autoFocus
            margin="normal"
            label="Profile Name"
            placeholder="e.g., Muhammad"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              startAdornment: <PersonIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)" }} />,
            }}
            sx={{
              mb: 3,
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
          <TextField
            label="Starting Juz (1-30)"
            type="number"
            fullWidth
            variant="outlined"
            inputProps={{ min: 1, max: 30 }}
            value={juz}
            onChange={(e) => setJuz(Math.min(30, Math.max(1, parseInt(e.target.value))))}
            InputProps={{
              startAdornment: <MenuBookIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)" }} />,
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
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button 
            onClick={() => {
              setOpen(false);
              setName('');
              setJuz(1);
            }}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 700,
              color: "#666",
              '&:hover': {
                bgcolor: "rgba(0,0,0,0.05)"
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddProfile} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #0f4c81 100%)',
              textTransform: 'none',
              fontWeight: 800,
              px: 3,
              boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 50%, #0c3b6b 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
              }
            }}
          >
            Create Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileSelection;
