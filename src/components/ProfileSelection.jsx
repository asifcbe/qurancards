import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Card, CardContent, 
  Button, TextField, IconButton, CircularProgress,
  Fade, Zoom, Stack, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/PersonOutline';
import MenuBookIcon from '@mui/icons-material/MenuBookOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { UserContext } from '../contexts/UserContext';
import { getProfiles, createProfile, deleteProfile, getUserDocument } from '../firestoreDB';
import { getJuzStartPage } from '../api';

const ProfileSelection = ({ onSelect }) => {
  const { currentUser } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [juz, setJuz] = useState(1);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDoc, setUserDoc] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      if (currentUser) {
        try {
          const [profilesData, userData] = await Promise.all([
            getProfiles(currentUser.uid),
            getUserDocument(currentUser.uid)
          ]);
          setProfiles(profilesData);
          setUserDoc(userData);
        } catch (error) {
          console.error('Error loading initial data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadInitialData();
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
        alert(error.message);
      }
    }
  };

  const handleDelete = async (profileId, e) => {
    e.stopPropagation();
    if (currentUser && window.confirm('Are you sure you want to delete this profile?')) {
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6, px: 2, maxWidth: 600, mx: 'auto' }}>
      <Fade in timeout={600}>
        <Box>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, letterSpacing: '-1px' }}>
              Select Profile
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
              Welcome back! Choose a profile to continue your journey.
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ mb: 4 }}>
            {profiles.length === 0 ? (
              <Card elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '24px', border: '1px dashed #E2E8F0', bgcolor: 'transparent' }}>
                <Typography variant="body1" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                  No profiles found. Create your first one to get started.
                </Typography>
              </Card>
            ) : (
              profiles.map((profile, idx) => (
                <Zoom key={profile.id} in timeout={400 + idx * 100}>
                  <Card 
                    onClick={() => onSelect(profile)}
                    sx={{ 
                      borderRadius: '20px', 
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: '#6366F1',
                        boxShadow: '0 12px 20px -5px rgba(99, 102, 241, 0.1)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: '20px !important', display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          bgcolor: '#F5F7FF', 
                          color: '#6366F1',
                          borderRadius: '14px',
                          border: '1px solid #E0E7FF'
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ ml: 2, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                          {profile.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                          Currently at Page {profile.currentPage}
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleDelete(profile.id, e)}
                        sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <ChevronRightIcon sx={{ color: '#E2E8F0', ml: 1 }} />
                    </CardContent>
                  </Card>
                </Zoom>
              ))
            )}
          </Stack>

          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              const maxProfiles = userDoc?.maxProfiles || 2;
              if (profiles.length >= maxProfiles) {
                alert(`Profile limit reached. You can only have ${maxProfiles} profiles.`);
                return;
              }
              setOpen(true);
            }}
            disabled={profiles.length >= (userDoc?.maxProfiles || 2)}
            sx={{
              py: 2,
              borderRadius: '16px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              background: '#0F172A',
              color: '#fff',
              '&:hover': { background: '#1E293B' },
              '&.Mui-disabled': {
                background: '#F1F5F9',
                color: '#94A3B8'
              }
            }}
          >
            {profiles.length >= (userDoc?.maxProfiles || 2) 
              ? `Profile Limit Reached (${userDoc?.maxProfiles || 2})` 
              : 'Create New Profile'}
          </Button>
        </Box>
      </Fade>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pb: 1 }}>New Profile</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3, fontWeight: 500 }}>
            Enter a name and starting Juz to create your profile.
          </Typography>
          <Stack spacing={2.5}>
            <TextField
              autoFocus
              label="Profile Name"
              placeholder="e.g. Muhammad"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
              label="Starting Juz (1-30)"
              type="number"
              fullWidth
              inputProps={{ min: 1, max: 30 }}
              value={juz}
              onChange={(e) => setJuz(Math.min(30, Math.max(1, parseInt(e.target.value))))}
              InputProps={{
                startAdornment: <InputAdornment position="start"><MenuBookIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#64748B', fontWeight: 600 }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddProfile}
            sx={{ 
              borderRadius: '10px', 
              px: 3, 
              background: '#6366F1',
              fontWeight: 700,
              '&:hover': { background: '#4F46E5' }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileSelection;
