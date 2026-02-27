
import DownloadIcon from '@mui/icons-material/Download';
import * as FileSaver from 'file-saver';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { MRT_Localization_JA } from 'material-react-table/locales/ja';
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
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { fetchAddressByPostalCode } from "./postalUtil";
import { formatDateTime } from "./dateUtil";

type Address = {
  id: number;
  name: string;
  phoneNumber: string;
  address: string;
  age: number;
  sex: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category?: number;
  role?: number;
};

type AddressFormData = Omit<Address, "id" | "createdAt" | "updatedAt" | "deletedAt"> & { role?: number; category?: number };

// カテゴリ型
type MstCategory = { id: number; name: string; deletedAt?: string | null };


const Table: React.FC = () => {
  // CSV出力処理
  const handleExportCSV = () => {
    const csvRows = [];
    // ヘッダー
    csvRows.push(['ID', '名前', '住所', '電話番号', '年齢', '性別', 'カテゴリ', '役職', '作成日時', '更新日時']);
    // データ
    data.forEach(row => {
      // カテゴリ名取得
      const categoryObj = mstcategories.find(c => c.id === row.category);
      const categoryName = categoryObj ? categoryObj.name : row.category;
      // 役職名取得
      const roleObj = mstroles.find(r => r.id === row.role);
      const roleName = roleObj ? roleObj.name : row.role;
      // 性別の日本語変換
      let sexJp = row.sex;
      if (row.sex === "male") sexJp = "男性";
      else if (row.sex === "female") sexJp = "女性";
      else if (row.sex === "other") sexJp = "その他";
      csvRows.push([
        row.id,
        row.name,
        row.address,
        row.phoneNumber,
        row.age,
        sexJp,
        categoryName,
        roleName,
        formatDateTime(row.createdAt),
        formatDateTime(row.updatedAt)
      ]);
    });
    const csvContent = csvRows.map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(blob, '住所一覧.csv');
  };
  const [data, setData] = useState<Address[]>([]);

  const navigate = useNavigate();
  // テーブル行クリック時の処理
  const handleRowClick = (row: Address) => {
    navigate("/address/addressinfo", { state: row });
  };

  // アクションボタン用: クリック時に行クリックの伝播を止める
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


  const [formData, setFormData] = useState<AddressFormData>({
    name: "",
    phoneNumber: "",
    address: "",
    age: 0,
    sex: "",
    category: undefined,
  });
  // バリデーションエラー状態
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    phoneNumber?: string;
    address?: string;
    age?: string;
    sex?: string;
    role?: string;
    category?: string;
  }>({});
  const [postalCode, setPostalCode] = useState("");
  const [postalLoading, setPostalLoading] = useState(false);
  const [postalError, setPostalError] = useState<string | null>(null);


  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // カテゴリ（mstcategory）一覧を取得
  const [mstcategories, setMstcategories] = useState<MstCategory[]>([]);
  useEffect(() => {
    fetch("http://localhost:8081/api/mstcategory")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMstcategories(data);
      });
  }, []);

  // useEffect(() => {
  //   fetch("http://localhost:8081/address")
  //     .then((res) => res.json())
  //     .then((data) => setData(data));
  // }, []);


  // ユーザー一覧を取得
  const fetchAddresses = async () => {
    try {
      const response = await fetch("http://localhost:8081/address");
      const userData = await response.json();
      setData(userData);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // 役割（mstrole）一覧を取得
  const [mstroles, setMstroles] = useState<{ id: number; name: string; deletedAt?: string | null }[]>([]);
  useEffect(() => {
    fetch("http://localhost:8081/api/mstrole")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMstroles(data);
      });
  }, []);

  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setFormData({ name: "", phoneNumber: "", address: "", age: 0, sex: "", category: undefined });
    setPostalCode("");
    setPostalError(null);
    setPostalLoading(false);
    setSelectedAddress(null);
    setFormErrors({});
  };

  // 新規作成ダイアログを開く
  const handleOpenCreateDialog = () => {
    setIsEditing(false);
    setFormData({ name: "", phoneNumber: "", address: "", age: 0, sex: "", category: undefined });
    setPostalCode("");
    setPostalError(null);
    setPostalLoading(false);
    setSelectedAddress(null);
    setOpenDialog(true);
  };

  // 編集ダイアログを開く
  const handleOpenEditDialog = (address: Address) => {
    setIsEditing(true);
    setFormData({
      name: address.name,
      phoneNumber: address.phoneNumber,
      address: address.address,
      age: address.age,
      sex: address.sex,
      category: (address as any).category ?? undefined,
      role: (address as any).role ?? undefined,
    });
    setPostalCode("");
    setPostalError(null);
    setPostalLoading(false);
    setSelectedAddress(address);
    setOpenDialog(true);
  };

  // フォームデータの変更を処理
  const handleFormChange = (field: keyof AddressFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 入力変更時にエラーをクリア
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // 郵便番号入力時の自動住所取得
  const handlePostalCodeChange = async (value: string) => {
    setPostalCode(value);
    setPostalError(null);
    if (value.length === 7 && /^[0-9]{7}$/.test(value)) {
      setPostalLoading(true);
      const address = await fetchAddressByPostalCode(value);
      setPostalLoading(false);
      if (address) {
        setFormData((prev) => ({ ...prev, address }));
      } else {
        setPostalError("該当する住所が見つかりませんでした");
      }
    }
  };

  // バリデーション関数
  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    if (!formData.name || formData.name.trim() === "") {
      errors.name = "名前は必須です";
      } else if (formData.name.length > 255) {
        errors.name = "名前は255文字以内で入力してください";
    }
    if (!formData.phoneNumber || formData.phoneNumber.trim() === "") {
      errors.phoneNumber = "電話番号は必須です";
    // 電話番号が0から始まり、9～10桁の数字であるかチェック
    } else if (!/^0\d{9,10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "正しい電話番号を入力してください";
    }
    if (!formData.address || formData.address.trim() === "") {
      errors.address = "住所は必須です";
      } else if (formData.address.length > 255) {
        errors.address = "住所は255文字以内で入力してください";
    }
    // 年齢のバリデーション（number型のみ）
    if (formData.age === undefined || formData.age === null || isNaN(formData.age)) {
      errors.age = "年齢は必須です";
    } else if (formData.age < 0 || formData.age > 120) {
      errors.age = "0～120の数値で入力してください";
    }
    if (!formData.sex) {
      errors.sex = "性別は必須です";
    }
    // カテゴリのバリデーション
    if (
      formData.category === undefined ||
      formData.category === null ||
      (typeof formData.category === 'string' && formData.category === "")
    ) {
      errors.category = "カテゴリは必須です";
    }
    // 役割のバリデーション（ドロップダウン未選択のみエラー）
    if (
      formData.role === undefined ||
      formData.role === null ||
      (typeof formData.role === 'string' && formData.role === "")
    ) {
      errors.role = "役職は必須です";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ユーザーを保存（新規作成または更新）
  const handleSaveAddress = async () => {
    if (!validateForm()) {
      // エラー内容をまとめてalert表示
      const errorMsgs = Object.values(formErrors).filter(Boolean).join('\n');
      alert(errorMsgs || "入力内容に誤りがあります");
      return;
    }
    try {
      const userId = localStorage.getItem('userId') || '';
      const url = isEditing
        ? `http://localhost:8081/address/${selectedAddress?.id}`
        : "http://localhost:8081/address";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchAddresses(); // 住所リストを再取得
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save address:", err);
      alert("住所の保存に失敗しました");
    }
  };

  // 住所を削除
  const handleDeleteAddress = async (addressId: number) => {
    if (!window.confirm("この住所を削除しますか？")) {
      return;
    }

    // try {
    //   const response = await fetch(`http://localhost:8081/address/${addressId}`, {
    //     method: "DELETE",
    //   });

    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }

    //   await fetchAddresses();
    // } catch (err) {
    //   console.error("Failed to delete address:", err);
    //   alert("住所の削除に失敗しました");
    // }

    try {
      const userId = localStorage.getItem('userId') || '';
      const response = await fetch(`http://localhost:8081/address/delete/${addressId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchAddresses(); // 住所リストを再取得
    } catch (err) {
      console.error("Failed to delete address:", err);
      alert("住所の削除に失敗しました");
    }
  };

  // roleId→roleNameのマッピングを作成
  const roleIdNameMap = React.useMemo(() => {
    const map = new Map<number, string>();
    mstroles.forEach(r => {
      map.set(r.id, r.name);
    });
    return map;
  }, [mstroles]);

  // sex値→日本語名のマッピング
  const sexMap = {
    male: '男性',
    female: '女性',
    other: 'その他',
  } as const;

  // categoryId→categoryNameのマッピング
  const categoryIdNameMap = React.useMemo(() => {
    const map = new Map<number, string>();
    mstcategories.forEach(c => {
      map.set(c.id, c.name);
    });
    return map;
  }, [mstcategories]);

  const columns: MRT_ColumnDef<Address>[] = [
    {
      accessorKey: "actions",
      header: "操作",
      size: 100,
      Cell: ({ row }: { row: any }) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={e => { stopPropagation(e); handleOpenEditDialog(row.original); }}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={e => { stopPropagation(e); handleDeleteAddress(row.original.id); }}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
    { accessorKey: "id", header: "ID" , size: 50},
    { accessorKey: "name", header: "名前" },
    { accessorKey: "address", header: "住所" },
    { accessorKey: "phoneNumber", header: "電話番号" },
    { accessorKey: "age", header: "年齢", Cell: ({ cell }) => {
      const age = cell.getValue<number>();
      return <span style={{ display: 'block', textAlign: 'center' }}>{age}歳</span>;
    } },
    {
      accessorKey: "sex",
      header: "性別",
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return sexMap[value as keyof typeof sexMap] || value;
      },
      filterFn: (row, id, filterValue) => {
        const sexValue = row.getValue<string>(id);
        const sexJp = sexMap[sexValue as keyof typeof sexMap] || '';
        if (!filterValue) return true;
        return sexJp.includes(String(filterValue));
      },
      filterVariant: 'text',
    },
    {
      accessorKey: "category",
      header: "カテゴリ",
      Cell: ({ cell }) => {
        const categoryId = cell.getValue<number>();
        const categoryName = categoryIdNameMap.get(categoryId);
        return categoryName || categoryId;
      },
      filterFn: (row, id, filterValue) => {
        const categoryId = row.getValue<number>(id);
        const categoryName = categoryIdNameMap.get(categoryId) || '';
        if (!filterValue) return true;
        return categoryName.includes(String(filterValue));
      },
      filterVariant: 'text',
    },
    {
      accessorKey: "role",
      header: "役職",
      Cell: ({ cell }) => {
        const roleId = cell.getValue<number>();
        const role = mstroles.find(r => r.id === roleId);
        return role ? role.name : roleId;
      },
      filterFn: (row, id, filterValue) => {
        const roleId = row.getValue<number>(id);
        const roleName = roleIdNameMap.get(roleId) || '';
        if (!filterValue) return true;
        // 部分一致・大文字小文字区別なし
        return roleName.toLowerCase().includes(String(filterValue).toLowerCase());
      },
      filterVariant: 'text',
    },
    { accessorKey: "createdAt", header: "作成日時", Cell: ({ cell }) => formatDateTime(cell.getValue<string>()) },
    { accessorKey: "updatedAt", header: "更新日時", Cell: ({ cell }) => formatDateTime(cell.getValue<string>()) },

  ];

  const table = useMaterialReactTable({
    columns,
    data,
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => handleRowClick(row.original),
      style: { cursor: "pointer" },
    }),
    localization: MRT_Localization_JA,
  });

  return (
    <>
      <Box sx={{ mb: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          新規住所追加
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            sx={{ ml: 2 }}
            startIcon={<RefreshIcon />}
            onClick={fetchAddresses}
          >
            再読み込み
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
          >
            CSV出力
          </Button>
        </Box>
      </Box>

      <MaterialReactTable table={table} />
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? "住所を編集" : "新規住所を追加"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <form
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveAddress();
              }
            }}
          >
          <TextField
            autoFocus
            label="名前"
            value={formData.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            fullWidth
            margin="normal"
            error={!!formErrors.name}
            helperText={formErrors.name}
          />
          <TextField
            label="郵便番号（7桁）"
            value={postalCode}
            onChange={(e) => handlePostalCodeChange(e.target.value.replace(/[^0-9]/g, ""))}
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 7 }}
            helperText={postalError ? postalError : "入力で自動住所取得"}
            error={!!postalError}
            disabled={postalLoading}
          />
          <TextField
            label="住所名"
            value={formData.address}
            onChange={(e) => handleFormChange("address", e.target.value)}
            fullWidth
            margin="normal"
            error={!!formErrors.address}
            helperText={formErrors.address}
          />
          <TextField
            label="電話番号"
            value={formData.phoneNumber}
            onChange={(e) => handleFormChange("phoneNumber", e.target.value)}
            fullWidth
            margin="normal"
            error={!!formErrors.phoneNumber}
            helperText={formErrors.phoneNumber}
          />
          <TextField
            label="年齢"
            type="number"
            value={formData.age}
            onChange={(e) => {
              const val = e.target.value;
              handleFormChange("age", val === "" ? "" : Number(val));
            }}
            fullWidth
            margin="normal"
            error={!!formErrors.age}
            helperText={formErrors.age}
            inputProps={{ min: 0, max: 120 }}
          />
          <FormControl fullWidth margin="normal" error={!!formErrors.sex}>
            <InputLabel>性別</InputLabel>
            <Select
              value={formData.sex ?? ""}
              label="性別"
              onChange={(e) => handleFormChange("sex", e.target.value)}
              displayEmpty
            >
              <MenuItem value="male">男性</MenuItem>
              <MenuItem value="female">女性</MenuItem>
              <MenuItem value="other">その他</MenuItem>
            </Select>
            {formErrors.sex && (
              <Box sx={{ color: 'error.main', fontSize: 12, mt: 0.5 }}>{formErrors.sex}</Box>
            )}
          </FormControl>
          </form>

          <FormControl fullWidth margin="normal" error={!!formErrors.category}>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={formData.category ?? ""}
              label="カテゴリ"
              onChange={(e) => handleFormChange("category", Number(e.target.value))}
            >
              {mstcategories.filter(cat => !cat.deletedAt).map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
            {formErrors.category && (
              <Box sx={{ color: 'error.main', fontSize: 12, mt: 0.5 }}>{formErrors.category}</Box>
            )}
          </FormControl>
          <FormControl fullWidth margin="normal" error={!!formErrors.role}>
            <InputLabel>役職</InputLabel>
            <Select
              value={formData.role ?? ""}
              label="役職"
              onChange={(e) => handleFormChange("role", Number(e.target.value))}
            >
              {mstroles.filter(role => !role.deletedAt).map(role => (
                <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
              ))}
            </Select>
            {formErrors.role && (
              <Box sx={{ color: 'error.main', fontSize: 12, mt: 0.5 }}>{formErrors.role}</Box>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleSaveAddress} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Table;