import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Box, Typography, Container, Tabs, Tab, 
  Paper, IconButton, Stack, Divider, Fade 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';
import DescriptionIcon from '@mui/icons-material/Description';
import UndoIcon from '@mui/icons-material/Undo';

const PoliciesView = ({ onBack, initialTab = 0 }) => {
  const [tab, setTab] = useState(initialTab);

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const Section = ({ title, icon, children }) => (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ color: '#6366F1', display: 'flex' }}>{icon}</Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>{title}</Typography>
      </Stack>
      <Box sx={{ color: '#475569', lineHeight: 1.7 }}>
        {children}
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Fade in timeout={600}>
        <Box>
          <Helmet>
            <title>Policies & Legal | MeAndQuran</title>
            <meta name="description" content="View MeAndQuran's Privacy Policy, Terms of Service, and Refund Policy." />
          </Helmet>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <IconButton onClick={onBack} sx={{ bgcolor: '#F1F5F9' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h1" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-1px', fontSize: '2.5rem' }}>
              Policies & Legal
            </Typography>
          </Stack>

          <Paper elevation={0} sx={{ 
            borderRadius: '24px', 
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            mb: 4
          }}>
            <Tabs 
              value={tab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: '1px solid #E2E8F0',
                '& .MuiTab-root': { fontWeight: 700, py: 2.5, textTransform: 'none' },
                '& .Mui-selected': { color: '#6366F1' },
                '& .MuiTabs-indicator': { backgroundColor: '#6366F1', height: 3 }
              }}
            >
              <Tab label="Privacy Policy" />
              <Tab label="Terms of Service" />
              <Tab label="Refund & Cancellation" />
            </Tabs>

            <Box sx={{ p: { xs: 3, md: 5 } }}>
              {tab === 0 && (
                <Box>
                  <Section title="Data Collection" icon={<SecurityIcon />}>
                    <Typography variant="body2" paragraph>
                      We collect minimal data required to provide our service, including your email address and basic profile information. Your spiritual progress and settings are stored securely in our database.
                    </Typography>
                  </Section>
                  <Section title="Payment Security" icon={<SecurityIcon />}>
                    <Typography variant="body2" paragraph>
                      MeAndQuran does not store your credit card or sensitive financial information. All payments are processed securely by <strong>Razorpay</strong>, our trusted payment gateway. Razorpay adheres to industry-leading security standards to protect your data during transactions.
                    </Typography>
                  </Section>
                  <Section title="Data Usage" icon={<SecurityIcon />}>
                    <Typography variant="body2" paragraph>
                      Your data is used solely to personalize your Quran memorization experience. We never sell your data to third parties.
                    </Typography>
                  </Section>
                </Box>
              )}

              {tab === 1 && (
                <Box>
                  <Section title="Acceptance of Terms" icon={<DescriptionIcon />}>
                    <Typography variant="body2" paragraph>
                      By using MeAndQuran, you agree to abide by these terms. The app is designed for educational and spiritual purposes to assist in the memorization of the Holy Quran.
                    </Typography>
                  </Section>
                  <Section title="Subscription Access" icon={<DescriptionIcon />}>
                    <Typography variant="body2" paragraph>
                      Premium features, including Smart Hifdh Mode, are granted upon successful payment via <strong>Razorpay</strong>. Access is typically granted for a period of 30 days and requires manual renewal upon expiry.
                    </Typography>
                  </Section>
                  <Section title="Account Responsibility" icon={<DescriptionIcon />}>
                    <Typography variant="body2" paragraph>
                      Users are responsible for maintaining the confidentiality of their accounts. We reserve the right to suspend accounts that violate our community standards.
                    </Typography>
                  </Section>
                </Box>
              )}

              {tab === 2 && (
                <Box>
                  <Section title="No Refund Policy" icon={<UndoIcon />}>
                    <Typography variant="body2" paragraph sx={{ fontWeight: 600, color: '#0F172A' }}>
                      MeAndQuran provides a free trial version (Pages 30 & 31) to allow users to evaluate the Hifdh Mode before purchasing. Consequently, we have a strict <strong>No Refund</strong> policy once a premium subscription is purchased.
                    </Typography>
                  </Section>
                  <Section title="Subscription Period" icon={<UndoIcon />}>
                    <Typography variant="body2" paragraph>
                      Subscriptions are valid for 30 days. This is a manual renewal system; you will not be automatically charged. To continue using premium features after 30 days, you must initiate a new payment through <strong>Razorpay</strong>.
                    </Typography>
                  </Section>
                  <Section title="Cancellation" icon={<UndoIcon />}>
                    <Typography variant="body2" paragraph>
                      Since there are no automatic recurring charges, "cancellation" specifically refers to the expiration of your current 30-day term. You may choose not to renew at any time without further obligation.
                    </Typography>
                  </Section>
                </Box>
              )}
            </Box>
          </Paper>

          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94A3B8', fontWeight: 500 }}>
            Last Updated: January 26, 2026 • MeAndQuran Legal Team
          </Typography>
        </Box>
      </Fade>
    </Container>
  );
};

export default PoliciesView;
