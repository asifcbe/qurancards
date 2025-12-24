import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, 
  Button, TextField, List, ListItem, 
  ListItemText, ListItemSecondaryAction,
  IconButton, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from '../db';
import { getJuzStartPage } from '../api';

const ProfileSelection = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [juz, setJuz] = useState(1);

  const profiles = useLiveQuery(() => db.profiles.toArray());

  const handleAddProfile = async () => {
    if (name.trim()) {
      const id = await db.profiles.add({
        name,
        currentJuz: juz,
        currentPage: getJuzStartPage(juz)
      });
      const newProfile = await db.profiles.get(id);
      onSelect(newProfile);
      setOpen(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await db.profiles.delete(id);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>Who is memorizing?</Typography>
      
      <Card sx={{ mt: 2, borderRadius: 4 }}>
        <CardContent>
          <List>
            {profiles?.map((profile) => (
              <React.Fragment key={profile.id}>
                <ListItem button onClick={() => onSelect(profile)}>
                  <ListItemText primary={profile.name} secondary={`Last page: ${profile.currentPage}`} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={(e) => handleDelete(profile.id, e)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            <ListItem button onClick={() => setOpen(true)}>
              <ListItemText primary="Add New Profile" sx={{ color: 'primary.main', textAlign: 'center' }} />
              <AddIcon color="primary" />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Starting Juz"
            type="number"
            fullWidth
            variant="outlined"
            inputProps={{ min: 1, max: 30 }}
            value={juz}
            onChange={(e) => setJuz(parseInt(e.target.value))}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddProfile} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileSelection;
