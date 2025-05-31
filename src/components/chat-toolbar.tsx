'use client';
 

import { IconButton } from "@mui/material";
import { MoonIcon, SunIcon } from 'lucide-react';
import { Box ,Typography } from "@mui/material";
import { useTheme } from '@/contexts/theme-context';
import Logout from './logout';


export const ChatToolbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem',
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        zIndex: 1000,
      }}
    >
      <Typography variant="h6" component="div">
        Chat App
      </Typography>
      <Box>
      <IconButton
              onClick={toggleTheme}
              sx={{
                position: 'fixed',
                top: 0,
                right: 0,
                p: 2,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                zIndex: 1000,
              }}
    >           
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
   
      </IconButton>
      <Box sx={{ marginRight: '2.5rem' }}>
        <Logout />
      </Box>
      </Box>

      
    </Box>
  );
};
