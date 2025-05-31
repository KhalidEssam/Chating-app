'use client';

import { useState, useCallback } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { apiService } from '@/services/api.service';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.login({ username, password });

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      try {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
      } catch (storageError) {
        console.warn('LocalStorage error:', storageError);
      }

      // Optionally verify token validity by fetching users
      await apiService.getUsers();

      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, [username, password]);

  const isButtonDisabled = loading || !username.trim() || !password.trim();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Login
        </Typography>

        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          disabled={loading}
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleLogin}
          sx={{ mt: 2 }}
          disabled={isButtonDisabled}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Paper>
    </Box>
  );
};
