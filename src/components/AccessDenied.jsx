import React, { useState, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Fade,
  Link
} from '@mui/material';
import {
  Check as CheckIcon,
  Payment as PaymentIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { UserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { grantUserAccess, deleteUserFirestoreData, getUserDocument } from '../firestoreDB';
import { auth, firestore } from '../firebaseConfig';
import { deleteUser } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

const AccessDenied = ({ onAccessGranted, onBack, onPrivacy, onTerms, onRefund }) => {
  const { currentUser, logout } = useContext(UserContext);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = () => {
    setLoading(true);
    setError('');

    const options = {
      key: "rzp_live_S9mAegmOfVjoeJ",
      amount: 19900,
      currency: "INR",
      name: "MeAndQuran Premium",
      description: "30 Days Premium Subscription",
      image: "/src/assets/meandquranlogo.png",
      handler: async function (response) {
        try {
          await grantUserAccess(currentUser.uid);
          
          // Trigger Success Email
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          
          await addDoc(collection(firestore, 'mail'), {
            to: currentUser.email,
            message: {
              subject: 'Welcome to MeAndQuran Premium!',
              html: `
                <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                  <h2 style="color: #6366f1;">Assalamu Alaikum, ${currentUser.displayName || 'User'}!</h2>
                  <p>Your subscription to MeAndQuran Premium was successful.</p>
                  <p><strong>Expiry Date:</strong> ${expiryDate.toLocaleDateString()}</p>
                  <p>You now have full access to all 604 pages, 10+ professional reciters, and our Smart Hifdh Mode.</p>
                  <p>May Allah make your Quran journey easy and blessed.</p>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                  <p style="font-size: 0.8rem; color: #64748b;">This payment was processed securely via Razorpay. This is a 30-day manual renewal plan.</p>
                </div>
              `
            }
          });

          if (onAccessGranted) {
            onAccessGranted();
          } else {
            window.location.reload();
          }
        } catch (err) {
          console.error("Success logic error:", err);
          setError("Transaction successful, but account update or email failed. Contact support.");
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: currentUser?.displayName || "",
        email: currentUser?.email || "",
      },
      theme: { color: "#6366f1" },
      modal: {
        ondismiss: () => setLoading(false)
      }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', (response) => {
      setError("Payment failed: " + response.error.description);
      setLoading(false);
    });
    rzp1.open();
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8FAFC',
      py: 4,
      px: 2,
    }}>
      <Container maxWidth="xs">
        <Fade in timeout={600}>
          <Paper elevation={0} sx={{
            p: 4,
            borderRadius: '24px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)',
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1E293B', mb: 1, letterSpacing: '-0.5px' }}>
              Premium Plan
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 3, mb: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '2.5rem' }}>
                ₹199
              </Typography>
              <Typography variant="body1" sx={{ ml: 1, color: '#64748B', fontWeight: 500 }}>
                /30 days
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: '#64748B', mb: 4, lineHeight: 1.6 }}>
              Get full access to all Quran pages and premium memorization tools to accelerate your hifdh journey.
            </Typography>

            <Divider sx={{ mb: 4, borderColor: '#F1F5F9' }} />

            <Stack spacing={2.5} sx={{ mb: 8 }}>
              {[
                'Full Quran access (604 pages)',
                '10+ Professional Reciters',
                'Advanced Progress Tracking',
                'Smart Repetition Mode',
                'Ad-free Experience'
              ].map((feature, index) => (
                <Stack key={index} direction="row" spacing={1.5} alignItems="center">
                  <CheckIcon sx={{ fontSize: 20, color: '#0F172A' }} />
                  <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                    {feature}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontSize: '0.875rem' }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              onClick={handlePayment}
              sx={{
                py: 2,
                borderRadius: '16px',
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                backgroundColor: '#6366f1',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#4f46e5',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                },
                '&:active': { transform: 'scale(0.98)' },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Go Premium'}
            </Button>

            {onBack && (
              <Button
                variant="outlined"
                fullWidth
                onClick={onBack}
                sx={{
                  mt: 1,
                  py: 1.5,
                  borderRadius: '16px',
                  borderColor: '#E2E8F0',
                  color: '#64748B',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#6366F1',
                    bgcolor: '#F8FAFC'
                  }
                }}
              >
                Maybe Later
              </Button>
            )}

            <Button
              variant="text"
              fullWidth
              onClick={logout}
              sx={{
                mt: 1.5,
                color: '#64748B',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '12px',
                '&:hover': { background: '#F1F5F9' }
              }}
            >
              Sign out and try another account
            </Button>
            
            <Divider sx={{ my: 3, borderColor: '#F1F5F9' }} />
            
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
              <ShieldIcon sx={{ fontSize: 16, color: '#10B981' }} />
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                Secure Payment via Razorpay
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Link 
                component="button" 
                variant="caption" 
                onClick={onPrivacy}
                sx={{ color: '#6366F1', fontWeight: 700, textDecoration: 'none' }}
              >
                Privacy
              </Link>
              <Link 
                component="button" 
                variant="caption" 
                onClick={onTerms}
                sx={{ color: '#6366F1', fontWeight: 700, textDecoration: 'none' }}
              >
                Terms
              </Link>
              <Link 
                component="button" 
                variant="caption" 
                onClick={onRefund}
                sx={{ color: '#6366F1', fontWeight: 700, textDecoration: 'none' }}
              >
                Refund
              </Link>
            </Stack>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};



export default AccessDenied;

