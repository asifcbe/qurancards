import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, Typography, Card, CardContent, IconButton, LinearProgress, Stack, Grid, 
  Paper, CircularProgress, FormControl, Select, MenuItem, Tooltip, Container, 
  useTheme, Fade, Divider, useMediaQuery, Switch, FormControlLabel
} from '@mui/material';
import {
  PlayArrowRounded, PauseRounded, ReplayRounded,
  KeyboardArrowLeftRounded, KeyboardArrowRightRounded,
  WorkspacePremiumRounded, Brightness4Rounded, Brightness7Rounded, 
  MenuBookRounded
} from '@mui/icons-material';

import { fetchQuranPage, fetchAudioForPage, getJuzStartPage, fetchSurahs, getSurahStartPage } from '../api';
import { db } from '../db';

const MemorizeView = ({ profile, settings }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

  const audioRef = useRef(new Audio());
  const controllerRef = useRef({ isCancelled: false });

  const colors = {
    paper: isDarkMode ? '#121212' : '#f8f7f2', // Soft parchment
    text: isDarkMode ? '#e2e2e2' : '#1a1a1a',  
    gold: '#d4af37',
    quranGreen: '#2ca37a', 
    highlight: isDarkMode ? 'rgba(44, 163, 122, 0.2)' : '#f0f9f6',
    uiPaper: isDarkMode ? '#1e1e1e' : '#ffffff',
  };

  useEffect(() => { fetchSurahs().then(setSurahs); }, []);

  useEffect(() => {
    loadPage(currentPage);
    if (profile?.id) { db.profiles.update(profile.id, { currentPage }); }
    setIsMemorized(profile?.memorizedPages?.includes(currentPage) || false);
  }, [currentPage, profile, settings?.reciter]);

  const loadPage = async (page) => {
    setLoading(true);
    try {
      const { lines, ayahs } = await fetchQuranPage(page, settings?.scriptType);
      const audio = await fetchAudioForPage(page, settings?.reciter);
      setPageData({ lines, ayahs });
      setAudioData(audio);
      resetToFirstAyah();
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const getCurrentSequence = useCallback(() => {
    if (step === 0) return [0];
    if (step % 2 !== 0) return [(step + 1) / 2];
    return Array.from({ length: (step / 2) + 1 }, (_, i) => i);
  }, [step]);

  // Preload next audio logic
  const preloadAudio = useCallback((index) => {
    if (audioData?.ayahs[index]) {
        const audio = new Audio(audioData.ayahs[index].audio);
        audio.preload = 'auto';
    }
  }, [audioData]);

  const playSequence = useCallback(async (indices) => {
    for (const index of indices) {
      if (controllerRef.current.isCancelled) break;
      const ayahAudio = audioData?.ayahs[index];
      if (!ayahAudio) continue;
      
      setCurrentAyahIndex(index);
      audioRef.current.src = ayahAudio.audio;
      
      // Preload next ayah in sequence or next step
      const nextIndexInSeq = indices[indices.indexOf(index) + 1];
      if (nextIndexInSeq !== undefined) {
         preloadAudio(nextIndexInSeq);
      } else {
         // Preload start of next sequence (heuristic)
         // Not trivial without calculating next sequence, but we can try next ayah index roughly
         preloadAudio(index + 1);
      }

      await new Promise((resolve) => {
        const onEnd = () => {
          audioRef.current.removeEventListener('ended', onEnd);
          resolve();
        };
        audioRef.current.addEventListener('ended', onEnd);
        audioRef.current.play().catch(e => {
            console.warn("Play interrupted or failed", e);
            resolve(); // Skip if error
        });
      });
    }
  }, [audioData, preloadAudio]);

  useEffect(() => {
    let active = true;
    const executeStep = async () => {
      if (!isPlaying || !audioData || !pageData) return;
      const maxReps = settings?.repetitions || 5;
      const currentSequence = getCurrentSequence();
      if (Math.max(...currentSequence) >= pageData.ayahs.length) {
        setIsPlaying(false);
        return;
      }
      await playSequence(currentSequence);
      if (!active || controllerRef.current.isCancelled) return;
      if (repetitionCount < maxReps - 1) {
        setRepetitionCount(prev => prev + 1);
      } else {
        setStep(prev => prev + 1);
        setRepetitionCount(0);
      }
    };
    if (isPlaying) executeStep();
    return () => { active = false; };
  }, [isPlaying, step, repetitionCount, audioData, pageData, settings?.repetitions, playSequence, getCurrentSequence]);

  const togglePlay = () => {
    controllerRef.current.isCancelled = isPlaying;
    if (isPlaying) audioRef.current.pause();
    setIsPlaying(!isPlaying);
  };

  const resetToFirstAyah = () => {
    controllerRef.current.isCancelled = true;
    audioRef.current.pause();
    setStep(0);
    setCurrentAyahIndex(0);
    setRepetitionCount(0);
    setIsPlaying(false);
  };

  if (loading && !pageData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh" bgcolor={colors.paper}>
        <CircularProgress thickness={4} size={50} sx={{ color: colors.quranGreen }} />
      </Box>
    );
  }

  const currentSequence = getCurrentSequence();
  const maxAyahReached = Math.max(...currentSequence);

  return (
    <Box sx={{ bgcolor: colors.paper, minHeight: '100vh', pb: 15 }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 1, md: 3 } }}>
        
        {/* --- HEADER (ORIGINAL) --- */}
        <Paper elevation={4} sx={{ 
          p: { xs: 1.5, md: 2 }, mb: 4, borderRadius: 4, 
          background: isDarkMode ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)', position: 'sticky', top: 15, zIndex: 1100,
          border: '1px solid', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                <IconButton onClick={() => setIsDarkMode(!isDarkMode)} sx={{ color: colors.gold }}>
                  {isDarkMode ? <Brightness7Rounded /> : <Brightness4Rounded />}
                </IconButton>
                <FormControl size="small" variant="standard" sx={{ minWidth: 140 }}>
                  <Select 
                    value={pageData?.ayahs[0]?.surah?.number || ''}
                    onChange={(e) => getSurahStartPage(e.target.value).then(setCurrentPage)}
                    disableUnderline sx={{ fontWeight: 800, fontFamily: 'serif', color: colors.text }}
                    IconComponent={MenuBookRounded}
                  >
                    {surahs.map(s => <MenuItem key={s.number} value={s.number}>{s.number}. {s.englishName}</MenuItem>)}
                  </Select>
                </FormControl>
                <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                <FormControl size="small" variant="standard" sx={{ minWidth: 80 }}>
                  <Select
                    value={Math.ceil(currentPage / 20)}
                    onChange={(e) => setCurrentPage(getJuzStartPage(e.target.value))}
                    disableUnderline
                    sx={{ fontWeight: 600, color: isDarkMode ? 'grey.500' : 'text.secondary' }}
                  >
                    {Array.from({length: 30}, (_, i) => i + 1).map(j => (
                      <MenuItem key={j} value={j}>Juz {j}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="center">
                <FormControlLabel
                  control={<Switch size="small" checked={isGhostMode} onChange={() => setIsGhostMode(!isGhostMode)} color="primary" />}
                  label={<Typography variant="caption" sx={{ fontWeight: 800, color: colors.text }}>GHOST</Typography>}
                />
                <Tooltip title="Memorized Status">
                  <IconButton onClick={() => setIsMemorized(!isMemorized)} sx={{ color: isMemorized ? colors.gold : 'action.disabled' }}>
                    <WorkspacePremiumRounded fontSize="large" />
                  </IconButton>
                </Tooltip>
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'grey.100', px: 1, py: 0.5, borderRadius: 8 }}>
                  <IconButton size="small" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} sx={{ color: colors.text }}><KeyboardArrowLeftRounded /></IconButton>
                  <Typography variant="caption" sx={{ mx: 1, fontWeight: 900, color: colors.text }}>PG {currentPage}</Typography>
                  <IconButton size="small" onClick={() => setCurrentPage(p => Math.min(604, p + 1))} sx={{ color: colors.text }}><KeyboardArrowRightRounded /></IconButton>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* --- 15-LINE MUSHAF PAGE --- */}
        <Fade in={!loading}>
          <Card elevation={0} sx={{ 
            borderRadius: 3, 
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fffdf9', // Warm white for light mode
            border: `1px solid ${isDarkMode ? '#333' : '#f0e6d2'}`,
            boxShadow: isDarkMode ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(212, 175, 55, 0.1)',
            maxWidth: '900px', // Slightly wider
            margin: '0 auto',
            minHeight: '1200px', // More vertical space
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            // Allow horizontal scroll on mobile to preserve strict layout if needed
            overflowX: 'auto', 
            overflowY: 'hidden'
          }}>
             {/* Decorative Corner (optional) - keeping clean for now */}
            <CardContent sx={{ p: { xs: 2.5, md: 7 }, flexGrow: 1 }}>
              <Box sx={{ 
                direction: 'rtl', 
                textAlign: 'center', 
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
                px: 1
              }}>
                {pageData?.lines && Object.keys(pageData.lines).sort((a,b) => Number(a)-Number(b)).map((lineNum) => (
                  <Box key={lineNum} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', // Justified lines
                    width: '100%',
                    mb: 0.5,
                    lineHeight: 1.8
                  }}>
                     {/* Check if line has a surah header (start of a new surah) */}
                     {/* Actually, v4 structure puts words in lines. If a line is start of Surah, it might have special handling in QF.
                         But usually, the Bismillah is its own line or part of text. 
                         For visual simplicity here, we iterate words. If we spot 'bismillah' or index 1 handling, we might need custom logic.
                         However, let's start with pure word rendering. To handle Surah headers properly in line-mode is complex
                         because the header isn't a "word". 
                         
                         Workaround: Check if the first word of the line is Verse 1 of a Surah (and not Fatiha/Bismillah specific quirks).
                         If so, render header ABOVE the line. 
                     */}
                    
                    <Box sx={{ 
                        width: '100%', 
                        display: 'flex', 
                        justifyContent: 'center', // Default center, but for full lines use space-between usually?
                        // "Madani" pages justify all lines except the last line of a surah/block.
                        // We can try `textAlign: 'justify'` on the container, but flexbox `justify-content: space-between` is stronger for ensuring edge-to-edge.
                        // Exception: Last line of surah should remain centered or start-aligned? 
                        // Madani lines are fully justified.
                        textAlign: 'justify' 
                    }}>
                        {/* We need to reverse mapping if direction is RTL? Flexbox row-reverse? 
                            Container is `direction: rtl`. So normal map order is Right-to-Left visually. 
                        */}
                        
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        {pageData.lines[lineNum].map((word, wIndex) => {
                            // Find which ayah this word belongs to
                            const ayahIndex = pageData.ayahs.findIndex(a => a.verseKey === word.verseKey);
                            const isPlayingNow = ayahIndex === currentAyahIndex;
                            const isNewSurah = word.verseKey.endsWith(':1') && wIndex === 0 && word.charType !== 'end'; 
                            
                            // Simplistic Surah Header Insertion (might break exact 15 lines if not careful, 
                            // but headers usually take space *between* lines in logic or are separate).
                            // In strict 15-line pages, the header is part of the layout. 
                            // For now, let's render the header if it's the start of the surah.
                            
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
                                            fontFamily: '"Amiri", "Scheherazade New", serif',
                                            // Responsive font size: minimum 1.2rem on tiny screens, preferred 4vw to fill, max 2.4rem
                                            fontSize: { xs: 'clamp(1.2rem, 4vw, 1.8rem)', md: '2.4rem' }, 
                                            fontWeight: 500,
                                            color: isPlayingNow ? colors.quranGreen : colors.text, 
                                            backgroundColor: isPlayingNow ? colors.highlight : 'transparent',
                                            cursor: 'pointer',
                                            mx: '1px',
                                            filter: isGhostMode && !isPlayingNow ? 'blur(5px)' : 'none',
                                            opacity: isGhostMode && !isPlayingNow ? 0.08 : 1,
                                            transition: 'all 0.2s ease',
                                            lineHeight: '1.7', // Slightly looser for better mobile reading
                                            display: 'inline-block'
                                        }}
                                    >
                                        {/* Render Surah Name or Bismillah if logic allowed (omitted for strict line mode parity for now) */}
                                        
                                        {word.charType === 'end' ? (
                                            <Box component="span" sx={{ 
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 0.5,
                                                color: colors.gold,
                                                width: 35,
                                                height: 35,
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z' fill='none' stroke='%23d4af37' stroke-width='4'/%3E%3C/svg%3E")`,
                                                backgroundSize: 'contain',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'center',
                                                fontSize: '0.7em',
                                                verticalAlign: 'middle',
                                                translate: '0 -4px'
                                            }}>
                                               {/* Parse verse number from key '1:1' -> 1 */}
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
            
            {/* Page Footer mimic */}
            <Box sx={{ p: 2, textAlign: 'center', opacity: 0.4, borderTop: `1px inset ${colors.paper}` }}>
              <Typography variant="caption" sx={{ fontFamily: 'serif', letterSpacing: 2 }}>
                — {currentPage} —
              </Typography>
            </Box>
          </Card>
        </Fade>

        {/* --- FLOATING PLAYER (ORIGINAL) --- */}
        <Box sx={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', width: '92%', maxWidth: 550, zIndex: 1200 }}>
          <Paper elevation={20} sx={{ 
            p: { xs: 2, md: 3 }, borderRadius: 6, 
            bgcolor: isDarkMode ? '#222' : '#fff', 
            border: '1px solid', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'divider' 
          }}>
            <Stack direction="row" spacing={{ xs: 2, md: 3 }} alignItems="center">
              <IconButton onClick={resetToFirstAyah} sx={{ color: colors.text }}><ReplayRounded /></IconButton>
              
              <Box sx={{ flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: colors.gold, letterSpacing: 1.5 }}>
                      {currentSequence.length === 1 ? 'FOCUS' : 'LINKING'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: colors.text }}>
                      {maxAyahReached + 1} / {pageData?.ayahs.length}
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={((maxAyahReached + 1) / (pageData?.ayahs.length)) * 100} 
                  sx={{ height: 10, borderRadius: 5, bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', '& .MuiLinearProgress-bar': { bgcolor: colors.quranGreen } }} />
              </Box>

              <IconButton onClick={togglePlay} sx={{ 
                bgcolor: colors.gold, color: 'white', p: { xs: 1.5, md: 2 }, 
                '&:hover': { bgcolor: '#b8860b' },
                boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)'
              }}>
                {isPlaying ? <PlayArrowRounded sx={{ transform: 'scale(1.5)', color: 'white' }} fontSize="large" /> : <PlayArrowRounded fontSize="large" />}
              </IconButton>

              <Box sx={{ textAlign: 'center', minWidth: { xs: 40, md: 60 } }}>
                <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 900, color: colors.quranGreen }}>{repetitionCount + 1}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5, color: colors.text }}>REP</Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default MemorizeView;