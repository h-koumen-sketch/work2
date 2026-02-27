import React from "react";
import { Card, CardContent, Typography, Table, TableBody, TableRow, TableCell, Box } from "@mui/material";

const AvatarInfo: React.FC = () => {
  // ログインユーザー情報をlocalStorageから取得
  const userId = localStorage.getItem("userId") || "";
  const userEmail = localStorage.getItem("userEmail") || "";
  const role = localStorage.getItem("role") || "";

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Card sx={{ minWidth: 350, maxWidth: 500 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>プロフィール</Typography>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>メールアドレス</TableCell>
                <TableCell>{userEmail}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>権限</TableCell>
                <TableCell>{role}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AvatarInfo;
