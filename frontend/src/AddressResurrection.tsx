import { formatDateTime } from "./dateUtil";
import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import RestoreIcon from '@mui/icons-material/Restore';
import { useNavigate } from "react-router-dom";
import SessionExpiredMessage from "./SessionExpiredMessage";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";


type Address = {
    id: number;
    name: string;
    phoneNumber: string;
    address: string;
    age: number;
    sex: string;
    role: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

const AddressResurrection: React.FC = () => {
        const [sessionExpired, setSessionExpired] = useState(false);
    const [data, setData] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const fetchDeletedAddresses = async () => {
        setLoading(true);
        try {
            const resp = await fetch("http://localhost:8081/address/deleted", {
                credentials: "include"
            });
            if (!resp.ok) {
                setSessionExpired(true);
                return;
            }
            const addresses = await resp.json();
            setData(addresses);
        } catch (e) {
            setSessionExpired(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeletedAddresses();
    }, []);
    // 役割（mstrole）一覧を取得
    const [mstroles, setMstroles] = useState<{ id: number; name: string; deletedAt?: string | null }[]>([]);
    useEffect(() => {
        fetch("http://localhost:8081/api/mstrole", {
            credentials: "include"
        })
            .then(res => {
                if (!res.ok) {
                    setSessionExpired(true);
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) setMstroles(data);
            })
            .catch(() => {
                setSessionExpired(true);
            });
    }, []);
    const handleRestore = async (id: number) => {
        try {
            const resp = await fetch(`http://localhost:8081/address/restore/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            if (!resp.ok) {
                setSessionExpired(true);
                return;
            }
            await fetchDeletedAddresses();
        } catch (e) {
            setSessionExpired(true);
        }
    };

    const columns: MRT_ColumnDef<Address>[] = [
        {
            accessorKey: "actions",
            header: "操作",
            Cell: ({ row }: { row: any }) => (
                <IconButton onClick={() => handleRestore(row.original.id)} color="primary">
                    <RestoreIcon />復活
                </IconButton>
            ),
        },
        { accessorKey: "id", header: "ID" },
        { accessorKey: "name", header: "名前" },
        { accessorKey: "address", header: "住所" },
        { accessorKey: "phoneNumber", header: "電話番号" },
        { accessorKey: "age", header: "年齢" },
        { accessorKey: "sex", header: "性別" },
        {
            accessorKey: "role", header: "役職",
            Cell: ({ cell }) => {
                const roleId = cell.getValue<number>();
                const role = mstroles.find(r => r.id === roleId);
                return role ? role.name : roleId;
            }
        },
        { accessorKey: "createdAt", header: "作成日時", Cell: ({ cell }) => formatDateTime(cell.getValue<string>()) },
        { accessorKey: "updatedAt", header: "更新日時", Cell: ({ cell }) => formatDateTime(cell.getValue<string>()) },
        { accessorKey: "deletedAt", header: "削除日時", Cell: ({ cell }) => formatDateTime(cell.getValue<string>()) },

    ];

    return (
        <>
            {sessionExpired ? (
                <SessionExpiredMessage onLogin={() => window.location.href = "/"} />
            ) : (
                <>
                    <Box sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h4" gutterBottom>
                                住所復活画面
                            </Typography>
                            <Button variant="outlined" onClick={fetchDeletedAddresses} sx={{ ml: 2 }}
                                startIcon={<RefreshIcon />}>
                                再読み込み
                            </Button>
                        </Box>
                        <MaterialReactTable columns={columns} data={data} state={{ isLoading: loading }} />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mt: 2, mr: 2 }}>
                        <Button variant="contained" onClick={() => navigate('/admin')}> 戻る </Button>
                    </Box>
                </>
            )}
        </>
    );
};

export default AddressResurrection;
