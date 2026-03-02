import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Table, TableBody, TableRow, TableCell, Button, Box } from "@mui/material";
import { formatDateTime } from "./dateUtil";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// デフォルトアイコンの修正（react-leaflet v4以降必要）
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
	iconUrl: require('leaflet/dist/images/marker-icon.png'),
	shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

type Address = {
	id: number;
	name: string;
	phoneNumber: string;
	address: string;
	age: number;
	sex: string;
	category: number;
	role: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};



const AddressInfo: React.FC = () => {
	// 役割（mstrole）一覧を取得
	const [mstroles, setMstroles] = React.useState<{ id: number; name: string; deletedAt?: string | null }[]>([]);
	React.useEffect(() => {
		fetch("http://localhost:8081/api/mstrole", {
			credentials: "include"
		})
			.then(res => res.json())
			.then(data => {
				if (Array.isArray(data)) setMstroles(data);
			});
	}, []);
	// カテゴリ（mstcategory）一覧を取得
	const [mstcategories, setMstcategories] = React.useState<{ id: number; name: string; deletedAt?: string | null }[]>([]);
	React.useEffect(() => {
		fetch("http://localhost:8081/api/mstcategory", {
			credentials: "include"
		})
			.then(res => res.json())
			.then(data => {
				if (Array.isArray(data)) setMstcategories(data);
			});
	}, []);
	const location = useLocation();
	const navigate = useNavigate();
	const address: Address | undefined = location.state;

	const [latLng, setLatLng] = React.useState<{ lat: number; lng: number } | null>(null);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!address) return;
		const fetchLatLng = async () => {
			setLoading(true);
			setError(null);
			try {
				// Nominatim(OpenStreetMap)の無料ジオコーディングAPIを利用
				const res = await fetch(
					`http://localhost:8081/address/${address.id}`,
					{
						credentials: "include"
					}
				);
				const data = await res.json();
				if (data && data.length > 0) {
					setLatLng({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
					setError(null); // 位置情報取得成功時にエラーをリセット
				} else {
					setError('位置情報が見つかりませんでした');
				}
			} catch (e) {
				setError('位置情報の取得に失敗しました');
			} finally {
				setLoading(false);
			}
		};
		fetchLatLng();
	}, [address]);

	if (!address) {
		return (
			<Box display="flex" flexDirection="column" alignItems="center" mt={4}>
				<Typography variant="h6" color="error">データがありません。</Typography>
				<Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>戻る</Button>
			</Box>
		);
	}

	return (
		<Box display="flex" justifyContent="center" mt={4}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 4,
					width: '100%',
					maxWidth: 1100,
					alignItems: 'stretch',
				}}
			>
				<Card sx={{ flex: 1, minWidth: 300, maxWidth: 500, mb: { xs: 2, md: 0 } }}>
					<CardContent>
						<Typography variant="h5" gutterBottom>住所詳細</Typography>
						<Table>
							<TableBody>
								<TableRow>
									<TableCell>ID</TableCell>
									<TableCell>{address.id}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>名前</TableCell>
									<TableCell>{address.name}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>住所</TableCell>
									<TableCell>{address.address}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>電話番号</TableCell>
									<TableCell>{address.phoneNumber}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>年齢</TableCell>
									<TableCell>{address.age}歳</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>性別</TableCell>
									<TableCell>{
							address.sex === "male" ? "男性" :
							address.sex === "female" ? "女性" :
							address.sex === "other" ? "その他" :
							address.sex
						}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>カテゴリ</TableCell>
									<TableCell>{
									  (() => {
										const category = mstcategories.find(c => c.id === address.category);
										return category ? category.name : address.category;
									  })()
									}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>役職</TableCell>
									<TableCell>{
									  (() => {
										const role = mstroles.find(r => r.id === address.role);
										return role ? role.name : address.role;
									  })()
									}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>作成日時</TableCell>
									<TableCell>{formatDateTime(address.createdAt)}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>更新日時</TableCell>
									<TableCell>{formatDateTime(address.updatedAt)}</TableCell>
								</TableRow>
							</TableBody>
						</Table>
						<Box display="flex" justifyContent="flex-end" mt={2}>
							{/* <Button variant="contained" onClick={() => navigate(-1)}>戻る</Button> */}
							<Button variant="contained" onClick={() => navigate('/address')}>戻る</Button>
						</Box>
					</CardContent>
				</Card>
				<Box flex={1} minWidth={300} maxWidth={600} minHeight={300}>
					<Typography variant="h6" gutterBottom>地図</Typography>
					{loading && <Typography>地図を読み込み中...</Typography>}
					{error && <Typography color="error">{error}</Typography>}
					{latLng && (
						<MapContainer center={latLng} zoom={16} style={{ height: 300, width: '100%' }} scrollWheelZoom={false}>
							<TileLayer
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>
							<Marker position={latLng}>
								<Popup>
									{address.name}<br />{address.address}
								</Popup>
							</Marker>
						</MapContainer>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default AddressInfo;
