import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Paper,
  Chip,
  Stack,
  Divider,
  Avatar,
  useTheme,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import {
  AutoStoriesRounded,
  EmojiEventsRounded,
  LocalFireDepartmentRounded,
  TrendingUpRounded,
  FavoriteRounded,
  MenuBookRounded,
  SchoolRounded,
  RepeatOneRounded,
  PlayCircleFilledRounded,
  TouchAppRounded,
  AdsClickRounded,
  StarRounded,
} from '@mui/icons-material';
import { UserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getProfiles, updateStreak, getStreak, getSubscriptionInfo } from '../firestoreDB';

const Dashboard = ({ profile }) => {
  const theme = useTheme();
  const { currentUser } = useContext(UserContext);
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState([]);
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });
  const [subscriptionInfo, setSubscriptionInfo] = useState({ hasAccess: false, daysLeft: 0, isExpired: true });

  useEffect(() => {
    const loadProfiles = async () => {
      if (currentUser) {
        const userProfiles = await getProfiles(currentUser.uid);
        setProfiles(userProfiles);
      }
    };
    loadProfiles();
  }, [currentUser]);

  // Load and update streak
  useEffect(() => {
    const loadStreak = async () => {
      if (currentUser) {
        const streak = await updateStreak(currentUser.uid);
        setStreakData(streak);
      }
    };
    loadStreak();
  }, [currentUser]);

  // Load subscription info
  useEffect(() => {
    const loadSubscription = async () => {
      if (currentUser) {
        const subInfo = await getSubscriptionInfo(currentUser.uid);
        setSubscriptionInfo(subInfo);
      }
    };
    loadSubscription();
  }, [currentUser]);

  // Calculate statistics
  const totalPages = 604;
  const memorizedPages = profile?.memorizedPages?.length || 0;
  const memorizedPercentage = ((memorizedPages / totalPages) * 100).toFixed(1);
  const currentPage = profile?.currentPage || 1;
  const currentJuz = Math.ceil(currentPage / 20);
  const pagesInCurrentJuz = memorizedPages; // This could be refined to count pages in current juz

  // Motivational Quranic verses
  const quranVerses = [
    {
      arabic: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
      translation: 'And We have certainly made the Quran easy for remembrance, so is there any who will remember?',
      reference: 'Surah Al-Qamar (54:17)',
    },
    {
      arabic: 'إِنَّ الَّذِينَ يَتْلُونَ كِتَابَ اللَّهِ وَأَقَامُوا الصَّلَاةَ',
      translation: 'Indeed, those who recite the Book of Allah and establish prayer...',
      reference: 'Surah Fatir (35:29)',
    },
    {
      arabic: 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا',
      translation: 'And recite the Quran with measured recitation.',
      reference: 'Surah Al-Muzzammil (73:4)',
    },
  ];

  // Motivational facts
  const motivationalFacts = [
    {
      icon: <EmojiEventsRounded />,
      title: 'Noble Reward',
      description: 'The one who memorizes the Quran will be with the noble and obedient angels.',
      color: '#f59e0b',
    },
    {
      icon: <LocalFireDepartmentRounded />,
      title: 'Daily Consistency',
      description: 'Memorizing just one page daily means completing the Quran in less than 2 years!',
      color: '#ef4444',
    },
    {
      icon: <StarRounded />,
      title: 'Raised Status',
      description: 'The Quran will intercede for its companions on the Day of Judgment.',
      color: '#8b5cf6',
    },
    {
      icon: <TrendingUpRounded />,
      title: 'Mental Benefits',
      description: 'Quran memorization improves memory, focus, and cognitive abilities.',
      color: '#10b981',
    },
  ];

  const isDarkMode = theme.palette.mode === 'dark';

  const colors = {
    primary: isDarkMode ? '#818cf8' : '#6366f1', // Indigo
    secondary: '#f59e0b', // Gold
    success: '#10b981', // Emerald
    background: isDarkMode ? '#0f172a' : '#f8fafc',
    paper: isDarkMode ? alpha('#1e293b', 0.8) : 'white',
    cardBorder: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    text: isDarkMode ? '#f8fafc' : '#1e293b',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
  };

  return (
    <Box sx={{ 
      background: isDarkMode 
        ? `radial-gradient(circle at top right, ${alpha(colors.primary, 0.1)}, transparent), ${colors.background}`
        : `radial-gradient(circle at top right, ${alpha(colors.primary, 0.05)}, transparent), ${colors.background}`,
      minHeight: '100vh', 
      py: { xs: 2, md: 6 } 
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Fade in timeout={600}>
          <Box sx={{ mb: { xs: 4, md: 6 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={3} textAlign={{ xs: 'center', sm: 'left' }}>
              <Avatar
                sx={{
                  width: { xs: 72, md: 84 },
                  height: { xs: 72, md: 84 },
                  background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.success} 90%)`,
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  boxShadow: `0 8px 16px ${alpha(colors.primary, 0.25)}`
                }}
              >
                {profile?.name?.charAt(0) || '📖'}
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight={900} color={colors.text} sx={{ letterSpacing: '-1.5px', mb: 0.5 }}>
                  {profile?.name}{t('journeyTitle')}
                </Typography>
                <Typography variant="h6" color={colors.textSecondary} fontWeight={500} sx={{ opacity: 0.8 }}>
                  {t('trackProgress')} — Keep the momentum going!
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Fade>

        {/* --- MAIN HERO PROGRESS CARD --- */}
        <Zoom in timeout={800}>
          <Card
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: { xs: 4, md: 6 },
              position: 'relative',
              overflow: 'hidden',
              background: isDarkMode 
                ? `linear-gradient(135deg, ${colors.primary} 0%, #312e81 100%)`
                : `linear-gradient(135deg, ${colors.primary} 0%, #4338ca 100%)`,
              color: 'white',
              boxShadow: isDarkMode 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                : '0 25px 50px -12px rgba(99, 102, 241, 0.3)',
            }}
          >
            {/* Decorative shapes */}
            <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
            <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', zIndex: 0 }} />

            <CardContent sx={{ p: { xs: 3, md: 6 }, position: 'relative', zIndex: 1 }}>
              <Grid container spacing={6} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Box>
                    <Typography variant="overline" sx={{ letterSpacing: 3, fontWeight: 800, opacity: 0.8, mb: 1, display: 'block' }}>
                      GLOBAL PROGRESS
                    </Typography>
                    <Typography variant="h1" fontWeight={900} mb={1} sx={{ fontSize: { xs: '3.5rem', md: '5rem' }, letterSpacing: '-3px' }}>
                      {memorizedPercentage}%
                    </Typography>
                    <Typography variant="h5" sx={{ opacity: 0.95, mb: 4, fontWeight: 500 }}>
                      {t('quranMemorized')}
                    </Typography>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={parseFloat(memorizedPercentage)}
                        sx={{
                          height: 16,
                          borderRadius: 8,
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, #10b981 0%, #34d399 100%)`,
                            borderRadius: 8,
                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body1" sx={{ mt: 2, opacity: 0.9, fontWeight: 600 }}>
                      {memorizedPages} / {totalPages} {t('pagesCompleted')}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          textAlign: 'center',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: 4,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <MenuBookRounded sx={{ fontSize: 32, mb: 1, color: colors.secondary }} />
                        <Typography variant="h4" fontWeight={800}>{memorizedPages}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>{t('pages')}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          textAlign: 'center',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: 4,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <AutoStoriesRounded sx={{ fontSize: 32, mb: 1, color: colors.secondary }} />
                        <Typography variant="h4" fontWeight={800}>{currentJuz}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>{t('currentJuz')}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: 4,
                          border: '2px solid rgba(245, 158, 11, 0.4)',
                        }}
                      >
                        <LocalFireDepartmentRounded sx={{ fontSize: 36, color: colors.secondary }} />
                        <Box>
                          <Typography variant="h4" fontWeight={800}>{streakData.currentStreak}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>{t('dayStreak')}</Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Zoom>

        {/* --- PREMIUM UPSELL / SUBSCRIPTION CARD --- */}
        <Fade in timeout={1000}>
          <Card
            elevation={0}
            sx={{
              mb: 6,
              borderRadius: 4,
              overflow: 'hidden',
              background: subscriptionInfo.hasAccess
                ? `linear-gradient(90deg, ${alpha(colors.success, 0.1)}, ${alpha(colors.success, 0.05)})`
                : `linear-gradient(90deg, ${alpha(colors.primary, 0.12)}, ${alpha(colors.primary, 0.06)})`,
              border: `1px solid ${subscriptionInfo.hasAccess ? alpha(colors.success, 0.2) : alpha(colors.primary, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <CardContent sx={{ p: 4, width: '100%' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '16px', 
                    bgcolor: subscriptionInfo.hasAccess ? colors.success : colors.primary,
                    color: 'white',
                    display: 'flex',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                  }}>
                    {subscriptionInfo.hasAccess ? <EmojiEventsRounded /> : <FavoriteRounded />}
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={800} color={colors.text}>
                      {subscriptionInfo.hasAccess ? t('premiumAccess') : 'Premium Experience'}
                    </Typography>
                    <Typography variant="body1" color={colors.textSecondary} fontWeight={500}>
                      {subscriptionInfo.hasAccess 
                        ? `${t('subscriptionStatus')}: ${subscriptionInfo.daysLeft} ${t('daysLeft')}`
                        : 'Unlock Smart Hifdh Mode and unlimited access.'}
                    </Typography>
                  </Box>
                </Stack>
                {subscriptionInfo.hasAccess ? (
                  <Chip 
                    label="PRO ACTIVE" 
                    sx={{ bgcolor: colors.success, color: 'white', fontWeight: 900, px: 2, height: 36 }} 
                  />
                ) : (
                  <Chip 
                    label="UPGRADE NOW" 
                    onClick={() => {}}
                    sx={{ bgcolor: colors.primary, color: 'white', fontWeight: 900, px: 2, height: 36, cursor: 'pointer', '&:hover': { bgcolor: '#4f46e5' } }} 
                  />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* --- HOW TO USE SECTION --- */}
        <Box sx={{ mb: 8 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={4}>
            <Box sx={{ width: 4, height: 28, borderRadius: 2, bgcolor: colors.primary }} />
            <Typography variant="h5" fontWeight={800} color={colors.text}>
              Master Your Journey
            </Typography>
            <Chip label="QUICK GUIDE" size="small" sx={{ ml: 1, fontWeight: 800, bgcolor: alpha(colors.primary, 0.1), color: colors.primary }} />
          </Stack>
          
          <Grid container spacing={3}>
            {/* Playback Modes */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, height: '100%', borderRadius: 5, bgcolor: colors.paper, border: `1px solid ${colors.cardBorder}`,
                  position: 'relative', overflow: 'hidden'
                }}
              >
                <Typography variant="h6" fontWeight={900} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PlayCircleFilledRounded color="primary" /> Playback Modes
                </Typography>
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(colors.primary, 0.1), color: colors.primary }}><SchoolRounded /></Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800}>Hifdh Mode</Typography>
                      <Typography variant="body2" color={colors.textSecondary}>Best for memorization. Automatically repeats verses and can hide text to test your memory.</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(colors.secondary, 0.1), color: colors.secondary }}><RepeatOneRounded /></Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800}>Verse Mode</Typography>
                      <Typography variant="body2" color={colors.textSecondary}>Loops a single Ayah. Perfect for correcting pronunciation or focusing on difficult passages.</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(colors.success, 0.1), color: colors.success }}><AutoStoriesRounded /></Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800}>Page Mode</Typography>
                      <Typography variant="body2" color={colors.textSecondary}>Continuous playback of the whole page. Ideal for revision and daily listening (Wird).</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Interactive Mushaf & Progress */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3} sx={{ height: '100%' }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, flexGrow: 1, borderRadius: 5, bgcolor: colors.paper, border: `1px solid ${colors.cardBorder}`,
                    background: `linear-gradient(to right, ${alpha(colors.primary, 0.02)}, ${colors.paper})`
                  }}
                >
                  <Typography variant="h6" fontWeight={900} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TouchAppRounded sx={{ color: colors.primary }} /> Play from Anywhere
                  </Typography>
                  <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 2, lineHeight: 1.6 }}>
                    Master the **Interactive Mushaf**! Simply **tap any Ayah** on the page to instantly start playback from that exact spot. 
                  </Typography>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(colors.primary, 0.05), borderLeft: `4px solid ${colors.primary}` }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: colors.primary }}>💡 TIP: Use this to quickly jump to specific verses you find difficult.</Typography>
                  </Box>
                </Paper>

                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, flexGrow: 1, borderRadius: 5, bgcolor: colors.paper, border: `1px solid ${colors.cardBorder}`,
                    background: `linear-gradient(to right, ${alpha('#e11d48', 0.02)}, ${colors.paper})`
                  }}
                >
                  <Typography variant="h6" fontWeight={900} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FavoriteRounded sx={{ color: '#e11d48' }} /> Track Your Success
                  </Typography>
                  <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 2, lineHeight: 1.6 }}>
                    When you finish memorizing a page, tap the **Heart Icon** in the player bar. This marks the page as "Memorized" and updates your progress stats here!
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label="Instant Stats" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                    <Chip label="Permanent Record" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* --- VERSES TO INSPIRE --- */}
        <Box sx={{ mb: 8 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={4}>
            <Box sx={{ width: 4, height: 28, borderRadius: 2, bgcolor: colors.secondary }} />
            <Typography variant="h5" fontWeight={800} color={colors.text}>
              {t('versesToInspire')}
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            {quranVerses.map((verse, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in timeout={1200 + index * 200}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      bgcolor: colors.paper,
                      border: `1px solid ${colors.cardBorder}`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: isDarkMode 
                          ? '0 20px 40px rgba(0,0,0,0.4)'
                          : '0 20px 40px rgba(99, 102, 241, 0.08)',
                        borderColor: alpha(colors.primary, 0.3)
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: '"Amiri", serif',
                          fontSize: '1.65rem',
                          mb: 3,
                          color: colors.primary,
                          lineHeight: 1.8,
                          textAlign: 'center',
                          direction: 'rtl',
                        }}
                      >
                        {verse.arabic}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Typography variant="body1" color={colors.textSecondary} sx={{ fontStyle: 'italic', mb: 2, textAlign: 'center', opacity: 0.9, lineHeight: 1.6 }}>
                        "{verse.translation}"
                      </Typography>
                      <Chip
                        label={verse.reference}
                        size="small"
                        sx={{
                          px: 1,
                          bgcolor: alpha(colors.primary, 0.08),
                          color: colors.primary,
                          fontWeight: 800,
                          fontSize: '0.7rem'
                        }}
                      />
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* --- MILESTONES & TIMELINE section --- */}
        <Box sx={{ mb: 8 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={4}>
            <Box sx={{ width: 4, height: 28, borderRadius: 2, bgcolor: colors.success }} />
            <Typography variant="h5" fontWeight={800} color={colors.text}>
               {t('totalDuration')} Timeline
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            {[
              { label: '1 Page/Day', days: 604, years: 1.65, color: colors.success, emoji: '🎯', desc: 'Consistent' },
              { label: '0.5 Page/Day', days: 1208, years: 3.3, color: '#3b82f6', emoji: '🌱', desc: 'Steady' },
              { label: '5 Pages/Week', days: 865, years: 2.37, color: colors.primary, emoji: '📚', desc: 'Weekly' },
              { label: '2 Pages/Week', days: 2162, years: 5.9, color: colors.secondary, emoji: '🕰️', desc: 'Long-term' },
            ].map((timeline, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom in timeout={1400 + index * 100}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      borderRadius: 4,
                      bgcolor: colors.paper,
                      border: `1px solid ${colors.cardBorder}`,
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        borderColor: timeline.color,
                        boxShadow: `0 12px 30px ${alpha(timeline.color, 0.1)}`
                      }
                    }}
                  >
                    <Box sx={{ 
                      fontSize: '2.5rem', mb: 2, 
                      width: 64, height: 64, borderRadius: '50%', 
                      bgcolor: alpha(timeline.color, 0.1), mx: 'auto',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {timeline.emoji}
                    </Box>
                    <Typography variant="h6" fontWeight={900} mb={0.5}>{timeline.label}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: timeline.color, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                      {timeline.desc}
                    </Typography>
                    <Divider sx={{ my: 2.5 }} />
                    <Box>
                      <Typography variant="h5" fontWeight={900} color={timeline.color}>~{timeline.years}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>YEARS TO COMPLETE</Typography>
                    </Box>
                  </Paper>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* --- STREAK SHOWCASE SECTION --- */}
        {streakData.currentStreak > 0 && (
          <Zoom in timeout={1200}>
            <Card
              elevation={0}
              sx={{
                mb: 8,
                borderRadius: { xs: 4, md: 6 },
                background: `linear-gradient(135deg, ${colors.secondary} 0%, #d97706 100%)`,
                color: 'white',
                boxShadow: `0 20px 60px ${alpha(colors.secondary, 0.3)}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: { xs: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 140,
                        height: 140,
                        margin: '0 auto',
                        borderRadius: '40px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(15px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        animation: 'pulse 2s ease-in-out infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.4)' },
                          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 20px rgba(255, 255, 255, 0)' },
                        },
                      }}
                    >
                      <LocalFireDepartmentRounded sx={{ fontSize: 90 }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h2" fontWeight={900} mb={1} sx={{ letterSpacing: '-2px' }}>
                      {streakData.currentStreak} Day Streak! 🔥
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.95, mb: 4, fontWeight: 500, lineHeight: 1.4 }}>
                      {streakData.currentStreak === 1
                        ? "The first step is often the hardest. You've started something great!"
                        : streakData.currentStreak < 7
                        ? "You're building momentum. Keep pushing toward your first week!"
                        : "Exceptional discipline! Each day brings you closer to the heart of the Quran."}
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Chip
                        icon={<EmojiEventsRounded sx={{ color: 'white !important' }} />}
                        label={`Best: ${streakData.longestStreak} days`}
                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', color: 'white', fontWeight: 800, px: 1 }}
                      />
                      <Chip
                        icon={<TrendingUpRounded sx={{ color: 'white !important' }} />}
                        label={streakData.currentStreak >= streakData.longestStreak ? 'Personal Record!' : 'Keep Rising!'}
                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', color: 'white', fontWeight: 800, px: 1 }}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Zoom>
        )}

        {/* --- MILESTONE CELEBRATION --- */}
        {memorizedPages > 0 && (
          <Fade in timeout={1500}>
            <Card
              elevation={0}
              sx={{
                mb: 6,
                borderRadius: 4,
                bgcolor: alpha(colors.success, 0.05),
                border: `2px dashed ${alpha(colors.success, 0.3)}`,
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <EmojiEventsRounded sx={{ fontSize: 64, color: colors.success, mb: 1.5, filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))' }} />
                <Typography variant="h4" fontWeight={900} color={colors.text} mb={1} sx={{ letterSpacing: '-1px' }}>
                   {t('keepGoing')} 🎉
                </Typography>
                <Typography variant="h6" color={colors.textSecondary} fontWeight={500}>
                  {memorizedPages >= 100
                    ? 'MashaAllah! You\'ve memorized over 100 pages! You\'re reaching elite levels.'
                    : memorizedPages >= 20
                    ? 'Excellent work! You\'ve completed a significant milestone. The Quran is illuminating your heart.'
                    : 'Every page you memorize is a light in your life. Stay focused and sincere.'}
                </Typography>
              </CardContent>
            </Card>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
