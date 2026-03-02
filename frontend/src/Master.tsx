import RestoreIcon from '@mui/icons-material/Restore';

import React, { useEffect, useState } from "react";
import { MaterialReactTable, useMaterialReactTable, MRT_ColumnDef } from "material-react-table";
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
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

type MasterType = "mstrole" | "mstcategory";

const masterOptions: { value: MasterType; label: string }[] = [
  { value: "mstrole", label: "役職マスタ" },
  { value: "mstcategory", label: "カテゴリマスタ" },
];
// 新規追加ダイアログの項目（フィールド）をマスタごとに定義
const masterFormFields: Record<MasterType, { key: string; label: string; type?: string; required?: boolean }[]> = {
  mstrole: [
    { key: "id", label: "ID", type: "number", required: true },
    { key: "name", label: "名前", required: true },
  ],
  mstcategory: [
    { key: "id", label: "ID", type: "number", required: true },
    { key: "name", label: "カテゴリ名", required: true },
  ],
};


function getMasterColumns(
  handleOpenEditDialog: (row: any) => void,
  handleDeleteMaster: (id: number) => void,
  handleRestoreMaster: (id: number) => void
): Record<MasterType, MRT_ColumnDef<any>[]> {
  return {
    mstrole: [
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
              onClick={() => handleDeleteMaster(row.original.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
            {row.original.deletedAt && (
              <IconButton
                size="small"
                onClick={() => handleRestoreMaster(row.original.id)}
                color="success"
              >
                <RestoreIcon />
              </IconButton>
            )}
          </Box>
        ),
      },
      { accessorKey: "id", header: "ID", size: 50 },
      { accessorKey: "name", header: "役職" },
      { accessorKey: "createdAt", header: "作成日時" , Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleString()},
      { accessorKey: "updatedAt", header: "更新日時" , Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleString()},
      { accessorKey: "deletedAt", header: "削除日時" , Cell: ({ cell }) => cell.getValue() ? new Date(cell.getValue() as string).toLocaleString() : ""},
    ],
    mstcategory: [
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
              onClick={() => handleDeleteMaster(row.original.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
            {row.original.deletedAt && (
              <IconButton
                size="small"
                onClick={() => handleRestoreMaster(row.original.id)}
                color="success"
              >
                <RestoreIcon />
              </IconButton>
            )}
          </Box>
        ),
      },
      { accessorKey: "id", header: "ID", size: 50 },
      { accessorKey: "name", header: "カテゴリ名" },
      { accessorKey: "createdAt", header: "作成日時" , Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleString()},
      { accessorKey: "updatedAt", header: "更新日時" , Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleString()},
      { accessorKey: "deletedAt", header: "削除日時" , Cell: ({ cell }) => cell.getValue() ? new Date(cell.getValue() as string).toLocaleString() : ""},
    ],
  };
}

const masterApi: Record<MasterType, string> = {
  mstrole: "/api/mstrole",
  mstcategory: "/api/mstcategory",
};

// 削除用エンドポイント（論理削除はPUT、物理削除はDELETE）
const masterDeleteApi: Record<MasterType, { url: (id: number) => string; method: "PUT" | "DELETE"; credentials?: "include" }> = {
  mstrole: { url: (id) => `/api/mstrole/delete/${id}`, method: "PUT", credentials: "include" },
  mstcategory: { url: (id) => `/api/mstcategory/delete/${id}`, method: "PUT", credentials: "include" },
};
// 編集（更新）用エンドポイントとHTTPメソッド
const masterEditApi: Record<MasterType, { url: (id: number) => string; method: "PUT" | "POST"; credentials?: "include" }> = {
  mstrole: { url: (id) => `/api/mstrole/${id}`, method: "PUT", credentials: "include" },
  mstcategory: { url: (id) => `/api/mstcategory/${id}`, method: "PUT", credentials: "include" },
};

const Master: React.FC = () => {
  const [selectedMaster, setSelectedMaster] = useState<MasterType>("mstrole");
  const [data, setData] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8081${masterApi[selectedMaster]}`, {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        setData(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setData([]);
      });
  }, [selectedMaster]);

  const handleOpenEditDialog = (row: any) => {
    setIsEditing(true);
    setFormData(row);
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const handleDeleteMaster = async (id: number) => {
    if (!window.confirm("このデータを削除しますか？")) return;
    try {
      const { url, method } = masterDeleteApi[selectedMaster];
      const endpoint = `http://localhost:8081${url(id)}`;
      const res = await fetch(endpoint, {
        method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("削除に失敗しました");
      // 削除後にテーブルを再取得して最新状態にする
      fetch(`http://localhost:8081${masterApi[selectedMaster]}`, {
        credentials: "include"
      })
        .then((res) => res.json())
        .then((data) => {
          setData(Array.isArray(data) ? data : []);
        });
    } catch (err) {
      alert("削除に失敗しました");
    }
  };

  // バリデーション関数
const validateForm = (master: MasterType, formData: any): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  masterFormFields[master].forEach(field => {
    if (field.required) {
      if (!formData[field.key] || String(formData[field.key]).trim() === "") {
        errors[field.key] = `${field.label}は必須です`;
      }
    }
    // 役職名（mstrole.name）の100文字制限
    if (master === "mstrole" && field.key === "name" && formData[field.key]) {
      if (String(formData[field.key]).length > 100) {
        errors[field.key] = "役職は100文字以内で入力してください";
      }
    }
    // カテゴリ名（mstcategory.name）の100文字制限
    if (master === "mstcategory" && field.key === "name" && formData[field.key]) {
      if (String(formData[field.key]).length > 100) {
        errors[field.key] = "カテゴリ名は100文字以内で入力してください";
      }
    }
    if (field.type === "email" && formData[field.key]) {
      const emailRegex = /^[\w\-.]+@[\w\-]+\.[\w\-.]+$/;
      if (!emailRegex.test(formData[field.key])) {
        errors[field.key] = "メールの形式が不正です";
      }
    }
    if (field.type === "number" && formData[field.key] !== undefined && formData[field.key] !== "") {
      const num = Number(formData[field.key]);
      if (isNaN(num)) {
        errors[field.key] = `${field.label}は数値で入力してください`;
      } else {
        // 正の整数の範囲チェック（1～2147483647）
        if (field.key === "id" && (!Number.isInteger(num) || num < 1 || num > 2147483647)) {
          errors[field.key] = "IDは正の整数（1～2147483647）で入力してください";
        }
      }
    }
    if (field.type === "password" && formData[field.key] && String(formData[field.key]).length < 6) {
      errors[field.key] = "パスワードは6文字以上必須です";
    }
  });
  return errors;
};



  // 追加（新規作成）用エンドポイントとHTTPメソッド
const masterCreateApi: Record<MasterType, { url: string; method: "POST" }> = {
  mstrole: { url: "/api/mstrole", method: "POST" },
  mstcategory: { url: "/api/mstcategory", method: "POST" },
};
  // 新規追加ダイアログを開く
  const handleOpenCreateDialog = () => {
    setIsEditing(false);
    setFormData({});
    setSelectedRow(null);
    setOpenDialog(true);
  };

  // 追加・保存処理
  const [formErrors, setFormErrors] = React.useState<{ [key: string]: string }>({});

  const handleCreate = async () => {
    const errors = validateForm(selectedMaster, formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const { url, method } = masterCreateApi[selectedMaster];
      const endpoint = `http://localhost:8081${url}`;
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: "include"
      });
      if (!res.ok) throw new Error('追加に失敗しました');
      // 成功時は再取得
      fetch(`http://localhost:8081${masterApi[selectedMaster]}`, {
        credentials: "include"
      })
        .then((res) => res.json())
        .then((data) => {
          setData(Array.isArray(data) ? data : []);
        });
      handleCloseDialog();
      setFormErrors({});
    } catch (err) {
      alert('追加に失敗しました');
    }
  };


  // ダイアログを閉じる処理
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setFormData({});
    setSelectedRow(null);
    setFormErrors({});
  };

  // 編集・保存処理
  const handleSave = async () => {
    if (!isEditing || !formData.id) {
      handleCloseDialog();
      return;
    }
    const errors = validateForm(selectedMaster, formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const { url, method } = masterEditApi[selectedMaster];
      const endpoint = `http://localhost:8081${url(formData.id)}`;
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: "include"
      });
      if (!res.ok) throw new Error('更新に失敗しました');
      // 成功時は再取得
      fetch(`http://localhost:8081${masterApi[selectedMaster]}`, {
        credentials: "include"
      })
        .then((res) => res.json())
        .then((data) => {
          setData(Array.isArray(data) ? data : []);
        });
      handleCloseDialog();
      setFormErrors({});
    } catch (err) {
      alert('更新に失敗しました');
    }
  };
  
// 復活用エンドポイントとHTTPメソッド
const masterRestoreApi: Record<MasterType, { url: (id: number) => string; method: "PUT" }> = {
  mstrole: { url: (id) => `/api/mstrole/restore/${id}`, method: "PUT" },
  mstcategory: { url: (id) => `/api/mstcategory/restore/${id}`, method: "PUT" },
};
  // 復活処理
  const handleRestoreMaster = async (id: number) => {
    try {
      const { url, method } = masterRestoreApi[selectedMaster];
      const endpoint = `http://localhost:8081${url(id)}`;
      const res = await fetch(endpoint, {
        method,
        credentials: "include"
      });
      if (!res.ok) throw new Error('復活に失敗しました');
      // 復活後は再取得
      fetch(`http://localhost:8081${masterApi[selectedMaster]}`, {
        credentials: "include"
      })
        .then((res) => res.json())
        .then((data) => {
          setData(Array.isArray(data) ? data : []);
        });
    } catch (err) {
      alert('復活に失敗しました');
    }
  };


  const columns = React.useMemo(() => getMasterColumns(handleOpenEditDialog, handleDeleteMaster, handleRestoreMaster)[selectedMaster], [selectedMaster, handleOpenEditDialog, handleDeleteMaster, handleRestoreMaster]);

  // 追加ボタン
  const AddButton = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={handleOpenCreateDialog}
      sx={{ mb: 2 }}
    >
      新規追加
    </Button>
  );
  const table = useMaterialReactTable({
    columns,
    data,
  });

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <FormControl variant="outlined" size="small" style={{ minWidth: 200, background: '#fff', margin: '16px' }}>
          <InputLabel id="master-select-label" shrink>マスタ選択</InputLabel>
          <Select
            labelId="master-select-label"
            value={selectedMaster}
            label="マスタ選択"
            onChange={e => setSelectedMaster(e.target.value as MasterType)}
          >
            {masterOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {AddButton}
      </div>
      <MaterialReactTable table={table} />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? "編集" : "新規追加"}</DialogTitle>
        <DialogContent>
          <form
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                isEditing ? handleSave() : handleCreate();
              }
            }}
          >
          {masterFormFields[selectedMaster].map(field => (
            <TextField
              key={field.key}
              label={field.label}
              type={field.type || "text"}
              value={formData[field.key] ?? ""}
              onChange={e =>
                setFormData((prev: any) => ({ ...prev, [field.key]: e.target.value }))
              }
              fullWidth
              margin="normal"
              required={field.required}
              error={!!formErrors[field.key]}
              helperText={formErrors[field.key]}
            />
          ))}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          {isEditing ? (
            <Button variant="contained" onClick={handleSave}>保存</Button>
          ) : (
            <Button variant="contained" onClick={handleCreate}>追加</Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Master;
