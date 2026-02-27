import React from 'react';

type ThemeContextType = {
  navColor: string;
  setNavColor: (c: string) => void;
  bgColor: string;
  setBgColor: (c: string) => void;
  iconColor: string;
  setIconColor: (c: string) => void;
};

const defaultColor = '#1976d2';
const defaultIconColor = '#525353';

export const ThemeContext = React.createContext<ThemeContextType | null>(null);
const defaultBgColor = '#f0f2f5';


export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navColor, setNavColorState] = React.useState<string>(() => {
    try {
      const v = localStorage.getItem('navColor');
      return v ?? defaultColor;
    } catch (e) {
      return defaultColor;
    }
  });
  const [bgColor, setBgColorState] = React.useState<string>(() => {
    try {
      const v = localStorage.getItem('bgColor');
      return v ?? defaultBgColor;
    } catch (e) {
      return defaultBgColor;
    }
  });
  const [iconColor, setIconColorState] = React.useState<string>(() => {
    try {
      const v = localStorage.getItem('iconColor');
      return v ?? defaultIconColor;
    } catch (e) {
      return defaultIconColor;
    }
  });

  const setNavColor = (c: string) => {
    setNavColorState(c);
    try {
      localStorage.setItem('navColor', c);
    } catch (e) {}
  };
  const setBgColor = (c: string) => {
    setBgColorState(c);
    try {
      localStorage.setItem('bgColor', c);
    } catch (e) {}
  };
  const setIconColor = (c: string) => {
    setIconColorState(c);
    try {
      localStorage.setItem('iconColor', c);
    } catch (e) {}
  };

  return (
    <ThemeContext.Provider value={{ navColor, setNavColor, bgColor, setBgColor, iconColor, setIconColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
