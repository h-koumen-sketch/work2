import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PaletteIcon from "@mui/icons-material/Palette";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import AvatarMenu from './Avatar';
import { Link } from 'react-router-dom';
import { ThemeContext } from './ThemeContext';

function isLightColor(hex: string) {
  try {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 186;
  } catch (e) {
    return false;
  }
}


const getMenuItems = () => {
  const items = [
    { text: "住所一覧", path: "/address", icon: <HomeIcon /> },
    { text: "色変更", path: "/color", icon: <PaletteIcon /> },
  ];
  let role = '';
  try {
    role = localStorage.getItem('role') || '';
  } catch {}
  if (role === 'admin' || role === 'super_admin') {
    items.push({ text: "管理者", path: "/admin", icon: <AdminPanelSettingsIcon /> });
  }
  return items;
};

const GlobalNav: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (state: boolean) => () => {
    setOpen(state);
  };

  const ctx = React.useContext(ThemeContext);
  const navColor = ctx ? ctx.navColor : undefined;
  const iconColor = ctx ? ctx.iconColor : undefined;
  const textColor = navColor && isLightColor(navColor) ? '#000' : '#fff';

  return (
    <>
      <AppBar position="static" sx={navColor ? { bgcolor: navColor, color: textColor } : undefined}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            サンプルアプリ
          </Typography>

          <AvatarMenu />
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {getMenuItems().map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  {React.cloneElement(item.icon, iconColor ? { sx: { color: iconColor } } : {})}
                  <ListItemText primary={item.text} sx={{ ml: 1 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default GlobalNav;