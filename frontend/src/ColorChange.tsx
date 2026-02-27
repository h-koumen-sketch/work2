import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { ThemeContext } from './ThemeContext';

const ColorChange: React.FC = () => {
  const ctx = React.useContext(ThemeContext);
  const navColor = ctx?.navColor ?? '#1976d2';
  const setNavColor = ctx?.setNavColor;
  const bgColor = ctx?.bgColor ?? '#f0f2f5';
  const setBgColor = ctx?.setBgColor;
  const iconColor = ctx?.iconColor ?? '#525353';
  const setIconColor = ctx?.setIconColor;

  const [navValue, setNavValue] = React.useState<string>(navColor);
  const [bgValue, setBgValue] = React.useState<string>(bgColor);
  const [iconValue, setIconValue] = React.useState<string>(iconColor);

  React.useEffect(() => {
    setNavValue(navColor);
  }, [navColor]);
  React.useEffect(() => {
    setBgValue(bgColor);
  }, [bgColor]);
  React.useEffect(() => {
    setIconValue(iconColor);
  }, [iconColor]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        ナビゲーションの色を変更
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
        <input
          type="color"
          value={navValue}
          onChange={(e) => setNavValue(e.target.value)}
          style={{ width: 48, height: 48, border: 'none', padding: 0 }}
        />
        <TextField label="HEX" value={navValue} onChange={(e) => setNavValue(e.target.value)} />
        <Button variant="contained" onClick={() => setNavColor && setNavColor(navValue)}>
          適用
        </Button>
        <Button variant="outlined" onClick={() => { setNavValue('#1976d2'); setNavColor && setNavColor('#1976d2'); }}>
          デフォルトに戻す
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        アプリ背景色を変更
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
        <input
          type="color"
          value={bgValue}
          onChange={(e) => setBgValue(e.target.value)}
          style={{ width: 48, height: 48, border: 'none', padding: 0 }}
        />
        <TextField label="HEX" value={bgValue} onChange={(e) => setBgValue(e.target.value)} />
        <Button variant="contained" onClick={() => setBgColor && setBgColor(bgValue)}>
          適用
        </Button>
        <Button variant="outlined" onClick={() => { setBgValue('#f0f2f5'); setBgColor && setBgColor('#f0f2f5'); }}>
          デフォルトに戻す
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        アイコンの色を変更
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
        <input
          type="color"
          value={iconValue}
          onChange={(e) => setIconValue(e.target.value)}
          style={{ width: 48, height: 48, border: 'none', padding: 0 }}
        />
        <TextField label="HEX" value={iconValue} onChange={(e) => setIconValue(e.target.value)} />
        <Button variant="contained" onClick={() => setIconColor && setIconColor(iconValue)}>
          適用
        </Button>
        <Button variant="outlined" onClick={() => { setIconValue('#525353'); setIconColor && setIconColor('#525353'); }}>
          デフォルトに戻す
        </Button>
      </Box>
    </Box>
  );
};

export default ColorChange;
