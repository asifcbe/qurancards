import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, 
  FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, Slider, Button,
  Stack,Divider
} from '@mui/material';
import { fetchReciters } from '../api';
import { db } from '../db';

const SettingsView = ({ settings }) => {
  const [reciters, setReciters] = useState([]);

  useEffect(() => {
    fetchReciters().then(setReciters);
  }, []);

  const handleChange = (field, value) => {
    db.settings.update('default', { [field]: value });
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={4}>
            <FormControl fullWidth>
              <InputLabel>Reciter</InputLabel>
              <Select
                value={settings?.reciter || 7} // Default to Mishary (7)
                label="Reciter"
                onChange={(e) => handleChange('reciter', e.target.value)}
              >
                {reciters.map(r => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.reciter_name} {r.style ? `(${r.style})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography gutterBottom>Repetitions: {settings?.repetitions || 5}</Typography>
              <Slider
                value={settings?.repetitions || 5}
                min={1}
                max={20}
                step={1}
                marks
                valueLabelDisplay="auto"
                onChange={(e, v) => handleChange('repetitions', v)}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch 
                  checked={settings?.theme === 'dark'} 
                  onChange={(e) => handleChange('theme', e.target.checked ? 'dark' : 'light')} 
                />
              }
              label="Dark Mode"
            />
            
            <Divider />
            
            <Box>
                <Typography variant="h6" gutterBottom>Data Management</Typography>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" onClick={async () => {
                        const allData = await db.export(); 
                        const blob = new Blob([JSON.stringify(allData)], {type: "application/json"});
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `quran_backup_${new Date().toISOString().slice(0,10)}.json`;
                        link.click();
                    }}>
                        Backup Data
                    </Button>
                    <Button variant="outlined" component="label">
                        Restore Backup
                        <input type="file" hidden accept=".json" onChange={async (e) => {
                            if (e.target.files?.[0]) {
                                const text = await e.target.files[0].text();
                                try {
                                    const data = JSON.parse(text);
                                    await db.import(data);
                                    window.location.reload();
                                } catch (err) {
                                    alert('Invalid backup file');
                                }
                            }
                        }} />
                    </Button>
                </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      
      <Button variant="contained" fullWidth onClick={() => window.location.reload()}>
        Apply & Reload
      </Button>
    </Box>
  );
};

export default SettingsView;
