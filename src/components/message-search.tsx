"use client";

import React, { useState, useEffect } from "react";
import { Box, TextField, InputAdornment, IconButton, CircularProgress } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface MessageSearchProps {
  onSearch: (query: string) => void;
}

const DEBOUNCE_DELAY = 1000;

export const MessageSearch = ({ onSearch }: MessageSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    onSearch(debouncedSearchTerm.trim());

  }, [debouncedSearchTerm, onSearch]);

  return (
    <Box mb={2}>
      <TextField
        fullWidth
        placeholder="Search messages..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton edge="start">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment:
            searchTerm !== debouncedSearchTerm ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : null,
        }}
      />
    </Box>
  );
};
