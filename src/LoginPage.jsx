import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { createTheme } from '@mui/material/styles';
// import { useColorSchemeShim } from 'docs/src/modules/components/ThemeContext';
import { useColorScheme } from '@mui/material/styles';

import { getDesignTokens, inputsCustomizations } from './customTheme';

const providers = [
  // { id: 'github', name: 'GitHub' },
  // { id: 'google', name: 'Google' },
  { id: "telegram", name:"Telegram"},
  // { id: 'credentials', name: 'Email and Password' },
];

const signIn = async (provider) => {
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Sign in with ${provider.id}`);
      if(provider.id === "telegram"){
        window.location.href = "https://t.me/Attendance009bot"
      }
      resolve()
      
    }, 50);
  });
  return promise;
};

export default function ThemeSignInPage() {
  const { mode, systemMode } = useColorScheme();
  const calculatedMode = (mode === 'system' ? systemMode : mode) ?? 'dark';
  const brandingDesignTokens = getDesignTokens(calculatedMode);
  // preview-start
  const THEME = createTheme({
    ...brandingDesignTokens,
    palette: {
      ...brandingDesignTokens.palette,
      mode: calculatedMode,
    },
    components: {
      ...inputsCustomizations,
    },
  });
  // preview-end

  return (
    // preview-start
    <AppProvider theme={THEME}>
      <SignInPage
        signIn={signIn}
        providers={providers}
        slotProps={{
          form: { noValidate: true },
          submitButton: {
            color: 'primary',
            variant: 'contained',
          },
        }}
        sx={{
          '& form > .MuiStack-root': {
            marginTop: '2rem',
            rowGap: '0.5rem',
          },
        }}
      />
    </AppProvider>
    // preview-end
  );
}
