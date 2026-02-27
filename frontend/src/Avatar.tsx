import React from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';

const AvatarMenu: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);

  const handleProfile = () => {
    handleClose();
    navigate('/avatarinfo');
  };
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    try {
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('userId');
    } catch (e) {}
    handleClose();
    navigate('/');
  };

  const getInitial = () => {
    try {
      const email = localStorage.getItem('userEmail') || '';
      return email ? email.charAt(0).toUpperCase() : 'U';
    } catch (e) {
      return 'U';
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} size="small" sx={{ ml: 1 }}>
        <Avatar sx={{ width: 32, height: 32 }}>{getInitial()}</Avatar>
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={handleProfile}>プロフィール</MenuItem>
        <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
      </Menu>
    </>
  );
};

export default AvatarMenu;
