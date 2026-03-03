import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

const SessionExpiredMessage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Paper elevation={3} sx={{ p: 4, textAlign: "center", maxWidth: 400 }}>
      <Typography variant="h5" gutterBottom color="error">
        セッションが切れました
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        セッションの有効期限が切れました。再度ログインしてください。
      </Typography>
      <Button variant="contained" color="primary" onClick={onLogin}>
        ログイン画面へ
      </Button>
    </Paper>
  </Box>
);

export default SessionExpiredMessage;