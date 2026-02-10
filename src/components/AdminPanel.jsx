import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { UserContext } from '../contexts/UserContext';
import { getAllUsers, grantUserAccess, revokeUserAccess, updateMaxProfiles } from '../firestoreDB';

const AdminPanel = () => {
  const { currentUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [maxProfilesValue, setMaxProfilesValue] = useState(2);

  const isAdmin = currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersList = await getAllUsers();
      setUsers(usersList);
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    if (type === 'maxProfiles') setMaxProfilesValue(user.maxProfiles || 2);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setActionType('');
    setDialogOpen(false);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;
    setProcessing(true);
    setError('');
    try {
      if (actionType === 'grant') await grantUserAccess(selectedUser.uid);
      else if (actionType === 'revoke') await revokeUserAccess(selectedUser.uid);
      else if (actionType === 'maxProfiles') await updateMaxProfiles(selectedUser.uid, maxProfilesValue);
      await loadUsers();
      handleCloseDialog();
    } catch (err) {
      setError('Action failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px', maxWidth: 400 }}>
          <LockIcon sx={{ fontSize: 64, color: '#EF4444', mb: 2 }} />
          <Typography variant="h5" fontWeight={800}>Access Denied</Typography>
          <Typography sx={{ color: '#64748B', mt: 1 }}>Admin permissions required.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6, px: 2, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Stats Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 6 }}>
          {[
            { label: 'Total Users', val: users.length, color: '#6366F1' },
            { label: 'Active Subscribers', val: users.filter(u => u.hasAccess).length, color: '#10B981' },
            { label: 'Inactive', val: users.filter(u => !u.hasAccess).length, color: '#94A3B8' }
          ].map((stat, i) => (
            <Paper key={i} sx={{ p: 3, flexGrow: 1, borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{stat.label}</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: stat.color, mt: 1 }}>{stat.val}</Typography>
            </Paper>
          ))}
        </Stack>

        <Paper sx={{ borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>User Management</Typography>
            <Stack direction="row" spacing={2} sx={{ flexGrow: 1, maxWidth: 400 }}>
              <TextField 
                size="small" 
                fullWidth 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1 }} size="small" />
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <IconButton onClick={loadUsers} disabled={loading} color="primary"><RefreshIcon /></IconButton>
            </Stack>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Max Profiles</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Granted</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Payment</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Expiry</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748B' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>{user.email?.[0].toUpperCase()}</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{user.displayName || 'Anonymous'}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>{user.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={user.hasAccess ? 'Premium' : 'Free'} 
                        sx={{ 
                          fontWeight: 700, 
                          bgcolor: user.hasAccess ? '#ECFDF5' : '#F1F5F9',
                          color: user.hasAccess ? '#065F46' : '#64748B',
                          border: '1px solid',
                          borderColor: user.hasAccess ? '#A7F3D0' : '#E2E8F0'
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => handleOpenDialog(user, 'maxProfiles')}
                        sx={{ fontWeight: 700, borderRadius: '8px' }}
                      >
                        {user.maxProfiles || 2}
                      </Button>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>
                      {user.accessGrantedDate ? new Date(user.accessGrantedDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>
                      {user.lastPaymentDate ? new Date(user.lastPaymentDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 700, color: user.hasAccess ? '#059669' : '#475569' }}>
                      {user.accessExpiryDate ? new Date(user.accessExpiryDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {user.hasAccess ? (
                        <Button size="small" variant="text" color="error" onClick={() => handleOpenDialog(user, 'revoke')} sx={{ fontWeight: 700 }}>Revoke</Button>
                      ) : (
                        <Button size="small" variant="text" color="primary" onClick={() => handleOpenDialog(user, 'grant')} sx={{ fontWeight: 700 }}>Grant Access</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
            {actionType === 'grant' ? 'Grant premium access' : actionType === 'revoke' ? 'Revoke premium access' : 'Update profile limit'} for <strong>{selectedUser?.email}</strong>?
            {actionType === 'maxProfiles' && (
              <TextField
                type="number"
                fullWidth
                label="Max Profiles"
                value={maxProfilesValue}
                onChange={(e) => setMaxProfilesValue(e.target.value)}
                sx={{ mt: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#64748B', fontWeight: 600 }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleConfirmAction} 
            disabled={processing}
            color={actionType === 'grant' ? 'primary' : 'error'}
            sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
