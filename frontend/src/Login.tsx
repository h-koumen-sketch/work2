import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [userId, setUserId] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [formErrors, setFormErrors] = React.useState<{ userId?: string; password?: string }>({});
  // パスワード変更用
  const [pwDialogOpen, setPwDialogOpen] = React.useState(false);
  const [currentPw, setCurrentPw] = React.useState('');
  const [newPw, setNewPw] = React.useState('');
  const [pwChangeMsg, setPwChangeMsg] = React.useState<string | null>(null);
  const [pwFormErrors, setPwFormErrors] = React.useState<{ currentPw?: string; newPw?: string }>({});
    // パスワード共通バリデーション関数
    const validatePassword = (value: string, label: string = "パスワード"): string | undefined => {
      if (!value || value.trim() === "") {
        return `${label}を入力してください`;
      } else if (value.length < 6) {
        return `${label}は6文字以上必須です`;
      }
      return undefined;
    };

    // パスワード変更バリデーション
    const validatePwForm = (): boolean => {
      const errors: { currentPw?: string; newPw?: string } = {};
      errors.currentPw = validatePassword(currentPw, "現在のパスワード");
      errors.newPw = validatePassword(newPw, "新しいパスワード");
      setPwFormErrors(errors);
      return Object.values(errors).every(e => !e);
    };
    // パスワード変更API呼び出し
    const handleChangePassword = async () => {
      setPwChangeMsg(null);
      if (!validatePwForm()) return;
      // メールアドレスをlocalStorageから取得
      const email = localStorage.getItem('userEmail') || userId;
      if (!email) {
        setPwChangeMsg('メールアドレスが取得できません');
        return;
      }
      try {
        const resp = await fetch(`http://localhost:8081/users/email/${encodeURIComponent(email)}/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw })
        });
        const data = await resp.json();
        if (resp.ok && data.status === 'OK') {
          setPwChangeMsg('パスワードを変更しました');
          setCurrentPw(''); setNewPw('');
          setPwDialogOpen(false);
        } else {
          setPwChangeMsg(data.message || 'パスワード変更に失敗しました');
        }
      } catch {
        setPwChangeMsg('サーバーに接続できません');
      }
    };
  const navigate = useNavigate();

  // バリデーション
  const validateForm = (): boolean => {
    const errors: { userId?: string; password?: string } = {};
    if (!userId || userId.trim() === "") {
      errors.userId = "メールアドレスを入力してください";
    } else if (!/^[\w\-.]+@[\w\-]+\.[\w\-.]+$/.test(userId)) {
      errors.userId = "メールアドレスの形式が不正です";
    }
    errors.password = validatePassword(password);
    setFormErrors(errors);
    return Object.values(errors).every(e => !e);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!validateForm()) return;

    // call backend login
    (async () => {
      try {
        const resp = await fetch('http://localhost:8081/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: userId, password }),
        });

        let data;
        try {
          data = await resp.json();
        } catch {
          data = null;
        }
        if (resp.ok && data && data.status === 'OK') {
          try { localStorage.setItem('loggedIn', '1'); } catch {}
          // userIdはサーバーから返却された数値IDを保存
          if (data.id) {
            try { localStorage.setItem('userId', String(data.id)); } catch {}
          }
          if (data.role) {
            try { localStorage.setItem('role', data.role); } catch {}
          }
          navigate('/address');
        } else {
          setError('認証に失敗しました');
        }
      } catch (err) {
        setError('サーバーに接続できません');
      }
    })();
  };

  React.useEffect(() => {
    // if already logged in, go to home
    try {
      // do NOT auto-navigate on load; only prefill saved userId
      const savedId = localStorage.getItem('userId');
      if (savedId) setUserId(savedId);
    } catch (e) {}
  }, [navigate]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f2f5' }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: 360, p: 4, bgcolor: '#fff', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom>ログイン</Typography>
        <TextField
          label="メールアドレス"
          type="text"
          fullWidth
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          sx={{ mb: 2 }}
          autoFocus
          error={!!formErrors.userId}
          helperText={formErrors.userId}
        />

        <TextField
          label="パスワード"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!formErrors.password}
          helperText={formErrors.password}
        />
        {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="outlined" onClick={() => setPwDialogOpen(true)}>パスワード変更</Button>
          <Button variant="contained" type="submit">ログイン</Button>
        </Box>
        {/* パスワード変更ダイアログ */}
        {pwDialogOpen && (
          <Box sx={{ mt: 4, p: 2, bgcolor: '#f9f9f9', borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="subtitle1" gutterBottom>パスワード変更</Typography>
            <TextField
              label="現在のパスワード"
              type="password"
              fullWidth
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              sx={{ mb: 2 }}
              error={!!pwFormErrors.currentPw}
              helperText={pwFormErrors.currentPw}
            />
            <TextField
              label="新しいパスワード"
              type="password"
              fullWidth
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              sx={{ mb: 2 }}
              error={!!pwFormErrors.newPw}
              helperText={pwFormErrors.newPw}
            />
            {pwChangeMsg && <Typography color={pwChangeMsg.includes('変更しました') ? 'primary' : 'error'} sx={{ mb: 1 }}>{pwChangeMsg}</Typography>}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setPwDialogOpen(false)}>キャンセル</Button>
              <Button variant="contained" onClick={handleChangePassword}>変更</Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Login;
