import React, { useState, useEffect, useRef, useCallback, useContext, useMemo } from 'react';
import { 
  Box, Typography, Card, CardContent, IconButton, LinearProgress, Stack, Grid, 
  Paper, CircularProgress, FormControl, Select, MenuItem, Tooltip, Container, 
  useTheme, Fade, Divider, useMediaQuery, Switch, FormControlLabel, Chip, Slide,
  Zoom, alpha, styled, TextField, Dialog, DialogTitle, DialogContent, 
  DialogContentText, DialogActions, Button
} from '@mui/material';
import {
  PlayArrowRounded, PauseRounded, ReplayRounded,
  KeyboardArrowLeftRounded, KeyboardArrowRightRounded,
  StarRounded, Brightness4Rounded, Brightness7Rounded, 
  MenuBookRounded, VolumeUpRounded, VisibilityOffRounded,
  ExpandLessRounded, ExpandMoreRounded
} from '@mui/icons-material';

import { fetchQuranPage, fetchAudioForPage, getJuzStartPage, fetchSurahs, getSurahStartPage } from '../api';
import { updateProfile, getSettings, updateSettings } from '../firestoreDB';
import { UserContext } from '../contexts/UserContext';

const MemorizeView = ({ profile, settings }) => {
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
  const [isMemorized, setIsMemorized] = useState(false);
  const [playbackMode, setPlaybackMode] = useState('hifdh');
  const [verseRepetitions, setVerseRepetitions] = useState(settings?.repetitions || 5);
  const [showMemorizeDialog, setShowMemorizeDialog] = useState(false);
  const [pendingMemorizeAction, setPendingMemorizeAction] = useState(null);
  const [showHeaderBar, setShowHeaderBar] = useState(true);

  const audioRef = useRef(null);
  const controllerRef = useRef({ isCancelled: false });
  const lastHandlersRef = useRef({ ended: null, error: null });

  // Modern Design System - Professional Color Palette
  const colors = {
    // Background gradients
    bgGradient: isDarkMode 
      ? 'linear-gradient(135deg, #0a0e1a 0%, #0f1419 50%, #1a1f2e 100%)'
      : 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f5f8ff 100%)',
    
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

  // Sync repetitions from settings
  useEffect(() => {
    if (settings?.repetitions) {
      setVerseRepetitions(settings.repetitions);
    }
  }, [settings?.repetitions]);

  useEffect(() => {
    loadPage(currentPage);
    if (profile?.id && currentUser) { 
      updateProfile(currentUser.uid, profile.id, { currentPage }); 
    }
    setIsMemorized(profile?.memorizedPages?.includes(currentPage) || false);
  }, [currentPage, profile, settings?.reciter, currentUser]);

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
          for (let verseIndex = 0; verseIndex < totalVerses && !controllerRef.current.isCancelled; verseIndex++) {
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
            const accumulatedSequence = Array.from({ length: verseIndex + 1 }, (_, i) => i);
            console.log(`🔗 Playing accumulated verses [1-${verseIndex + 1}] ${maxReps} times`);
            for (let rep = 0; rep < maxReps && !controllerRef.current.isCancelled; rep++) {
              setRepetitionCount(rep);
              await playSequence(accumulatedSequence);
              if (controllerRef.current.isCancelled) break;
            }
            
            if (controllerRef.current.isCancelled) break;
          }
          console.log('✅ Hifdh mode complete');
          setIsPlaying(false);
          
        } else if (playbackMode === 'verse') {
          // Verse Mode: Each verse plays X times before moving to next
          for (let verseIndex = 0; verseIndex < totalVerses && !controllerRef.current.isCancelled; verseIndex++) {
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
          // Page Mode: Play each verse once (like verse mode with reps=1)
          console.log(`📖 Page Mode: Playing all ${totalVerses} verses once`);
          for (let verseIndex = 0; verseIndex < totalVerses && !controllerRef.current.isCancelled; verseIndex++) {
            setStep(verseIndex);
            setRepetitionCount(0);
            await playSequence([verseIndex]);
            if (controllerRef.current.isCancelled) break;
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
    if (playbackMode === 'hifdh') {
      setStep(0);
      setRepetitionCount(0);
    } else {
      setRepetitionCount(0);
    }
    setCurrentAyahIndex(0);
    setIsPlaying(false);
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
      pb: 4,
      transition: 'background 0.3s ease'
    }}>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="auto"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
      
      <Container maxWidth="lg" sx={{ pt: { xs: 1, md: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>
        
        {/* --- MODERN MUSHAF PAGE WITH ELEVATED DESIGN --- */}
        <Zoom in={!loading} timeout={600}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 4, 
              background: colors.paper,
              border: `1px solid ${colors.border}`,
              boxShadow: isDarkMode 
                ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.03) inset'
                : '0 20px 60px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 1) inset',
              maxWidth: { xs: '100%', md: '900px' },
              margin: '0 auto',
              minHeight: { xs: 'auto', md: '1050px' },
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: isDarkMode
                  ? '0 24px 70px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 255, 255, 0.05) inset'
                  : '0 24px 70px rgba(0, 0, 0, 0.12), 0 1px 0 rgba(255, 255, 255, 1) inset',
              }
            }}
          >
            <CardContent sx={{ 
              p: { xs: 1.5, sm: 2.5, md: 5 }, 
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
                px: { xs: 0.5, sm: 1, md: 2 }
              }}>
                {pageData?.lines && Object.keys(pageData.lines).sort((a,b) => Number(a)-Number(b)).map((lineNum) => (
                  <Box key={lineNum} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    width: '100%',
                    mb: { xs: 0.4, sm: 0.6, md: 1 },
                    lineHeight: { xs: 1.55, sm: 1.75, md: 1.85 }
                  }}>
                    <Box sx={{ 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'center',
                      textAlign: 'justify' 
                    }}>
                      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        {pageData.lines[lineNum].map((word, wIndex) => {
                          const ayahIndex = pageData.ayahs.findIndex(a => a.verseKey === word.verseKey);
                          const isPlayingNow = ayahIndex === currentAyahIndex;
                          
                          return (
                            <React.Fragment key={word.id || wIndex}>
                              <Typography 
                                component="span" 
                                onClick={() => {
                                  if (ayahIndex !== -1) {
                                    setCurrentAyahIndex(ayahIndex);
                                    setIsPlaying(false);
                                  }
                                }}
                                sx={{ 
                                  fontFamily: '"Amiri", "Scheherazade New", "Noto Naskh Arabic", serif',
                                  fontSize: { xs: '1rem', sm: '1.8rem', md: '2.3rem' }, 
                                  fontWeight: 500,
                                  color: isPlayingNow ? colors.primary : colors.text, 
                                  backgroundColor: isPlayingNow ? colors.highlightGlow : 'transparent',
                                  cursor: 'pointer',
                                  mx: { xs: '0.5px', md: '2px' },
                                  px: { xs: '1.5px', md: '4px' },
                                  py: { xs: '0.5px', md: '2px' },
                                  borderRadius: '6px',
                                  filter: isGhostMode && !isPlayingNow ? 'blur(6px)' : 'none',
                                  opacity: isGhostMode && !isPlayingNow ? 0.06 : 1,
                                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                  lineHeight: '1.75',
                                  display: 'inline-block',
                                  '&:hover': {
                                    backgroundColor: !isPlayingNow ? colors.highlight : colors.highlightGlow,
                                    transform: !isGhostMode ? 'scale(1.02)' : 'none'
                                  }
                                }}
                              >
                                {word.charType === 'end' ? (
                                  <Box component="span" sx={{ 
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: { xs: 0.15, md: 0.5 },
                                    color: colors.gold,
                                    width: { xs: 20, sm: 32, md: 36 },
                                    height: { xs: 20, sm: 32, md: 36 },
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z' fill='none' stroke='%23f59e0b' stroke-width='3.5'/%3E%3C/svg%3E")`,
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    fontSize: '0.65em',
                                    verticalAlign: 'middle',
                                    fontWeight: 600
                                  }}>
                                    {word.verseKey.split(':')[1]}
                                  </Box>
                                ) : word.text}
                              </Typography>
                            </React.Fragment>
                          );
                        })}
                      </div>
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

        {/* --- UNIFIED MODERN HEADER BAR --- */}
        <Paper 
          elevation={0}
          sx={{ 
              p: { xs: 0.75, sm: 1.5, md: 2 }, 
              mt: { xs: 2, md: 3 }, 
              borderRadius: 3,
              background: isDarkMode 
                ? 'rgba(26, 31, 46, 0.8)'
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: `1px solid ${colors.border}`,
              position: 'sticky', 
              bottom: 8, 
              zIndex: 1100,
              boxShadow: isDarkMode
                ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05) inset'
                : '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.8) inset',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
          {/* Mobile Toggle Button - Always visible */}
          {isMobile && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                pb: showHeaderBar ? 0.5 : 0,
                mb: showHeaderBar ? 0.5 : 0,
                borderBottom: showHeaderBar ? `1px solid ${colors.divider}` : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <Button
                onClick={() => setShowHeaderBar(!showHeaderBar)}
                size="small"
                startIcon={showHeaderBar ? (
                  <ExpandLessRounded sx={{ fontSize: '1rem' }} />
                ) : (
                  <ExpandMoreRounded sx={{ fontSize: '1rem' }} />
                )}
                sx={{
                  color: colors.text,
                  bgcolor: colors.highlight,
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  minHeight: 28,
                  '&:hover': {
                    bgcolor: colors.highlightGlow,
                    transform: 'scale(1.02)'
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {showHeaderBar ? 'Collapse' : 'Expand'}
              </Button>
            </Box>
          )}

          {/* Collapsible Content */}
          <Box
            sx={{
              maxHeight: (isMobile && !showHeaderBar) ? 0 : '1000px',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease-in-out',
              opacity: (isMobile && !showHeaderBar) ? 0 : 1
            }}
          >
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={{ xs: 0.75, md: 2 }} 
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Left Section: Player Controls */}
            <Stack direction="row" spacing={{ xs: 0.5, md: 1 }} alignItems="center" flexWrap="wrap" justifyContent={{ xs: 'center', md: 'flex-start' }}>
              <Tooltip title={isPlaying ? "Pause" : "Play"} arrow>
                <IconButton 
                  onClick={togglePlay} 
                  sx={{ 
                    bgcolor: colors.gold,
                    color: '#fff',
                    width: { xs: 36, md: 40 },
                    height: { xs: 36, md: 40 },
                    '&:hover': { 
                      bgcolor: colors.goldLight,
                      transform: 'scale(1.08)'
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isDarkMode 
                      ? '0 4px 12px rgba(245, 158, 11, 0.3)'
                      : '0 4px 12px rgba(245, 158, 11, 0.2)'
                  }}
                >
                  {isPlaying ? <PauseRounded sx={{ fontSize: { xs: '1.2rem', md: '1.4rem' } }} /> : <PlayArrowRounded sx={{ fontSize: { xs: '1.2rem', md: '1.4rem' } }} />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Reset" arrow>
                <IconButton 
                  onClick={resetToFirstAyah} 
                  sx={{ 
                    color: colors.text,
                    bgcolor: colors.highlight,
                    width: { xs: 30, md: 34 },
                    height: { xs: 30, md: 34 },
                    '&:hover': { 
                      bgcolor: colors.highlightGlow,
                      transform: 'rotate(-180deg)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <ReplayRounded sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' } }} />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ height: { xs: 28, md: 32 }, bgcolor: colors.divider, mx: { xs: 0.25, md: 0.5 } }} />

              <FormControl size="small" sx={{ minWidth: { xs: 75, md: 85 } }}>
                <Select
                  value={playbackMode}
                  onChange={(e) => {
                    setPlaybackMode(e.target.value);
                    setRepetitionCount(0);
                    setStep(0);
                  }}
                  sx={{ 
                    height: { xs: 28, md: 32 },
                    fontSize: { xs: '0.68rem', md: '0.75rem' },
                    fontWeight: 600,
                    color: colors.text,
                    bgcolor: colors.highlight,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                    '& .MuiSvgIcon-root': { fontSize: '1rem', color: colors.textSecondary }
                  }}
                >
                  <MenuItem value="hifdh" sx={{ fontSize: '0.75rem' }}>🎓 Hifdh</MenuItem>
                  <MenuItem value="verse" sx={{ fontSize: '0.75rem' }}>🔄 Verse</MenuItem>
                  <MenuItem value="fullpage" sx={{ fontSize: '0.75rem' }}>📖 Page</MenuItem>
                </Select>
              </FormControl>

              {playbackMode !== 'fullpage' && (
                <FormControl size="small" sx={{ minWidth: { xs: 55, md: 65 } }}>
                  <Select
                    value={verseRepetitions}
                    onChange={async (e) => {
                      const num = e.target.value;
                      setVerseRepetitions(num);
                      if (currentUser) {
                        try {
                          await updateSettings(currentUser.uid, { repetitions: num });
                        } catch (error) {
                          console.error('Error updating repetitions:', error);
                        }
                      }
                    }}
                    sx={{ 
                      height: { xs: 28, md: 32 },
                      fontSize: { xs: '0.68rem', md: '0.75rem' },
                      fontWeight: 600,
                      color: colors.text,
                      bgcolor: colors.highlight,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.gold },
                      '& .MuiSvgIcon-root': { fontSize: '1rem', color: colors.textSecondary }
                    }}
                  >
                    {[1, 2, 3, 5, 10, 20].map(num => (
                      <MenuItem key={num} value={num} sx={{ fontSize: '0.75rem' }}>{num}×</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {isPlaying && (
                <Chip
                  label={`${step + 1}/${pageData?.ayahs.length}`}
                  size="small"
                  icon={<VolumeUpRounded sx={{ fontSize: { xs: '0.75rem', md: '0.85rem' } }} />}
                  sx={{
                    height: { xs: 24, md: 26 },
                    fontSize: { xs: '0.65rem', md: '0.7rem' },
                    fontWeight: 700,
                    bgcolor: alpha(colors.primary, 0.15),
                    color: colors.primary,
                    border: `1px solid ${alpha(colors.primary, 0.3)}`,
                    '& .MuiChip-icon': { marginLeft: 0.5, marginRight: -0.25 }
                  }}
                />
              )}
            </Stack>
            
            {/* Center Section: Navigation */}
            <Stack direction="row" spacing={{ xs: 0.5, md: 1 }} alignItems="center" flexWrap="wrap" justifyContent="center">
              <FormControl size="small" variant="outlined" sx={{ minWidth: { xs: 120, md: 145 } }}>
                <Select 
                  value={pageData?.ayahs[currentAyahIndex]?.surah?.number || pageData?.ayahs[0]?.surah?.number || ''}
                  onChange={(e) => getSurahStartPage(e.target.value).then(setCurrentPage)}
                  sx={{ 
                    height: { xs: 30, md: 34 },
                    fontWeight: 600, 
                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                    color: colors.text,
                    bgcolor: colors.highlight,
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderColor: colors.border,
                      transition: 'border-color 0.2s'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { 
                      borderColor: colors.primary 
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                      borderColor: colors.primary 
                    },
                    '& .MuiSvgIcon-root': { color: colors.textSecondary, fontSize: '1.1rem' }
                  }}
                  IconComponent={MenuBookRounded}
                >
                  {surahs.map(s => (
                    <MenuItem key={s.number} value={s.number} sx={{ fontSize: '0.8rem' }}>
                      {s.number}. {s.englishName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" variant="outlined" sx={{ minWidth: { xs: 68, md: 82 } }}>
                <Select
                  value={Math.ceil(currentPage / 20)}
                  onChange={(e) => setCurrentPage(getJuzStartPage(e.target.value))}
                  sx={{ 
                    height: { xs: 30, md: 34 },
                    fontWeight: 600, 
                    fontSize: { xs: '0.68rem', md: '0.75rem' },
                    color: colors.text,
                    bgcolor: colors.highlight,
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderColor: colors.border 
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { 
                      borderColor: colors.primary 
                    },
                    '& .MuiSvgIcon-root': { color: colors.textSecondary, fontSize: '1.1rem' }
                  }}
                >
                  {Array.from({length: 30}, (_, i) => i + 1).map(j => (
                    <MenuItem key={j} value={j} sx={{ fontSize: '0.75rem' }}>Juz {j}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Paper 
                elevation={0}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: colors.highlight,
                  px: 0.75, 
                  py: 0.5, 
                  borderRadius: 2,
                  border: `1px solid ${colors.border}`,
                  gap: 0.25,
                  transition: 'all 0.2s'
                }}
              >
                <IconButton 
                  size="small" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  sx={{ 
                    width: { xs: 24, md: 28 },
                    height: { xs: 24, md: 28 },
                    color: colors.text,
                    bgcolor: 'transparent',
                    '&:hover': { bgcolor: colors.highlightGlow },
                    '&:disabled': { color: colors.textMuted, opacity: 0.3 }
                  }}
                >
                  <KeyboardArrowLeftRounded sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }} />
                </IconButton>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.15, md: 0.25 } }}>
                  <TextField
                    type="number"
                    value={currentPage}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= 604) {
                        setCurrentPage(value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    inputProps={{
                      min: 1,
                      max: 604,
                      style: { 
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: isMobile ? '0.7rem' : '0.8rem',
                        padding: isMobile ? '3px 1px' : '4px 2px',
                        cursor: 'pointer'
                      }
                    }}
                    sx={{
                      width: { xs: 40, md: 46 },
                      '& .MuiOutlinedInput-root': {
                        height: { xs: 24, md: 28 },
                        borderRadius: 1.5,
                        bgcolor: colors.paper,
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '& fieldset': {
                          borderColor: colors.border,
                          borderWidth: '1px'
                        },
                        '&:hover fieldset': {
                          borderColor: colors.primary,
                          borderWidth: '1px'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.primary,
                          borderWidth: '1px'
                        }
                      },
                      '& input[type=number]': {
                        MozAppearance: 'textfield'
                      },
                      '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                        WebkitAppearance: 'none',
                        margin: 0
                      }
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: colors.textMuted,
                      fontWeight: 500,
                      fontSize: { xs: '0.6rem', md: '0.65rem' }
                    }}
                  >
                    /604
                  </Typography>
                </Box>
                
                <IconButton 
                  size="small" 
                  onClick={() => setCurrentPage(p => Math.min(604, p + 1))} 
                  disabled={currentPage === 604}
                  sx={{ 
                    width: { xs: 24, md: 28 },
                    height: { xs: 24, md: 28 },
                    color: colors.text,
                    bgcolor: 'transparent',
                    '&:hover': { bgcolor: colors.highlightGlow },
                    '&:disabled': { color: colors.textMuted, opacity: 0.3 }
                  }}
                >
                  <KeyboardArrowRightRounded sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }} />
                </IconButton>
              </Paper>
            </Stack>
            
            {/* Right Section: Settings & Status */}
            <Stack direction="row" spacing={{ xs: 0.5, md: 1 }} alignItems="center" flexWrap="wrap" justifyContent={{ xs: 'center', md: 'flex-end' }}>
              <Tooltip title="Ghost Mode" arrow>
                <IconButton 
                  onClick={() => setIsGhostMode(!isGhostMode)}
                  sx={{ 
                    width: { xs: 30, md: 34 },
                    height: { xs: 30, md: 34 },
                    color: isGhostMode ? colors.success : colors.textMuted,
                    bgcolor: isGhostMode ? alpha(colors.success, 0.15) : colors.highlight,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      bgcolor: isGhostMode ? alpha(colors.success, 0.25) : colors.highlightGlow,
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <VisibilityOffRounded sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' } }} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={isMemorized ? "Memorized" : "Mark as Memorized"} arrow>
                <IconButton 
                  onClick={() => {
                    setPendingMemorizeAction(!isMemorized);
                    setShowMemorizeDialog(true);
                  }} 
                  sx={{ 
                    width: { xs: 30, md: 34 },
                    height: { xs: 30, md: 34 },
                    color: isMemorized ? colors.gold : colors.textMuted,
                    bgcolor: isMemorized ? alpha(colors.gold, 0.15) : colors.highlight,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      transform: 'scale(1.1) rotate(10deg)',
                      bgcolor: isMemorized ? alpha(colors.gold, 0.25) : colors.highlightGlow,
                      color: isMemorized ? colors.goldLight : colors.gold
                    }
                  }}
                >
                  <StarRounded sx={{ fontSize: { xs: '1.05rem', md: '1.2rem' } }} />
                </IconButton>
              </Tooltip>
              
              <Divider orientation="vertical" flexItem sx={{ height: { xs: 24, md: 28 }, bgcolor: colors.divider, mx: { xs: 0.25, md: 0.5 } }} />
              
              <Tooltip title={isDarkMode ? "Light Mode" : "Dark Mode"} arrow>
                <IconButton 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  sx={{ 
                    color: isDarkMode ? colors.gold : colors.primary,
                    bgcolor: isDarkMode ? alpha(colors.gold, 0.15) : alpha(colors.primary, 0.15),
                    width: { xs: 30, md: 34 },
                    height: { xs: 30, md: 34 },
                    '&:hover': { 
                      bgcolor: isDarkMode ? alpha(colors.gold, 0.25) : alpha(colors.primary, 0.25),
                      transform: 'rotate(180deg)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {isDarkMode ? <Brightness7Rounded sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' } }} /> : <Brightness4Rounded sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' } }} />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
          </Box>
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
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <StarRounded sx={{ color: colors.gold, fontSize: '1.5rem' }} />
            {pendingMemorizeAction ? 'Mark as Memorized?' : 'Remove from Memorized?'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: colors.textSecondary }}>
              {pendingMemorizeAction 
                ? `Are you sure you want to mark page ${currentPage} as memorized?`
                : `Are you sure you want to remove page ${currentPage} from your memorized pages?`
              }
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button 
              onClick={() => setShowMemorizeDialog(false)}
              sx={{ 
                color: colors.textSecondary,
                '&:hover': { bgcolor: colors.highlight }
              }}
            >
              No
            </Button>
            <Button 
              onClick={async () => {
                const newStatus = pendingMemorizeAction;
                setIsMemorized(newStatus);
                if (profile?.id && currentUser) {
                  const updatedPages = newStatus
                    ? [...(profile.memorizedPages || []), currentPage]
                    : (profile.memorizedPages || []).filter(p => p !== currentPage);
                  await updateProfile(currentUser.uid, profile.id, { 
                    memorizedPages: updatedPages 
                  });
                }
                setShowMemorizeDialog(false);
              }}
              variant="contained"
              sx={{ 
                bgcolor: colors.gold,
                color: '#fff',
                fontWeight: 600,
                '&:hover': { bgcolor: colors.goldLight },
                boxShadow: isDarkMode 
                  ? '0 4px 12px rgba(245, 158, 11, 0.3)'
                  : '0 4px 12px rgba(245, 158, 11, 0.2)'
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );

};

export default MemorizeView;
