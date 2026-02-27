import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { ThemeContext } from './ThemeContext';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const ctx = React.useContext(ThemeContext);
  const bgColor = ctx?.bgColor ?? '#f5f7fb';

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: bgColor, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        管理者ダッシュボード
      </Typography>

      {/* ColorChange を管理画面内に埋め込む（子コンポーネント） */}

      <Stack direction="row" gap={2} flexWrap="wrap">
        <Card sx={{ bgcolor: '#ffffff', width: { xs: '100%', md: '48%', lg: '32%' }, mb: 2 }}>
          <CardContent>
            <Typography variant="h6">ユーザー管理</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              ユーザー一覧を表示・管理できます。
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/admin/usertable')}>
              ユーザー一覧を見る
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: '#ffffff', width: { xs: '100%', md: '48%', lg: '32%' }, mb: 2 }}>
          <CardContent>
            <Typography variant="h6">住所復活</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              削除された住所を復活させることができます。
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/admin/addressresurrection')}>
              削除された住所を見る
            </Button>
          </CardContent>
        </Card>
        
        <Card sx={{ bgcolor: '#ffffff', width: { xs: '100%', md: '48%', lg: '32%' }, mb: 2 }}>
          <CardContent>
            <Typography variant="h6">マスタ管理</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              マスタデータを管理できます。
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/admin/master')}>
              マスタデータを見る
            </Button>
          </CardContent>
        </Card>

        {/* <Card sx={{ width: { xs: '100%', md: '48%', lg: '32%' }, mb: 2 }}>
          <CardContent>
            <Typography variant="h6">アクション</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              管理用の操作ボタンを配置できます。
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              エクスポート
            </Button>
          </CardContent>
        </Card> */}

      </Stack>
    </Box>
  );
};

export default Admin;
