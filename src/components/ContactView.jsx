import React, { useState, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Box, Typography, Container, Paper, TextField, 
  Button, Stack, IconButton, Fade, Alert, CircularProgress 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { UserContext } from '../contexts/UserContext';

const ContactView = ({ onBack }) => {
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addDoc(collection(firestore, 'contacts'), {
        ...formData,
        userId: currentUser?.uid || 'guest',
        createdAt: new Date(),
        status: 'new'
      });
      setSuccess(true);
      setFormData({ ...formData, subject: '', message: '' });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Fade in timeout={600}>
        <Box>
          <Helmet>
            <title>Contact Us | MeAndQuran</title>
            <meta name="description" content="Get in touch with the MeAndQuran team for any questions or feedback about Quran memorization." />
          </Helmet>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <IconButton onClick={onBack} sx={{ bgcolor: '#F1F5F9' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h1" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-1px', fontSize: '2.5rem' }}>
              Contact Us
            </Typography>
          </Stack>

          <Paper elevation={0} sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: '24px', 
            border: '1px solid #E2E8F0',
            bgcolor: '#ffffff'
          }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Box sx={{ 
                width: 60, height: 60, borderRadius: '20px', 
                bgcolor: '#F5F7FF', color: '#6366F1', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2
              }}>
                <EmailIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Get in touch</Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Have questions or feedback? Send us a message and we'll get back to you soon.
              </Typography>
            </Box>

            {success ? (
              <Fade in>
                <Alert 
                  severity="success" 
                  sx={{ borderRadius: '16px', py: 2 }}
                  onClose={() => setSuccess(false)}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Message Sent!</Typography>
                  <Typography variant="body2">Thank you for contacting us. We will reply to your email soon.</Typography>
                </Alert>
              </Fade>
            ) : (
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  {error && <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>}
                  
                  <TextField
                    fullWidth
                    label="Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />

                  <TextField
                    fullWidth
                    label="Subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />

                  <TextField
                    fullWidth
                    label="Message"
                    multiline
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    sx={{
                      py: 1.8,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 8px 16px rgba(99, 102, 241, 0.25)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                      }
                    }}
                  >
                    Send Message
                  </Button>
                </Stack>
              </form>
            )}
          </Paper>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
              Or email us directly at:
            </Typography>
            <Typography variant="body2" sx={{ color: '#6366F1', fontWeight: 700, mt: 0.5 }}>
              meandquran114@gmail.com
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Container>
  );
};

export default ContactView;
