import { formatDateTime } from "./dateUtil";
import React, { useEffect, useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import type { MRT_Cell } from "material-react-table";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Refresh as RefreshIcon, Restore as RestoreIcon } from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import SessionExpiredMessage from "./SessionExpiredMessage";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

type UserFormData = Omit<User, "id" | "createdAt" | "updatedAt" | "deletedAt"> & {
  passwordHash?: string;
};

const UserTable: React.FC = () => {
    const [sessionExpired, setSessionExpired] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "user",
    passwordHash: "",
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();

  // ユーザー一覧を取得
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8081/users", {
        credentials: "include"
      });
      if (!response.ok) {
        setSessionExpired(true);
        return;
      }
      const userData = await response.json();
      setData(userData);
    } catch (err) {
      setSessionExpired(true);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
    // --- useEffectの後ろに移動 ---
  // ユーザー復活処理
  const handleRestoreUser = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:8081/users/restore/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      if (!response.ok) {
        setSessionExpired(true);
        return;
      }
      await fetchUsers();
    } catch (err) {
      setSessionExpired(true);
    }
  };

  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setFormData({ name: "", email: "", role: "user", passwordHash: "" });
    setSelectedUser(null);
    setFormErrors({});
  };

  // 新規作成ダイアログを開く
  const handleOpenCreateDialog = () => {
    setIsEditing(false);
    setFormData({ name: "", email: "", role: "user", passwordHash: "" });
    setSelectedUser(null);
    setOpenDialog(true);
  };

  // 編集ダイアログを開く
  const handleOpenEditDialog = (user: User) => {
    setIsEditing(true);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setSelectedUser(user);
    setOpenDialog(true);
  };

  // フォームデータの変更を処理
  const handleFormChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // バリデーション
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.name || formData.name.trim() === "") {
      errors.name = "ユーザー名は必須です";
    } else if (formData.name.length > 100) {
      errors.name = "ユーザー名は100文字以内で入力してください";
    }
    if (!formData.email || formData.email.trim() === "") {
      errors.email = "メールアドレスは必須です";
    } else if (!/^[\w\-.]+@[\w\-]+\.[\w\-.]+$/.test(formData.email)) {
      errors.email = "メールアドレスの形式が不正です";
    } else if (formData.email.length > 255) {
      errors.email = "メールアドレスは255文字以内で入力してください";
    }
    if (!isEditing && (!formData.passwordHash || formData.passwordHash.length < 6)) {
      errors.passwordHash = "パスワードは6文字以上必須です";
    }
    if (!formData.role || formData.role.trim() === "") {
      errors.role = "権限は必須です";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ユーザーを保存（新規作成または更新）
  const handleSaveUser = async () => {
    if (!validateForm()) return;
    try {
      const url = isEditing
        ? `http://localhost:8081/users/${selectedUser?.id}`
        : "http://localhost:8081/users";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
        credentials: "include"
      });

      if (!response.ok) {
        setSessionExpired(true);
        return;
      }

      await fetchUsers();
      handleCloseDialog();
    } catch (err) {
      setSessionExpired(true);
    }
  };

  // ユーザーを削除
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("このユーザーを削除しますか？")) {
      return;
    }

    try {

      const response = await fetch(`http://localhost:8081/users/delete/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({})
      });

      if (!response.ok) {
        setSessionExpired(true);
        return;
      }

      await fetchUsers();
    } catch (err) {
      setSessionExpired(true);
    }
  };

  const columns: MRT_ColumnDef<User>[] = [
    {
      accessorKey: "actions",
      header: "操作",
      size: 100,
      Cell: ({ row }: { row: any }) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleOpenEditDialog(row.original)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteUser(row.original.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
          {row.original.deletedAt && (
            <IconButton
              size="small"
              onClick={() => handleRestoreUser(row.original.id)}
              color="success"
            >
              <RestoreIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
    { accessorKey: "id", header: "ID" , size: 50 },
    { accessorKey: "name", header: "ユーザー名" },
    { accessorKey: "email", header: "メールアドレス" },
    { accessorKey: "role", header: "権限" },
    { accessorKey: "createdAt", header: "作成日時",  Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleString() },
    { accessorKey: "updatedAt", header: "更新日時", Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleString() },
    { accessorKey: "deletedAt", header: "削除日時", Cell: ({ cell }) => cell.getValue() ? new Date(cell.getValue() as string).toLocaleString() : "" },
    
  ];

  return (
    <>
      {sessionExpired ? (
        <SessionExpiredMessage onLogin={() => window.location.href = "/"} />
      ) : (
        <>
          <Box sx={{ mb: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              新規ユーザー追加
            </Button>
            <Button
              variant="outlined"
              sx={{ ml: 2 }}
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
            >
              再読み込み
            </Button>
          </Box>

          <MaterialReactTable columns={columns} data={data} />

          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              {isEditing ? "ユーザーを編集" : "新規ユーザーを追加"}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <form
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveUser();
                  }
                }}
              >

              <TextField
                autoFocus
                label="ユーザー名"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                fullWidth
                margin="normal"
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
              <TextField
                label="メールアドレス"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                fullWidth
                margin="normal"
                disabled={isEditing}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              {!isEditing && (
                <TextField
                  label="パスワード"
                  type="password"
                  value={formData.passwordHash || ""}
                  onChange={(e) => handleFormChange("passwordHash", e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!formErrors.passwordHash}
                  helperText={formErrors.passwordHash}
                />
              )}

              </form>
              <FormControl fullWidth margin="normal" error={!!formErrors.role}>
                <InputLabel>権限</InputLabel>
                <Select
                  value={formData.role}
                  label="権限"
                  onChange={(e) => handleFormChange("role", e.target.value)}
                >
                  <MenuItem value="user">一般ユーザー</MenuItem>
                  <MenuItem value="admin">管理者</MenuItem>
                  <MenuItem value="super_admin">スーパー管理者</MenuItem>
                </Select>
                {formErrors.role && <Typography color="error" variant="caption">{formErrors.role}</Typography>}
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>キャンセル</Button>
              <Button onClick={handleSaveUser} variant="contained">
                保存
              </Button>
            </DialogActions>
          </Dialog>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mt: 2, mr: 2 }}>
            <Button variant="contained" onClick={() => navigate('/admin')}> 戻る </Button>
          </Box>
        </>
      )}
    </>
  );
};

export default UserTable;
