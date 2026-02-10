import React, { useState, useEffect, useRef, useCallback, useContext, useMemo } from 'react';
import { 
  Box, Typography, Card, CardContent, IconButton, LinearProgress, Stack, Grid, 
  Paper, CircularProgress, FormControl, Select, MenuItem, Tooltip, Container, 
  useTheme, Fade, Divider, useMediaQuery, Switch, FormControlLabel, Chip, Slide,
  Zoom, alpha, styled, TextField, Dialog, DialogTitle, DialogContent, 
  DialogContentText, DialogActions, Button, Snackbar, Alert, Collapse
} from '@mui/material';
import {
  PlayArrowRounded, PauseRounded, ReplayRounded,
  KeyboardArrowLeftRounded, KeyboardArrowRightRounded,
  FavoriteRounded, FavoriteBorderRounded, StarRounded, Brightness4Rounded, Brightness7Rounded, 
  MenuBookRounded, VolumeUpRounded, VisibilityOffRounded,
  ExpandLessRounded, ExpandMoreRounded
} from '@mui/icons-material';

import { fetchQuranPage, fetchAudioForPage, getJuzStartPage, fetchSurahs, getSurahStartPage } from '../api';
import { updateProfile, getSettings, updateSettings, checkUserAccess } from '../firestoreDB';
import { UserContext } from '../contexts/UserContext';

const MemorizeView = ({ profile, settings, onUpgrade }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useContext(UserContext);
  
  // States
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [currentPage, setCurrentPage] = useState(profile?.currentPage || 1);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [repetitionCount, setRepetitionCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0); 
  const [surahs, setSurahs] = useState([]);
  const [playbackMode, setPlaybackMode] = useState('hifdh');
  const [verseRepetitions, setVerseRepetitions] = useState(settings?.repetitions || 5);
  const [pageRepetitions, setPageRepetitions] = useState(1);
  const [showMemorizeDialog, setShowMemorizeDialog] = useState(false);
  const [pendingMemorizeAction, setPendingMemorizeAction] = useState(null);
  const [showHeaderBar, setShowHeaderBar] = useState(true);
  const [localMemorizedPages, setLocalMemorizedPages] = useState(profile?.memorizedPages || []);
  const [hasAccess, setHasAccess] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isAyahDialogOpen, setIsAyahDialogOpen] = useState(false);
  const [selectedAyahForAction, setSelectedAyahForAction] = useState(null);
  const [isPageSelectorOpen, setIsPageSelectorOpen] = useState(false);
  const [pageSearchQuery, setPageSearchQuery] = useState('');

  const audioRef = useRef(null);
  const controllerRef = useRef({ isCancelled: false });
  const lastHandlersRef = useRef({ ended: null, error: null });

  // Modern Design System - Professional Color Palette
  const colors = {
    // Background gradients
    bgGradient: isDarkMode 
      ? 'linear-gradient(135deg, #0a0e1a 0%, #0f1419 50%, #1a1f2e 100%)'
      : 'white',
    
    // Primary surfaces
    paper: isDarkMode ? '#0f1419' : '#ffffff',
    paperElevated: isDarkMode ? '#1a1f2e' : '#ffffff',
    
    // Text hierarchy
    text: isDarkMode ? '#e3e8ef' : '#1a202c',
    textSecondary: isDarkMode ? '#9ca3af' : '#4a5568',
    textMuted: isDarkMode ? '#6b7280' : '#718096',
    
    // Accent colors
    primary: isDarkMode ? '#3b82f6' : '#2563eb',
    primaryLight: isDarkMode ? '#60a5fa' : '#3b82f6',
    gold: '#f59e0b',
    goldLight: '#fbbf24',
    
    // Semantic colors
    success: '#10b981',
    highlight: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)',
    highlightGlow: isDarkMode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.12)',
    
    // Borders & dividers
    border: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    divider: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)',
  };

  useEffect(() => {
    fetchSurahs().then(setSurahs);
  }, []);

  // Check user access
  useEffect(() => {
    const checkAccess = async () => {
      if (currentUser) {
        const access = await checkUserAccess(currentUser.uid);
        setHasAccess(access);
      } else {
        setHasAccess(false);
      }
    };
    checkAccess();
  }, [currentUser]);

  // Sync repetitions from settings
  useEffect(() => {
    if (settings?.repetitions) {
      setVerseRepetitions(settings.repetitions);
    }
  }, [settings?.repetitions]);

  // Function to check if page navigation is allowed
  const canNavigateToPage = (page) => {
    // All pages are now free to browse and use Verse/Page modes
    return true;
  };

  useEffect(() => {
    loadPage(currentPage);
    if (profile?.id && currentUser) { 
      updateProfile(currentUser.uid, profile.id, { currentPage }); 
    }
  }, [currentPage, profile?.id, settings?.reciter, currentUser]);

  useEffect(() => {
    if (profile?.memorizedPages) {
      setLocalMemorizedPages(profile.memorizedPages);
    }
  }, [profile?.memorizedPages]);

  const isMemorized = useMemo(() => 
    localMemorizedPages.includes(currentPage), 
  [localMemorizedPages, currentPage]);

  const loadPage = async (page) => {
    setLoading(true);
    try {
      const { lines, ayahs } = await fetchQuranPage(page, settings?.scriptType);
      const audio = await fetchAudioForPage(page, settings?.reciter);
      console.log('Loaded audio:', audio?.ayahs?.slice(0, 2)); // DEBUG
      setPageData({ lines, ayahs });
      setAudioData(audio);
      resetToFirstAyah();
    } catch (err) { 
      console.error('Load page error:', err); 
    } finally { 
      setLoading(false); 
    }
  };

  const getCurrentSequence = useCallback(() => {
    if (!pageData?.ayahs) return [0];
    
    const totalVerses = pageData.ayahs.length;
    let stepCounter = 0;
    
    for (let i = 0; i < totalVerses; i++) {
      const stepsForThisVerse = 2;
      if (stepCounter + stepsForThisVerse > step) {
        if ((step - stepCounter) === 0) {
          return [i];
        } else {
          return Array.from({ length: i + 1 }, (_, idx) => idx);
        }
      }
      stepCounter += stepsForThisVerse;
    }
    return [];
  }, [step, pageData]);

  const currentSequence = useMemo(() => getCurrentSequence(), [getCurrentSequence]);

  // **FIXED: Wait for audio ENDED event, not just play() promise**
  const playAudio = async (audioUrl, onEndedCallback) => {
    if (!audioUrl || !audioRef.current) {
      console.warn('No audio URL or ref');
      return false;
    }
    
    return new Promise((resolve) => {
      const audio = audioRef.current;
      
      // Cleanup previous listeners
      if (lastHandlersRef.current.ended) {
        audio.removeEventListener('ended', lastHandlersRef.current.ended);
      }
      if (lastHandlersRef.current.error) {
        audio.removeEventListener('error', lastHandlersRef.current.error);
      }
      
      // Reset and load
      audio.pause();
      audio.currentTime = 0;
      audio.src = audioUrl;
      
      const handleEnded = () => {
        console.log('✅ Ayah finished playing');
        cleanup();
        resolve(true);
        if (onEndedCallback) onEndedCallback();
      };
      
      const handleError = (e) => {
        console.error('❌ Audio error:', e);
        cleanup();
        resolve(false);
      };
      
      const cleanup = () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        lastHandlersRef.current = { ended: null, error: null };
      };
      
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      lastHandlersRef.current = { ended: handleEnded, error: handleError };
      
      audio.play().catch(e => {
        console.error('❌ Play failed:', e);
        cleanup();
        resolve(false);
      });
    });
  };

  const playSequence = useCallback(async (indices) => {
    console.log('🎵 Playing sequence:', indices);
    
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      
      if (controllerRef.current.isCancelled) {
        console.log('⏹️ Sequence cancelled');
        return;
      }
      
      if (index >= (audioData?.ayahs?.length || 0)) {
        console.warn('Invalid index:', index);
        continue;
      }
      
      const ayahAudio = audioData?.ayahs[index];
      if (!ayahAudio?.audio) {
        console.warn('No audio for:', index);
        continue;
      }
      
      console.log(`🔊 Playing ayah ${index + 1}/${indices.length}:`, ayahAudio.audio);
      setCurrentAyahIndex(index);
      
      // **CRITICAL FIX: Wait for each ayah to FINISH before next**
      const success = await playAudio(ayahAudio.audio);
      if (!success || controllerRef.current.isCancelled) {
        console.log('⏹️ Stopped at ayah', index);
        break;
      }
    }
    console.log('✅ Sequence complete');
  }, [audioData]);

  // **SIMPLIFIED EFFECT - No complex deps causing loops**
  useEffect(() => {
    if (!isPlaying || !audioData || !pageData) return;

    controllerRef.current.isCancelled = false;

    const executePlayback = async () => {
      try {
        const totalVerses = pageData.ayahs.length;
        const maxReps = verseRepetitions || 5;

        if (playbackMode === 'hifdh') {
          // Hifdh Mode: [1*X, [2*X, [1,2]*X], [3*X, [1,2,3]*X], ...]
          for (let verseIndex = step; verseIndex < totalVerses && !controllerRef.current.isCancelled; verseIndex++) {
            console.log(`📚 Hifdh Mode: Starting verse ${verseIndex + 1}/${totalVerses}`);
            setStep(verseIndex);
            
            // Step 1: Play NEW verse alone X times
            console.log(`🔁 Playing NEW verse ${verseIndex + 1} solo ${maxReps} times`);
            for (let rep = 0; rep < maxReps && !controllerRef.current.isCancelled; rep++) {
              setRepetitionCount(rep);
              await playSequence([verseIndex]);
              if (controllerRef.current.isCancelled) break;
            }
            
            if (controllerRef.current.isCancelled) break;
            
            // Step 2: Play ALL accumulated verses [0...verseIndex] X times
            // Skip for first verse (would be redundant since accumulated = solo)
            if (verseIndex > 0) {
              const accumulatedSequence = Array.from({ length: verseIndex + 1 }, (_, i) => i);
              console.log(`🔗 Playing accumulated verses [1-${verseIndex + 1}] ${maxReps} times`);
              for (let rep = 0; rep < maxReps && !controllerRef.current.isCancelled; rep++) {
                setRepetitionCount(rep);
                await playSequence(accumulatedSequence);
                if (controllerRef.current.isCancelled) break;
              }
            }
            
            if (controllerRef.current.isCancelled) break;
          }
          console.log('✅ Hifdh mode complete');
          setIsPlaying(false);
          
        } else if (playbackMode === 'verse') {
          // Verse Mode: Each verse plays X times before moving to next
          for (let verseIndex = step; verseIndex < totalVerses && !controllerRef.current.isCancelled; verseIndex++) {
            console.log(`🔄 Verse Mode: Playing verse ${verseIndex + 1}/${totalVerses} ${maxReps} times`);
            setStep(verseIndex);
            for (let rep = 0; rep < maxReps && !controllerRef.current.isCancelled; rep++) {
              setRepetitionCount(rep);
              await playSequence([verseIndex]);
              if (controllerRef.current.isCancelled) break;
            }
          }
          console.log('✅ Verse mode complete');
          setIsPlaying(false);
          
        } else if (playbackMode === 'fullpage') {
          // Page Mode: Play each verse once, repeat the whole page X times
          const maxPageReps = pageRepetitions || 1;
          console.log(`📖 Page Mode: Playing all ${totalVerses} verses ${maxPageReps} times starting from verse ${step + 1}`);
          
          for (let rep = 0; rep < maxPageReps && !controllerRef.current.isCancelled; rep++) {
            setRepetitionCount(rep);
            // On first repetition, start from current step. On subsequent, start from 0.
            const startVerse = rep === 0 ? step : 0;
            
            for (let verseIndex = startVerse; verseIndex < totalVerses && !controllerRef.current.isCancelled; verseIndex++) {
              setStep(verseIndex);
              await playSequence([verseIndex]);
              if (controllerRef.current.isCancelled) break;
            }
          }
          console.log('✅ Page mode complete');
          setIsPlaying(false);
        }
      } catch (error) {
        console.error('Playback error:', error);
        setIsPlaying(false);
      }
    };

    executePlayback();

    return () => {
      console.log('🛑 Cleaning up playback effect');
      controllerRef.current.isCancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [isPlaying, playbackMode, verseRepetitions, pageData, audioData, playSequence]);

  const togglePlay = () => {
    console.log('Toggle play:', !isPlaying);
    
    // Check for Premium Hifdh Mode access
    if (!isPlaying && playbackMode === 'hifdh') {
      const isFreePage = currentPage === 30 || currentPage === 31;
      if (!hasAccess && !isFreePage) {
        setToastMessage('⭐ Hifdh Mode is a Premium feature! Try it free on pages 30 & 31.');
        setToastOpen(true);
        return;
      }
    }

    if (isPlaying) {
      controllerRef.current.isCancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
    setIsPlaying(prev => !prev);
  };

  const resetToFirstAyah = () => {
    controllerRef.current.isCancelled = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setStep(0);
    setRepetitionCount(0);
    setCurrentAyahIndex(0);
    setIsPlaying(false);
  };

  const handlePageChange = (newPage) => {
    if (canNavigateToPage(newPage)) {
      setCurrentPage(newPage);
    }
  };

  const handleSurahChange = async (surahNumber) => {
    const targetSurahNum = parseInt(surahNumber);
    const startPage = await getSurahStartPage(targetSurahNum);
    
    // Check if surah starts on current page to jump locally instead of re-loading
    if (startPage === currentPage && pageData?.ayahs) {
      const firstAyahIndex = pageData.ayahs.findIndex(a => a.surah?.number === targetSurahNum);
      if (firstAyahIndex !== -1) {
        setCurrentAyahIndex(firstAyahIndex);
        setStep(firstAyahIndex);
        setRepetitionCount(0);
        setIsPlaying(false);
        return;
      }
    }
    
    if (canNavigateToPage(startPage)) {
      setCurrentPage(startPage);
    }
  };

  const handleJuzChange = (juzNumber) => {
    const startPage = getJuzStartPage(juzNumber);
    if (canNavigateToPage(startPage)) {
      setCurrentPage(startPage);
    }
  };

  if (loading && !pageData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh" bgcolor={colors.paper}>
        <CircularProgress thickness={4} size={50} sx={{ color: colors.quranGreen }} />
      </Box>
    );
  }

  const maxAyahReached = currentSequence.length > 0 ? Math.max(...currentSequence) : 0;
  return (
    <Box sx={{ 
      background: colors.bgGradient,
      minHeight: '100vh',
      mt:2,
      pb: 4,
      transition: 'background 0.3s ease',
      display: 'flex',
      justifyContent: 'center'
    }}>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="auto"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
      
      <Container maxWidth={false} disableGutters sx={{ pt: { xs: 0, md: 2 }, px: 0 }}>
        
        {/* --- UPGRADE BANNER FOR FREE USERS --- */}
        {!hasAccess && (
          <Fade in={!loading}>
            <Box 
              onClick={onUpgrade}
              sx={{ 
                mb: 2, 
                mx: { xs: 0.5, md: 2 },
                p: 2, 
                borderRadius: 4, 
                background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 20px -3px rgba(99, 102, 241, 0.4)',
                }
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  p: 1, 
                  borderRadius: '12px',
                  display: 'flex'
                }}>
                  <FavoriteRounded sx={{ color: '#FCD34D' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    Premium Plan Available
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Unlock Smart Hifdh Mode, 10+ reciters, and ad-free experience.
                  </Typography>
                </Box>
              </Stack>
              <Button 
                variant="contained" 
                size="small"
                sx={{ 
                  bgcolor: 'white', 
                  color: '#6366F1', 
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  px: 2,
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#F8FAFC' }
                }}
              >
                Upgrade Now
              </Button>
            </Box>
          </Fade>
        )}
        
        {/* --- MODERN MUSHAF PAGE WITH ELEVATED DESIGN --- */}
        <Zoom in={!loading} timeout={600}>
          <Card 
            id="mushaf-card"
            elevation={0}
            sx={{ 
              borderRadius: 0, 
              background: colors.paper,
              border: 'none', // Removed all borders for edge-to-edge feel
              boxShadow: 'none', // Removed shadow for lean layout
              minHeight: { xs: 'auto', md: '1050px' },
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              m: 0,
              p: 0,
              transition: 'all 0.3s ease'
            }}
          >
            <CardContent sx={{ 
              p: 0, // Zero padding
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ 
                direction: 'rtl', 
                textAlign: 'center', 
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
                px: 0 // Zero horizontal padding
              }}>
                {pageData?.lines && Object.keys(pageData.lines).sort((a,b) => Number(a)-Number(b)).map((lineNum, index, arr) => (
                  <Box key={lineNum} sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    width: '100%',
                    borderBottom: index < arr.length - 1 ? `1px solid ${colors.divider}` : 'none',
                    pb: { xs: 0.3, sm: 0.8, md: 1 },
                    mb: { xs: 0.3, sm: 0.8, md: 1 },
                  }}>
                    <Box sx={{ 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'center',
                      px: { xs: 1, sm: 2, md: 4, lg: 6 } // Padding for the container
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        width: '100%',
                        maxWidth: { xs: '100%', sm: '600px', md: '750px', lg: '900px' }, // Constrain width on tablets and larger screens
                        // Justified layout with minimal spacing
                        justifyContent: 'space-between',
                        gap: '2px', // Consistent minimal spacing
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                        direction: 'rtl',
                        minHeight: { xs: '2.2rem', sm: '4rem', md: '5rem' },
                        overflowX: 'hidden'
                      }}>
                        {pageData.lines[lineNum].map((word, wIndex) => {
                          const ayahIndex = pageData.ayahs.findIndex(a => a.verseKey === word.verseKey);
                          const isPlayingNow = ayahIndex === currentAyahIndex;
                          const isFirstAyahOfSurah = ayahIndex !== -1 && pageData.ayahs[ayahIndex].numberInSurah === 1;
                          
                          return (
                            <Typography 
                              key={word.id || wIndex}
                              component="span" 
                              onClick={() => {
                                if (ayahIndex !== -1) {
                                  setSelectedAyahForAction(ayahIndex);
                                  setIsAyahDialogOpen(true);
                                  if (isPlaying) setIsPlaying(false);
                                }
                              }}
                              sx={{ 
                                fontFamily: '"Amiri", "Scheherazade New", "Noto Naskh Arabic", serif',
                                fontSize: { 
                                  xs: 'clamp(0.9rem, 4.5vw, 1.3rem)', 
                                  sm: '1.8rem', 
                                  md: '2.2rem',
                                  lg: '2.5rem' 
                                }, 
                                fontWeight: 500,
                                // Color changes when active, or red for surah beginning
                                color: isPlayingNow 
                                  ? (isDarkMode ? '#60a5fa' : '#2563eb') 
                                  : (isFirstAyahOfSurah ? '#ef4444' : colors.text), 
                                // Background highlight logic
                                backgroundColor: isPlayingNow 
                                  ? (isDarkMode ? 'rgba(59, 130, 246, 0.18)' : 'rgba(37, 99, 235, 0.08)')
                                  : 'transparent',
                                cursor: 'pointer',
                                px: { xs: '2px', sm: '4px', md: '6px' },
                                py: '2px',
                                borderRadius: '4px',
                                filter: isGhostMode && !isPlayingNow ? 'blur(6px)' : 'none',
                                opacity: isGhostMode && !isPlayingNow ? 0.06 : 1,
                                // Premium transitions
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                // Active glow effect
                                boxShadow: isPlayingNow 
                                  ? (isDarkMode 
                                      ? '0 0 15px rgba(59, 130, 246, 0.2)' 
                                      : '0 0 12px rgba(37, 99, 235, 0.1)')
                                  : 'none',
                                transform: isPlayingNow ? 'scale(1.02)' : 'none',
                                zIndex: isPlayingNow ? 2 : 1,
                                '&:hover': {
                                  backgroundColor: isPlayingNow 
                                    ? (isDarkMode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.12)')
                                    : colors.highlight,
                                  transform: 'scale(1.05)',
                                  zIndex: 3
                                }
                              }}
                            >
                              {word.charType === 'end' ? (
                                <Box component="span" sx={{ 
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mx: { xs: 0.1, md: 0.5 },
                                  color: isPlayingNow ? colors.primary : colors.gold,
                                  width: { xs: 20, sm: 36, md: 42 },
                                  height: { xs: 20, sm: 36, md: 42 },
                                  backgroundImage: isPlayingNow
                                    ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z' fill='none' stroke='%232563eb' stroke-width='6'/%3E%3C/svg%3E")`
                                    : `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z' fill='none' stroke='%23f59e0b' stroke-width='4'/%3E%3C/svg%3E")`,
                                  backgroundSize: 'contain',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'center',
                                  fontSize: '0.55em',
                                  fontWeight: 800,
                                  lineHeight: 1,
                                  transition: 'all 0.3s ease'
                                }}>
                                  {word.verseKey.split(':')[1]}
                                </Box>
                              ) : word.text}
                            </Typography>
                          );
                        })}
                      </Box>
                    </Box>
                  </Box>
                ))}
  
              </Box>
            </CardContent>
            
            <Box sx={{ 
              p: { xs: 1, md: 2.5 }, 
              textAlign: 'center', 
              borderTop: `1px solid ${colors.divider}`,
              background: isDarkMode 
                ? 'linear-gradient(to top, rgba(0,0,0,0.1), transparent)'
                : 'linear-gradient(to top, rgba(0,0,0,0.02), transparent)'
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: 'serif', 
                  letterSpacing: 3,
                  color: colors.textMuted,
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                 {currentPage}
              </Typography>
            </Box>
          </Card>
        </Zoom>

        {/* --- RE-DESIGNED PREMIUM PLAYER BAR --- */}
        <Paper 
          elevation={0}
          sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              mt: { xs: 2.5, md: 4 }, 
              borderRadius: { xs: 0, sm: 4 }, 
              background: isDarkMode ? 'rgba(15, 20, 25, 0.85)' : 'white',
              backdropFilter: 'blur(25px) saturate(200%)',
              borderTop: `1px solid ${colors.border}`,
              borderBottom: `1px solid ${colors.border}`,
              position: 'sticky', 
              bottom: 0, 
              zIndex: 1100,
              boxShadow: isDarkMode ? '0 -10px 40px rgba(0, 0, 0, 0.4)' : '0 -10px 40px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.4s ease'
            }}
          >
          {/* Collapse/Expand Toggle - Professional Centered Handle */}
          <Box 
            onClick={() => setShowHeaderBar(!showHeaderBar)}
            sx={{ 
              display: 'flex', justifyContent: 'center', cursor: 'pointer',
              mt: -1, mb: 0.5, py: 0.5, opacity: 0.6,
              '&:hover': { opacity: 1 }
            }}
          >
            <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: colors.divider, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}>
                {showHeaderBar ? <ExpandLessRounded fontSize="small" /> : <ExpandMoreRounded fontSize="small" />}
              </Box>
            </Box>
          </Box>

          <Stack 
            direction="column"
            spacing={2} 
            alignItems="center"
          >
            <Collapse in={showHeaderBar} sx={{ width: '100%' }}>
              <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
                {/* NAVIGATION (Surah, Juz, Page) */}
                <Stack 
                  direction="row" 
                  spacing={1} 
                  alignItems="center" 
                  justifyContent="center" 
                  sx={{ width: '100%', flexWrap: 'wrap', gap: 1 }}
                >
                  <FormControl size="small" sx={{ minWidth: { xs: 120, md: 150 }, flexGrow: { xs: 1, md: 0 } }}>
                    <Select 
                      value={pageData?.ayahs[currentAyahIndex]?.surah?.number || pageData?.ayahs[0]?.surah?.number || ''}
                      onChange={(e) => handleSurahChange(e.target.value)}
                      sx={{ 
                        height: 36, fontWeight: 700, borderRadius: 2,
                        bgcolor: colors.highlight,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border }
                      }}
                      IconComponent={MenuBookRounded}
                    >
                      {surahs.map(s => (
                        <MenuItem key={s.number} value={s.number} sx={{ fontSize: '0.85rem' }}>
                          {s.number}. {s.englishName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: { xs: 75, md: 90 }, flexGrow: { xs: 1, md: 0 } }}>
                    <Select
                      value={Math.ceil(currentPage / 20)}
                      onChange={(e) => handleJuzChange(e.target.value)}
                      sx={{ 
                        height: 36, fontWeight: 700, borderRadius: 2,
                        bgcolor: colors.highlight,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border }
                      }}
                    >
                      {Array.from({length: 30}, (_, i) => i + 1).map(j => (
                        <MenuItem key={j} value={j} sx={{ fontSize: '0.85rem' }}>Juz {j}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Paper 
                    elevation={0} 
                    onClick={() => setIsPageSelectorOpen(true)}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      bgcolor: colors.highlight, 
                      borderRadius: 2, 
                      border: `1px solid ${colors.border}`, 
                      p: 0.25,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: alpha(colors.primary, 0.08), borderColor: colors.primary }
                    }}
                  >
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePageChange(currentPage - 1); }} disabled={currentPage === 1}>
                      <KeyboardArrowLeftRounded />
                    </IconButton>
                    <Box sx={{ px: 1, minWidth: 40, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: colors.text }}>
                        {currentPage}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePageChange(currentPage + 1); }} disabled={currentPage === 604}>
                      <KeyboardArrowRightRounded />
                    </IconButton>
                  </Paper>
                </Stack>

                {/* SECONDARY CONTROLS (Modes, Settings) */}
                <Stack 
                  direction="row" 
                  spacing={1.5} 
                  alignItems="center" 
                  justifyContent="center"
                  sx={{ width: '100%', flexWrap: 'wrap' }}
                >
                  <FormControl size="small" sx={{ minWidth: 90 }}>
                    <Select
                      value={playbackMode}
                      onChange={(e) => setPlaybackMode(e.target.value)}
                      sx={{ height: 32, borderRadius: 2, fontWeight: 700, bgcolor: alpha(colors.primary, 0.08), color: colors.primary }}
                    >
                      <MenuItem value="hifdh">🎓 Hifdh</MenuItem>
                      <MenuItem value="verse">🔄 Verse</MenuItem>
                      <MenuItem value="fullpage">📖 Page</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 55 }}>
                    <Select
                      value={playbackMode === 'fullpage' ? pageRepetitions : verseRepetitions}
                      onChange={(e) => {
                        if (playbackMode === 'fullpage') {
                          setPageRepetitions(e.target.value);
                        } else {
                          setVerseRepetitions(e.target.value);
                        }
                      }}
                      sx={{ height: 32, borderRadius: 2, fontWeight: 700, bgcolor: playbackMode === 'fullpage' ? alpha(colors.primary, 0.1) : alpha(colors.gold, 0.1), color: playbackMode === 'fullpage' ? colors.primary : colors.gold }}
                    >
                      {[1, 2, 3, 5, 10, 15, 20, 30].map(num => <MenuItem key={num} value={num}>{num}×</MenuItem>)}
                    </Select>
                  </FormControl>

                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => setIsGhostMode(!isGhostMode)} sx={{ bgcolor: isGhostMode ? alpha(colors.success, 0.1) : colors.highlight, color: isGhostMode ? colors.success : colors.textMuted }}>
                      <VisibilityOffRounded fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setIsDarkMode(!isDarkMode)} sx={{ bgcolor: alpha(colors.primary, 0.1), color: colors.primary }}>
                      {isDarkMode ? <Brightness7Rounded fontSize="small" /> : <Brightness4Rounded fontSize="small" />}
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setPendingMemorizeAction(!isMemorized);
                        setShowMemorizeDialog(true);
                      }} 
                      sx={{ 
                        bgcolor: isMemorized ? alpha('#e11d48', 0.1) : colors.highlight, 
                        color: isMemorized ? '#e11d48' : colors.textMuted 
                      }}
                    >
                      {isMemorized ? <FavoriteRounded fontSize="small" /> : <FavoriteBorderRounded fontSize="small" />}
                    </IconButton>
                  </Stack>
                </Stack>
              </Stack>
            </Collapse>

            {/* PRIMARY CONTROLS (Always Visible) */}
            <Stack 
              direction="row" 
              spacing={{ xs: 2, md: 4 }} 
              alignItems="center" 
              justifyContent="center"
              sx={{ width: '100%' }}
            >
              <IconButton onClick={resetToFirstAyah} sx={{ bgcolor: colors.highlight, color: colors.text, width: 44, height: 44 }}>
                <ReplayRounded />
              </IconButton>

              <IconButton 
                onClick={togglePlay} 
                sx={{ 
                  bgcolor: colors.gold, color: 'white', width: 60, height: 60,
                  boxShadow: `0 8px 25px ${alpha(colors.gold, 0.3)}`,
                  '&:hover': { bgcolor: colors.goldLight, transform: 'scale(1.05)' },
                  transition: 'all 0.2s'
                }}
              >
                {isPlaying ? <PauseRounded sx={{ fontSize: '2.5rem' }} /> : <PlayArrowRounded sx={{ fontSize: '2.5rem' }} />}
              </IconButton>

              <Box sx={{ minWidth: 44, display: 'flex', justifyContent: 'center' }}>
                {isPlaying && (
                  <Typography variant="caption" sx={{ fontWeight: 800, color: colors.primary, fontSize: '0.8rem' }}>
                    {step + 1}/{pageData?.ayahs.length}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Stack>
        </Paper>

        {/* Memorization Confirmation Dialog */}
        <Dialog
          open={showMemorizeDialog}
          onClose={() => setShowMemorizeDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              bgcolor: colors.paper,
              border: `1px solid ${colors.border}`,
              boxShadow: isDarkMode
                ? '0 20px 60px rgba(0, 0, 0, 0.5)'
                : '0 20px 60px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          <DialogTitle sx={{ 
            color: colors.text,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            letterSpacing: '-0.5px'
          }}>
            {pendingMemorizeAction ? (
              <FavoriteRounded sx={{ color: '#e11d48', fontSize: '1.8rem' }} />
            ) : (
              <FavoriteBorderRounded sx={{ color: colors.textSecondary, fontSize: '1.8rem' }} />
            )}
            {pendingMemorizeAction ? 'Mark as Memorized?' : 'Remove from Memorized?'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: colors.textSecondary, fontWeight: 500 }}>
              {pendingMemorizeAction 
                ? `Would you like to add page ${currentPage} to your memorized favorites?`
                : `Would you like to remove page ${currentPage} from your memorized favorites?`
              }
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
            <Button 
              onClick={() => setShowMemorizeDialog(false)}
              sx={{ 
                color: colors.textSecondary,
                fontWeight: 700,
                px: 3,
                '&:hover': { bgcolor: colors.highlight }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                const actionIsAdd = pendingMemorizeAction;
                const updatedPages = actionIsAdd
                  ? [...new Set([...localMemorizedPages, currentPage])]
                  : localMemorizedPages.filter(p => p !== currentPage);
                
                // Update local state for immediate UI feedback
                setLocalMemorizedPages(updatedPages);
                
                if (profile?.id && currentUser) {
                  await updateProfile(currentUser.uid, profile.id, { 
                    memorizedPages: updatedPages 
                  });
                }
                setShowMemorizeDialog(false);
              }}
              variant="contained"
              sx={{ 
                bgcolor: pendingMemorizeAction ? '#e11d48' : colors.primary,
                color: '#fff',
                fontWeight: 800,
                px: 4,
                borderRadius: '12px',
                '&:hover': { 
                  bgcolor: pendingMemorizeAction ? '#be123c' : colors.primaryDark,
                  boxShadow: `0 8px 20px ${alpha(pendingMemorizeAction ? '#e11d48' : colors.primary, 0.3)}`
                },
                boxShadow: `0 4px 12px ${alpha(pendingMemorizeAction ? '#e11d48' : colors.primary, 0.2)}`
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Ayah Action Dialog */}
      <Dialog 
        open={isAyahDialogOpen} 
        onClose={() => setIsAyahDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: colors.paper,
            backgroundImage: 'none',
            border: `1px solid ${colors.border}`
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, color: colors.text }}>
          {selectedAyahForAction !== null && `Ayah ${selectedAyahForAction + 1}`}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ textAlign: 'center', mb: 2, color: colors.textSecondary }}>
            How would you like to start playback?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 3, pt: 0 }}>
          <Button 
            fullWidth 
            variant="contained" 
            onClick={() => {
              setStep(selectedAyahForAction);
              setCurrentAyahIndex(selectedAyahForAction);
              setRepetitionCount(0);
              setIsPlaying(true);
              setIsAyahDialogOpen(false);
            }}
            sx={{ 
              bgcolor: colors.primary, 
              color: 'white', 
              fontWeight: 700,
              '&:hover': { bgcolor: colors.primaryLight }
            }}
          >
            Start from Here
          </Button>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={() => {
              setStep(0);
              setCurrentAyahIndex(0);
              setRepetitionCount(0);
              setIsPlaying(true);
              setIsAyahDialogOpen(false);
            }}
            sx={{ 
              borderColor: colors.divider, 
              color: colors.text,
              fontWeight: 700,
              '&:hover': { borderColor: colors.primary, bgcolor: colors.highlight }
            }}
          >
            Start from Beginning
          </Button>
          <Button 
            fullWidth 
            onClick={() => setIsAyahDialogOpen(false)}
            sx={{ color: colors.textMuted, mt: 1 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

        {/* Elegant Page Selector Dialog */}
        <Dialog
          open={isPageSelectorOpen}
          onClose={() => setIsPageSelectorOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              bgcolor: colors.paper,
              maxHeight: '80vh',
              backgroundImage: 'none',
              border: `1px solid ${colors.border}`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }
          }}
        >
          <DialogTitle sx={{ 
            p: 3, 
            pb: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: `1px solid ${colors.divider}`
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: colors.text }}>Jump to Page</Typography>
            <TextField
              placeholder="Search page..."
              size="small"
              value={pageSearchQuery}
              onChange={(e) => setPageSearchQuery(e.target.value)}
              sx={{ 
                width: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: colors.highlight,
                  '& fieldset': { borderColor: 'transparent' }
                }
              }}
            />
          </DialogTitle>
          <DialogContent sx={{ p: 2 }}>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {Array.from({ length: 604 }, (_, i) => i + 1)
                .filter(p => p.toString().includes(pageSearchQuery))
                .map((p) => {
                  const isCurrent = p === currentPage;
                  return (
                    <Grid item xs={3} sm={2} md={1.5} lg={1.2} key={p}>
                      <Button
                        fullWidth
                        onClick={() => {
                          handlePageChange(p);
                          setIsPageSelectorOpen(false);
                          setPageSearchQuery('');
                        }}
                        sx={{
                          height: 48,
                          borderRadius: 3,
                          fontWeight: isCurrent ? 800 : 600,
                          bgcolor: isCurrent ? colors.primary : colors.highlight,
                          color: isCurrent ? 'white' : colors.text,
                          border: `1px solid ${isCurrent ? colors.primary : colors.divider}`,
                          '&:hover': {
                            bgcolor: isCurrent ? colors.primaryLight : alpha(colors.primary, 0.1),
                            borderColor: colors.primary,
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s',
                          fontSize: '0.9rem'
                        }}
                      >
                        {p}
                      </Button>
                    </Grid>
                  );
                })}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.divider}` }}>
            <Button onClick={() => setIsPageSelectorOpen(false)} sx={{ color: colors.textSecondary, fontWeight: 700 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast Notification */}
        <Snackbar
          open={toastOpen}
          autoHideDuration={4000}
          onClose={() => setToastOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setToastOpen(false)} 
            severity="warning" 
            variant="filled"
            sx={{ 
              width: '100%',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'
            }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>

      </Container>
    </Box>
  );

};

export default MemorizeView;
