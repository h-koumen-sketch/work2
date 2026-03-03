import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import { ThemeContext } from "./ThemeContext";

const externalApps = [
  {
    name: "GitHub",
    url: "https://github.com/",
    icon: <GitHubIcon fontSize="large" />,
    description: "GitHubでソース管理やリポジトリを確認できます。"
  },
  {
    name: "Outlook",
    url: "https://outlook.office.com/",
    icon: <EmailIcon fontSize="large" />,
    description: "Outlookでメールや予定表を確認できます。"
  },
  // 必要に応じて他の外部アプリを追加
];

const ExternalAppDashboard: React.FC = () => {
  const ctx = React.useContext(ThemeContext);
  const bgColor = ctx?.bgColor ?? '#f5f7fb';

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: bgColor, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        外部アプリダッシュボード
      </Typography>
      <Stack direction="row" gap={2} flexWrap="wrap">
        {externalApps.map(app => (
          <Card key={app.name} sx={{ bgcolor: '#fff', width: { xs: '100%', md: '48%', lg: '32%' }, mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                {app.icon}
                <Typography variant="h6">{app.name}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{app.description}</Typography>
              <Button
                variant="contained"
                color="primary"
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                fullWidth
              >
                起動する
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default ExternalAppDashboard;
