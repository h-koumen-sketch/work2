import { Navigate } from 'react-router-dom';

import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import GlobalNav from './GlobalNav';
import Table from './AddressTable';
import Admin from './Admin';
import UserTable from './UserTable';
import ColorChange from './ColorChange';
import { ThemeProvider, ThemeContext } from './ThemeContext';
import Login from './Login';
import AddressInfo from './AddressInfo';
import AvatarInfo from './AvatarInfo';
import AddressResurrection from './AddressResurrection';
import Master from './Master';
import ExternalAppDashboard from './ExternalAppDashboard';

const Layout: React.FC = () => (
  <>
    <GlobalNav />
    <Outlet />
  </>
);

// 権限チェック付きルート
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const role = localStorage.getItem('role');
  if (role === 'admin' || role === 'super_admin') {
    return <>{children}</>;
  } else {
    return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <ThemeProvider>
      <ThemeContext.Consumer>
        {ctx => (
          <div style={{ backgroundColor: ctx?.bgColor ?? '#f0f2f5', minHeight: '100vh' }}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<Layout />}> 
                  <Route path="/address" element={<Table />} />
                  <Route path="/address/addressinfo" element={<AddressInfo />} />
                  <Route path="/color" element={<ColorChange />} />
                  <Route path="/externalapps" element={<ExternalAppDashboard />} />
                  <Route path="/avatarinfo" element={<AvatarInfo />} />
                  <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
                  <Route path="/admin/usertable" element={<PrivateRoute><UserTable /></PrivateRoute>} />
                  <Route path="/admin/master" element={<PrivateRoute><Master /></PrivateRoute>} />
                  <Route path="/admin/addressresurrection" element={<PrivateRoute><AddressResurrection /></PrivateRoute>} />
                </Route>
              </Routes>
            </BrowserRouter>
          </div>
        )}
      </ThemeContext.Consumer>
    </ThemeProvider>
  );
}

export default App;
