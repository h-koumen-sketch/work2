import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import * as FileSaver from 'file-saver';
import { Alert, CircularProgress, OutlinedInput } from '@mui/material';
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
import SessionExpiredMessage from "./SessionExpiredMessage";

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
  // インポートバリデーション
  // 英語・日本語カラム対応マッピング
  const columnMap: Record<string, string> = {
    name: "name", 名前: "name",
    phoneNumber: "phoneNumber", 電話番号: "phoneNumber",
    address: "address", 住所: "address",
    age: "age", 年齢: "age",
    sex: "sex", 性別: "sex",
    category: "category", カテゴリ: "category",
    role: "role", 役職: "role"
  };
  const allowedKeys = Object.keys(columnMap);
  const requiredKeys = ["name", "phoneNumber", "address", "age", "sex", "category", "role"];

  // 入力行を英語カラムに変換
  const normalizeRow = (row: any) => {
    const norm: any = {};
    Object.keys(row).forEach(k => {
      if (columnMap[k]) norm[columnMap[k]] = row[k];
    });
    return norm;
  };

  // 追加・編集ダイアログと同じバリデーションを流用
  const validateImportRow = (row: any) => {
    const errors: Record<string, string> = {};
    // 不要な列チェック
    const extraKeys = Object.keys(row).filter(k => !allowedKeys.includes(k));
    if (extraKeys.length > 0) {
      requiredKeys.forEach(key => {
        errors[key] = `不要な列(${extraKeys.join(",")})が含まれています`;
      });
      extraKeys.forEach(key => {
        errors[key] = `不要な列(${key})です`;
      });
      return errors;
    }
    // 英語カラムに変換
    const norm = normalizeRow(row);
    // 空行判定: 全項目が空・null・undefined
    const isEmptyRow = requiredKeys.every(key => {
      const v = norm[key];
      if (v === undefined || v === null) return true;
      if (typeof v === "string") {
        if (v.trim() === "") return true;
        return false;
      }
      if (key === "age") {
        if (v === "" || isNaN(Number(v))) return true;
        return false;
      }
      return false;
    });
    // name
    if (!norm.name || String(norm.name).trim() === "") errors.name = "名前は必須です";
    else if (String(norm.name).length > 255) errors.name = "名前は255文字以内で入力してください";
    // phoneNumber
    if (!norm.phoneNumber || String(norm.phoneNumber).trim() === "") errors.phoneNumber = "電話番号は必須です";
    else if (!/^0\d{9,10}$/.test(String(norm.phoneNumber))) errors.phoneNumber = "正しい電話番号を入力してください";
    // address
    if (!norm.address || String(norm.address).trim() === "") errors.address = "住所は必須です";
    else if (String(norm.address).length > 255) errors.address = "住所は255文字以内で入力してください";
    // age
    if (
      norm.age === undefined ||
      norm.age === null ||
      (typeof norm.age === 'string' && norm.age.trim() === '') ||
      isNaN(Number(norm.age)) ||
      !/^\d+$/.test(String(norm.age))
    ) {
      errors.age = "年齢は必須です（0～120の半角数字のみ）";
    } else if (Number(norm.age) < 0 || Number(norm.age) > 120) {
      errors.age = "0～120の数値で入力してください";
    }
    // sex
    if (!norm.sex) {
      errors.sex = "性別は必須です";
    } else {
      // 厳密一致（例：女性1などはNG）
      const validSex = ["male", "female", "other", "男性", "女性", "その他"];
      if (!validSex.some(s => String(norm.sex).trim() === s)) {
        errors.sex = "性別は男性・女性・その他のみ指定可能です";
      }
    }
    // category（マスタ比較）
    let categoryId: number | undefined = undefined;
    if (
      norm.category === undefined ||
      norm.category === null ||
      norm.category === ''
    ) {
      errors.category = "カテゴリは必須です";
    } else {
      // 必須エラーがなければマスタ存在チェック
      if (!errors.category) {
        if (typeof norm.category === 'number') {
          const found = mstcategories.find(c => c.id === norm.category && !c.deletedAt);
          if (!found) errors.category = "カテゴリがマスタに存在しません";
          else categoryId = found.id;
        } else {
          const found = mstcategories.find(c => c.name === norm.category && !c.deletedAt);
          if (!found) errors.category = "カテゴリがマスタに存在しません";
          else categoryId = found.id;
        }
      }
    }
    // role（マスタ比較）
    let roleId: number | undefined = undefined;
    if (
      norm.role === undefined ||
      norm.role === null ||
      norm.role === ''
    ) {
      errors.role = "役職は必須です";
    } else {
      // 必須エラーがなければマスタ存在チェック
      if (!errors.role) {
        if (typeof norm.role === 'number') {
          const found = mstroles.find(r => r.id === norm.role && !r.deletedAt);
          if (!found) errors.role = "役職がマスタに存在しません";
          else roleId = found.id;
        } else {
          const found = mstroles.find(r => r.name === norm.role && !r.deletedAt);
          if (!found) errors.role = "役職がマスタに存在しません";
          else roleId = found.id;
        }
      }
    }
    if (isEmptyRow) {
      requiredKeys.forEach(key => {
        errors[key] = "空行です";
      });
    }
    return errors;
  };
  // インポートプレビュー用
  const [importPreview, setImportPreview] = useState<any[]>([]);
  // インポートダイアログ状態
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  // インポートダイアログを閉じるときにファイル・プレビュー・エラーもクリア
  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
    setImportFile(null);
    setImportPreview([]);
    setImportError(null);
  };
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
    fetch("http://localhost:8081/api/mstcategory", {
      credentials: "include"
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          setSessionExpired(true);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setMstcategories(data);
      });
  }, []);

  // useEffect(() => {
  //   fetch("http://localhost:8081/address")
  //     .then((res) => res.json())
  //     .then((data) => setData(data));
  // }, []);


  const [sessionExpired, setSessionExpired] = useState(false);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("http://localhost:8081/address", {
        credentials: "include"
      });
      if (response.status === 401 || response.status === 403) {
        setSessionExpired(true);
        return;
      }
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
    fetch("http://localhost:8081/api/mstrole", {
      credentials: "include"
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          setSessionExpired(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setMstroles(data);
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
      const url = isEditing
        ? `http://localhost:8081/address/${selectedAddress?.id}`
        : "http://localhost:8081/address";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
        credentials: "include"
      });

      if (response.status === 401 || response.status === 403) {
        setSessionExpired(true);
        return;
      }
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

    try {
      const response = await fetch(`http://localhost:8081/address/delete/${addressId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      if (response.status === 401 || response.status === 403) {
        setSessionExpired(true);
        return;
      }
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
    { accessorKey: "id", header: "ID", size: 50 },
    { accessorKey: "name", header: "名前" },
    { accessorKey: "address", header: "住所" },
    { accessorKey: "phoneNumber", header: "電話番号" },
    {
      accessorKey: "age", header: "年齢", Cell: ({ cell }) => {
        const age = cell.getValue<number>();
        return <span style={{ display: 'block', textAlign: 'center' }}>{age}歳</span>;
      }
    },
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
              新規住所追加
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => {
                  // マスタ未取得なら何もしない
                  if (mstcategories.length === 0 || mstroles.length === 0) return;
                  setImportDialogOpen(true);
                }}
                disabled={mstcategories.length === 0 || mstroles.length === 0}
              >
                インポート
              </Button>
              <Button
                variant="outlined"
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

          {/* インポートダイアログ */}
            <Dialog open={importDialogOpen} onClose={handleCloseImportDialog} maxWidth="xl" fullWidth>
            <DialogTitle>CSV/Excelインポート</DialogTitle>
            <DialogContent sx={{ minWidth: 1000 }}>
              <Box sx={{ my: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mb: 2 }}
                >
                  ファイルを選択
                  <input
                    type="file"
                    hidden
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={async e => {
                      setImportError(null);
                      const file = e.target.files?.[0] ?? null;
                      setImportFile(file);
                      setImportPreview([]);
                      // input要素のvalueをリセット
                      e.target.value = '';
                      if (file) {
                        try {
                          let preview: any[] = [];
                          if (file.name.endsWith('.csv')) {
                            const text = await file.text();
                            const result = Papa.parse(text, { header: true });
                            if (result.errors.length) throw new Error('CSVパースエラー');
                            preview = result.data;
                          } else {
                            const data = await file.arrayBuffer();
                            const workbook = XLSX.read(data, { type: 'array' });
                            const sheet = workbook.Sheets[workbook.SheetNames[0]];
                            preview = XLSX.utils.sheet_to_json(sheet);
                          }
                          setImportPreview(preview);
                        } catch (err: any) {
                          setImportError('ファイルの読み込みに失敗しました');
                        }
                      }
                    }}
                  />
                </Button>
                {importFile && <Box sx={{ mb: 2, fontSize: 14 }}>選択中: {importFile.name}</Box>}
                {importError && <Alert severity="error" sx={{ mb: 2 }}>{importError}</Alert>}
                {importLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
                <Box sx={{ fontSize: 14, color: 'text.secondary', mb: 1 }}>
                  {/* プレビュー表示 */}
                  {importPreview.length > 0 && (
                    <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 2, border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
                      <Box sx={{ fontWeight: 'bold', mb: 1 }}>プレビュー</Box>
                      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ borderBottom: '1px solid #ccc', padding: '4px', background: '#f5f5f5', width: 40 }}>#</th>
                            {Object.keys(importPreview[0]).map((key) => (
                              <th key={key} style={{ borderBottom: '1px solid #ccc', padding: '4px', background: '#f5f5f5' }}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.map((row, idx) => {
                            const errors = validateImportRow(row);
                            return (
                              <tr key={idx}>
                                <td style={{ borderBottom: '1px solid #eee', padding: '4px', background: '#f5f5f5', textAlign: 'right', color: '#888' }}>{idx + 1}</td>
                                {Object.keys(importPreview[0]).map((key) => {
                                  let isError = !!errors[key];
                                  let errorMsg = '';
                                  // ...existing code...
                                  if ((key === 'category' || key === 'カテゴリ')) {
                                    if (errors['category'] === 'カテゴリは必須です') {
                                      isError = true;
                                      errorMsg = errors['category'];
                                    } else if (errors['category']) {
                                      isError = true;
                                      errorMsg = errors['category'];
                                    }
                                  } else if ((key === 'role' || key === '役職')) {
                                    if (errors['role'] === '役職は必須です') {
                                      isError = true;
                                      errorMsg = errors['role'];
                                    } else if (errors['role']) {
                                      isError = true;
                                      errorMsg = errors['role'];
                                    }
                                  } else if ((key === 'sex' || key === '性別') && errors['sex']) {
                                    isError = true;
                                    errorMsg = errors['sex'];
                                  } else if ((key === 'age' || key === '年齢') && errors['age']) {
                                    isError = true;
                                    errorMsg = errors['age'];
                                  } else if ((key === 'name' || key === '名前') && errors['name']) {
                                    isError = true;
                                    errorMsg = errors['name'];
                                  } else if ((key === 'address' || key === '住所') && errors['address']) {
                                    isError = true;
                                    errorMsg = errors['address'];
                                  } else if ((key === 'phoneNumber' || key === '電話番号') && errors['phoneNumber']) {
                                    isError = true;
                                    errorMsg = errors['phoneNumber'];
                                  }
                                  return (
                                    <td
                                      key={key}
                                      style={{
                                        borderBottom: '1px solid #eee',
                                        padding: '4px',
                                        background: isError ? '#ffeaea' : undefined,
                                        position: 'relative',
                                        cursor: isError ? 'help' : undefined
                                      }}
                                      title={errorMsg}
                                    >
                                      {row[key]}
                                      {isError && (
                                        <span style={{ color: '#d32f2f', fontSize: 11, marginLeft: 4 }}>
                                          ※
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <Box sx={{ fontSize: 12, color: '#d32f2f', mt: 1 }}>
                        赤背景・※付きは不正項目です。セルにマウスを乗せるとエラー内容が表示されます。
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ mt: 2, fontSize: 14, color: 'text.secondary' }}>
                    <b>CSV/Excelファイルのフォーマット例：</b><br />
                    <span style={{ fontFamily: 'monospace', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                      name,address,phoneNumber,age,sex,category,role
                    </span><br />
                    <br />
                    <b>各項目の説明：</b><br />
                    ・<b>name</b>：名前（必須）<br />
                    ・<b>address</b>：住所（必須）<br />
                    ・<b>phoneNumber</b>：電話番号（必須、0から始まる10～11桁の数字）<br />
                    ・<b>age</b>：年齢（必須、0～120の半角数字）<br />
                    ・<b>sex</b>：性別（必須、「男性」「女性」「その他」または「male」「female」「other」）<br />
                    ・<b>category</b>：カテゴリ（必須、マスタに登録されているカテゴリ名またはID）<br />
                    ・<b>role</b>：役職（必須、マスタに登録されている役職名またはID）<br />
                    <br />
                    <b>注意事項：</b><br />
                    ・Excelの場合も1行目に上記ヘッダーが必要です。<br />
                    ・カテゴリ・役職はマスタに存在するもののみ指定してください。<br />
                    ・不正な項目は赤背景で表示されます。<br />
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseImportDialog}>キャンセル</Button>
                <Button
                  variant="contained"
                  disabled={!importFile || importLoading || mstcategories.length === 0 || mstroles.length === 0}
                  onClick={async () => {
                    if (!importFile || mstcategories.length === 0 || mstroles.length === 0) return;
                    setImportLoading(true);
                    setImportError(null);
                    try {
                      let imported: any[] = [];
                      if (importFile.name.endsWith('.csv')) {
                        const text = await importFile.text();
                        const result = Papa.parse(text, { header: true });
                        if (result.errors.length) throw new Error('CSVパースエラー');
                        imported = result.data;
                      } else {
                        const data = await importFile.arrayBuffer();
                        const workbook = XLSX.read(data, { type: 'array' });
                        const sheet = workbook.Sheets[workbook.SheetNames[0]];
                        imported = XLSX.utils.sheet_to_json(sheet);
                      }
                      // バリデーションエラー件数をカウント
                      let validationErrorCount = 0;
                      const validRows = imported.filter(row => {
                        const errors = validateImportRow(row);
                        const isValid = Object.keys(errors).length === 0;
                        if (!isValid) validationErrorCount++;
                        return isValid;
                      });
                      if (validationErrorCount > 0) {
                        setImportLoading(false);
                        if (validRows.length === 0) {
                          alert(`${validationErrorCount}件のデータに不正があります。赤背景の行を修正してください。`);
                          return;
                        }
                        const proceed = window.confirm(`${validationErrorCount}件のデータに不正があります。エラー以外の${validRows.length}件のみ登録しますか？`);
                        if (!proceed) return;
                        setImportLoading(true);
                      }
                      if (!validRows.length) throw new Error('有効なデータがありません');
                      // 英語カラムに変換し、カテゴリ・役職はマスタID、性別はmale/female/otherに変換
                      const toPostRow = (row: any) => {
                        const norm: any = {};
                        requiredKeys.forEach(key => {
                          for (const k in columnMap) {
                            if (columnMap[k] === key && row[k] !== undefined) {
                              // カテゴリ
                              if (key === 'category') {
                                let val = row[k];
                                let found = typeof val === 'number'
                                  ? mstcategories.find(c => c.id === val && !c.deletedAt)
                                  : mstcategories.find(c => c.name === val && !c.deletedAt);
                                norm[key] = found ? found.id : null;
                              }
                              // 役職
                              else if (key === 'role') {
                                let val = row[k];
                                let found = typeof val === 'number'
                                  ? mstroles.find(r => r.id === val && !r.deletedAt)
                                  : mstroles.find(r => r.name === val && !r.deletedAt);
                                norm[key] = found ? found.id : null;
                              }
                              // 性別
                              else if (key === 'sex') {
                                let val = row[k];
                                if (val === '男性' || val === 'male') norm[key] = 'male';
                                else if (val === '女性' || val === 'female') norm[key] = 'female';
                                else if (val === 'その他' || val === 'other') norm[key] = 'other';
                                else norm[key] = val;
                              }
                              else {
                                norm[key] = row[k];
                              }
                              break;
                            }
                          }
                        });
                        return norm;
                      };
                      let errorCount = 0;
                      for (const row of validRows) {
                        const postRow = toPostRow(row);
                        console.log('インポート送信データ:', postRow);
                        try {
                          const response = await fetch('http://localhost:8081/address', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(postRow),
                            credentials: 'include',
                          });
                          if (!response.ok) {
                            errorCount++;
                          }
                        } catch {
                          errorCount++;
                        }
                      }
                      await fetchAddresses();
                      setImportDialogOpen(false);
                      setImportFile(null);
                      setImportPreview([]);
                      setImportError(null);
                      setImportLoading(false);
                      if (errorCount > 0) {
                        if (errorCount === validRows.length) {
                          alert('全件の登録に失敗しました');
                        } else {
                          alert(`${errorCount}件の登録に失敗しました`);
                        }
                      } else {
                        alert(`インポートが完了しました（${validRows.length}件登録）`);
                      }
                    } catch (err: any) {
                      setImportError(err.message || 'インポートに失敗しました');
                      setImportLoading(false);
                    }
                  }}
              >
                インポート実行
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default Table;