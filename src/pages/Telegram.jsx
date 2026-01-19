import React from 'react';
import Button from '@mui/material/Button';
import TelegramIcon from '@mui/icons-material/Telegram';
import "./Telegram.css"

const TelegramButton = () => {
  return (
    <Button className='mx-auto m-auto telegram-button' variant="contained" startIcon={<TelegramIcon />} style={{ backgroundColor: '#0088cc'}}>
        <a href="https://web.telegram.org/k/#@Attendance009bot" target="_blank" rel="noopener noreferrer">
            Telegram
        </a>
    </Button>
  );
};

export default TelegramButton;