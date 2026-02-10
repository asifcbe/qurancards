import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Card, CardContent, 
  FormControl, Select, MenuItem,
  Switch, Slider, Button,
  Stack, Divider, Fade, Zoom, Avatar, Grid
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MicIcon from '@mui/icons-material/MicNone';
import RepeatIcon from '@mui/icons-material/Repeat';
import UndoIcon from '@mui/icons-material/UndoOutlined';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import PaletteIcon from '@mui/icons-material/PaletteOutlined';
import LanguageIcon from '@mui/icons-material/LanguageOutlined';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import GroupIcon from '@mui/icons-material/Group';
import DownloadIcon from '@mui/icons-material/Download';
import { fetchReciters } from '../api';
import { updateSettings, getSubscriptionInfo } from '../firestoreDB';
import { UserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';

const SettingsView = ({ settings, isAdmin, profile, onSettingsChange, onUpgrade, onAdminAccess, onPrivacy, onTerms, onRefund, onContact, onDownload, onSwitchProfile }) => {
  const [reciters, setReciters] = useState([]);
  const { currentUser, logout } = useContext(UserContext);
  const { t } = useLanguage();
  const [subscriptionInfo, setSubscriptionInfo] = useState({ hasAccess: false, daysLeft: 0, isExpired: true });

  // Comprehensive language list with 25+ languages
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  ];

  useEffect(() => {
    fetchReciters().then(setReciters);
  }, []);

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
    <Box sx={{ py: 6, px: 2, maxWidth: 650, mx: 'auto' }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, letterSpacing: '-1px' }}>
              {t('appSettings')}
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
              {t('tailorExperience')}
            </Typography>
          </Box>

          <Stack spacing={3}>
            {/* Upgrade Card for Free Users */}
            {!subscriptionInfo.hasAccess && (
              <Card elevation={0} sx={{ 
                borderRadius: '24px', 
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Unlock Full Hifdh Power</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 3, maxWidth: '80%' }}>
                    Get unlimited access to Smart Hifdh Mode, all 10+ reciters, and detailed progress tracking.
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={onUpgrade}
                    sx={{ 
                      bgcolor: 'white', 
                      color: '#6366F1', 
                      fontWeight: 700,
                      borderRadius: '12px',
                      '&:hover': { bgcolor: '#F8FAFC' }
                    }}
                  >
                    Upgrade for ₹199
                  </Button>
                </CardContent>
                <CardMembershipIcon sx={{ 
                  position: 'absolute', 
                  right: -20, 
                  bottom: -20, 
                  fontSize: 180, 
                  opacity: 0.1,
                  transform: 'rotate(-15deg)'
                }} />
              </Card>
            )}

            {/* Profile Selection Card */}
            <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#F5F7FF', color: '#6366F1' }}><GroupIcon /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>Current Profile</Typography>
                </Stack>

                <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', mb: 3 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Active Profile</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mt: 0.5 }}>{profile?.name || 'No Profile Selected'}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>Currently at Page {profile?.currentPage || 1}</Typography>
                </Box>

                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<GroupIcon />}
                  onClick={onSwitchProfile}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                    color: '#6366F1',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#F5F7FF', borderColor: '#6366F1' }
                  }}
                >
                  Switch Profile
                </Button>
              </CardContent>
            </Card>

            {/* Audio Settings Card */}
            <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#F5F7FF', color: '#6366F1' }}><MicIcon /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>{t('audioRecitation')}</Typography>
                </Stack>
                
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748B', mb: 1 }}>{t('chooseReciter')}</Typography>
                    <FormControl fullWidth>
                      <Select
                        value={settings?.reciter || 7}
                        onChange={(e) => handleChange('reciter', e.target.value)}
                        sx={{ borderRadius: '12px', bgcolor: '#F8FAFC' }}
                      >
                        {reciters.map(r => (
                          <MenuItem key={r.id} value={r.id}>
                            {r.reciter_name} {r.style ? `(${r.style})` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748B' }}>{t('repetitions')}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, px: 1.5, py: 0.5, bgcolor: '#F5F7FF', color: '#6366F1', borderRadius: '6px' }}>
                        {settings?.repetitions || 5}x
                      </Typography>
                    </Stack>
                    <Slider
                      value={settings?.repetitions || 5}
                      min={1}
                      max={20}
                      step={1}
                      onChange={(e, v) => handleChange('repetitions', v)}
                      sx={{
                        color: '#6366F1',
                        '& .MuiSlider-thumb': { borderRadius: '6px' }
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Language Settings Card */}
            <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#F5F7FF', color: '#6366F1' }}><LanguageIcon /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>{t('language')}</Typography>
                </Stack>
                
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748B', mb: 1 }}>
                    {t('chooseLanguage')}
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={settings?.language || 'en'}
                      onChange={(e) => handleChange('language', e.target.value)}
                      sx={{ borderRadius: '12px', bgcolor: '#F8FAFC' }}
                    >
                      {languages.map(lang => (
                        <MenuItem key={lang.code} value={lang.code}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontWeight: 600 }}>{lang.nativeName}</Typography>
                            <Typography sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                              ({lang.name})
                            </Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" sx={{ color: '#94A3B8', mt: 1, display: 'block' }}>
                    {t('languageHelper')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Appearance Settings Card */}
            <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#F5F7FF', color: '#6366F1' }}><PaletteIcon /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>{t('appearance')}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {settings?.theme === 'dark' ? <DarkModeIcon sx={{ color: '#64748B' }} /> : <LightModeIcon sx={{ color: '#64748B' }} />}
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                      {settings?.theme === 'dark' ? t('darkMode') : t('lightMode')}
                    </Typography>
                  </Stack>
                  <Switch 
                    checked={settings?.theme === 'dark'} 
                    onChange={(e) => handleChange('theme', e.target.checked ? 'dark' : 'light')} 
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#6366F1' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6366F1' }
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Account Settings Card */}
            <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#F5F7FF', color: '#1B293B' }}><PersonIcon /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>{t('account')}</Typography>
                </Stack>

                <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', mb: 3 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>{t('connectedAs')}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', mt: 0.5 }}>{currentUser?.displayName || 'User'}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>{currentUser?.email}</Typography>
                </Box>

                <Button 
                  variant="outlined" 
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={logout}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    borderColor: '#FECACA',
                    color: '#EF4444',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#FEF2F2', borderColor: '#F87171' }
                  }}
                >
                  {t('signOut')}
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Card */}
            {subscriptionInfo.hasAccess && (
              <Card elevation={0} sx={{ 
                borderRadius: '24px', 
                border: '2px solid',
                borderColor: subscriptionInfo.daysLeft > 7 ? '#10B981' : subscriptionInfo.daysLeft > 3 ? '#F59E0B' : '#EF4444',
                background: subscriptionInfo.daysLeft > 7 
                  ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)'
                  : subscriptionInfo.daysLeft > 3
                  ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
                  : 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: subscriptionInfo.daysLeft > 7 ? '#10B981' : subscriptionInfo.daysLeft > 3 ? '#F59E0B' : '#EF4444',
                      color: 'white'
                    }}>
                      <CardMembershipIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                        {t('subscription')}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: subscriptionInfo.daysLeft > 7 ? '#059669' : subscriptionInfo.daysLeft > 3 ? '#D97706' : '#DC2626',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {t('active')}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={2}>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: '16px', 
                      bgcolor: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            {t('subscriptionStatus')}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {t('premiumAccess')}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            {t('daysLeft')}
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 800, 
                            color: subscriptionInfo.daysLeft > 7 ? '#059669' : subscriptionInfo.daysLeft > 3 ? '#D97706' : '#DC2626'
                          }}>
                            {subscriptionInfo.daysLeft}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {subscriptionInfo.expiryDate && (
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '12px', 
                        bgcolor: 'rgba(255, 255, 255, 0.5)',
                        textAlign: 'center'
                      }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                          {t('expiresOn')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', mt: 0.5 }}>
                          {new Date(subscriptionInfo.expiryDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Support & Legal Card */}
            <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#F5F7FF', color: '#6366F1' }}><SecurityIcon /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>Support & Legal</Typography>
                </Stack>
                
                <Stack spacing={2}>
                  <Button 
                    fullWidth 
                    variant="text" 
                    onClick={onContact}
                    sx={{ 
                      justifyContent: 'flex-start', 
                      color: '#475569', 
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: '12px',
                      '&:hover': { bgcolor: '#F8FAFC', color: '#6366F1' }
                    }}
                    startIcon={<EmailIcon />}
                  >
                    Contact Us / Feedback
                  </Button>
                  <Divider sx={{ borderColor: '#F1F5F9' }} />
                  <Button 
                    fullWidth 
                    variant="text" 
                    onClick={onDownload}
                    sx={{ 
                      justifyContent: 'flex-start', 
                      color: '#475569', 
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: '12px',
                      '&:hover': { bgcolor: '#F8FAFC', color: '#6366F1' }
                    }}
                    startIcon={<DownloadIcon />}
                  >
                    Download App
                  </Button>
                  <Divider sx={{ borderColor: '#F1F5F9' }} />
                  <Button 
                    fullWidth 
                    variant="text" 
                    onClick={onPrivacy}
                    sx={{ 
                      justifyContent: 'flex-start', 
                      color: '#475569', 
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: '12px',
                      '&:hover': { bgcolor: '#F8FAFC', color: '#6366F1' }
                    }}
                    startIcon={<SecurityIcon />}
                  >
                    Privacy Policy
                  </Button>
                  <Divider sx={{ borderColor: '#F1F5F9' }} />
                  <Button 
                    fullWidth 
                    variant="text" 
                    onClick={onTerms}
                    sx={{ 
                      justifyContent: 'flex-start', 
                      color: '#475569', 
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: '12px',
                      '&:hover': { bgcolor: '#F8FAFC', color: '#6366F1' }
                    }}
                    startIcon={<DescriptionIcon />}
                  >
                    Terms & Conditions
                  </Button>
                  <Divider sx={{ borderColor: '#F1F5F9' }} />
                  <Button 
                    fullWidth 
                    variant="text" 
                    onClick={onRefund}
                    sx={{ 
                      justifyContent: 'flex-start', 
                      color: '#475569', 
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: '12px',
                      '&:hover': { bgcolor: '#F8FAFC', color: '#6366F1' }
                    }}
                    startIcon={<UndoIcon />}
                  >
                    Refund Policy
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Admin Management Card */}
            {isAdmin && (
              <Card elevation={0} sx={{ 
                borderRadius: '24px', 
                border: '1px solid #E2E8F0',
                background: '#F8FAFC'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                    <Avatar sx={{ bgcolor: '#0F172A', color: 'white' }}>
                      <AdminPanelSettingsIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                      Management
                    </Typography>
                  </Stack>
                  
                  <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'white', border: '1px solid #E2E8F0', mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      Admin Control Panel
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                      Manage users, analyze subscription data, and perform system maintenance.
                    </Typography>
                  </Box>

                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={onAdminAccess}
                    sx={{ 
                      bgcolor: '#0F172A', 
                      color: 'white', 
                      fontWeight: 700,
                      borderRadius: '12px',
                      py: 1.5,
                      '&:hover': { bgcolor: '#1e293b' }
                    }}
                  >
                    Open Admin Panel
                  </Button>
                </CardContent>
              </Card>
            )}

          </Stack>

          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 6, color: '#94A3B8', fontWeight: 500 }}>
            v1.2.0 • Build 2026.01.26
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
};

export default SettingsView;
