package com.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

/**
 * UserControllerクラス。
 * <p>
 * ユーザー管理に関するREST APIを提供します。主な機能は以下の通りです。
 * <ul>
 * <li>ユーザー認証（ログイン）</li>
 * <li>ユーザー情報の取得・登録・更新・論理削除・復活</li>
 * <li>パスワード変更（メールアドレス指定）</li>
 * </ul>
 * セキュリティ面では、パスワードはBCryptでハッシュ化して保存し、ログインやパスワード変更時にハッシュ照合を行います。
 * <p>
 * 利用例：
 * <ul>
 * <li>POST /auth/login でログイン（email, password指定）</li>
 * <li>GET /users で全ユーザー取得</li>
 * <li>POST /users で新規ユーザー登録</li>
 * <li>PUT /users/{id} でユーザー情報更新</li>
 * <li>PUT /users/delete/{id} で論理削除</li>
 * <li>PUT /users/restore/{id} で復活</li>
 * <li>PUT /users/email/{email}/password でパスワード変更</li>
 * </ul>
 * <p>
 * エラー時は適切なHTTPステータスとメッセージを返却します。
 */
@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {
    @Autowired
    private SystemlogService logService;
    private final UserRepository repository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserController(UserRepository repository) {
        this.repository = repository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // DTO for login request
    /**
     * LoginRequestクラス。
     * <p>
     * ログインAPIで使用。emailとpasswordを持ちます。
     */
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    /**
     * ユーザー認証（ログイン）API.
     * <p>
     * emailとpasswordを受け取り、認証成功時はユーザー情報とロールを返却。
     * 失敗時はエラー内容を返す。
     * 
     * @param req    ログインリクエスト（email, password）
     * @param userId 操作ユーザーID（任意）
     * @return 認証結果（status, role, id, email等）
     */
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, jakarta.servlet.http.HttpSession session) {
        String logUserId = "-";
        if (req == null || req.getEmail() == null || req.getPassword() == null) {
            logService.writeLog(logUserId, "login", "User", "-", "error:bad_request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new HashMap<String, Object>() {
                {
                    put("status", "error");
                }
            });
        }

        var optionalUser = repository.findByEmail(req.getEmail());
        if (optionalUser.isEmpty()) {
            logService.writeLog(logUserId, "login", "User", "-", "error:user_not_found");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new HashMap<String, Object>() {
                {
                    put("status", "error");
                }
            });
        }

        User user = optionalUser.get();
        logUserId = String.valueOf(user.getId());

        // ★ ここで削除済みユーザーを弾く
        if (user.getDeletedAt() != null) {
            logService.writeLog(logUserId, "login", "User", logUserId, "error:deleted_user");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new HashMap<String, Object>() {
                {
                    put("status", "error");
                }
            });
        }

        String storedHash = user.getPasswordHash();
        if (storedHash == null || storedHash.isEmpty()) {
            logService.writeLog(logUserId, "login", "User", logUserId, "error:no_password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new HashMap<String, Object>() {
                {
                    put("status", "error");
                }
            });
        }

        if (passwordEncoder.matches(req.getPassword(), storedHash)) {
            HashMap<String, Object> resp = new HashMap<>();
            resp.put("status", "OK");
            resp.put("role", user.getRole());
            resp.put("id", user.getId()); // ユーザーIDを追加
            resp.put("email", user.getEmail());
            // セッションにユーザー情報を保存
            session.setAttribute("userId", user.getId());
            session.setAttribute("userEmail", user.getEmail());
            session.setAttribute("userRole", user.getRole());
            logService.writeLog(logUserId, "login", "User", logUserId, "success");
            return ResponseEntity.ok(resp);
        } else {
            logService.writeLog(logUserId, "login", "User", logUserId, "error:wrong_password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new HashMap<String, Object>() {
                {
                    put("status", "error");
                }
            });
        }
    }

    /**
     * 全ユーザー情報取得API.
     * <p>
     * ユーザー一覧を返却。
     * 
     * @return ユーザーリスト
     */
    @GetMapping("/users")
    public Object getAll(jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        return repository.findAll();
    }

    /**
     * ユーザーID指定取得API.
     * <p>
     * 指定IDのユーザー情報を返却。
     * 
     * @param id ユーザーID
     * @return ユーザー情報 or 404
     */
    @GetMapping("/users/{id}")
    public Object getById(@PathVariable Long id, jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Optional<User> user = repository.findById(id);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * ユーザー新規登録API.
     * <p>
     * ユーザー情報を受け取り新規作成。
     * 
     * @param user   ユーザー情報
     * @param userId 操作ユーザーID（任意）
     * @return 作成されたユーザー情報
     */
    @PostMapping("/users")
    public Object create(@RequestBody User user, jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (user.getPasswordHash() != null && !user.getPasswordHash().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = repository.save(user);
        String sessionUserId = String.valueOf(session.getAttribute("userId"));
        logService.writeLog(sessionUserId, "create", "User", String.valueOf(savedUser.getId()), "success");
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    /**
     * ユーザー情報更新API.
     * <p>
     * 指定IDのユーザー情報を更新。
     * 
     * @param id          ユーザーID
     * @param userDetails 更新内容
     * @param userId      操作ユーザーID（任意）
     * @return 更新後のユーザー情報
     */
    @PutMapping("/users/{id}")
    public Object update(@PathVariable Long id, @RequestBody User userDetails, jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Optional<User> optionalUser = repository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = optionalUser.get();
        if (userDetails.getName() != null) {
            user.setName(userDetails.getName());
        }
        if (userDetails.getEmail() != null) {
            user.setEmail(userDetails.getEmail());
        }
        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = repository.save(user);
        String sessionUserId = String.valueOf(session.getAttribute("userId"));
        logService.writeLog(sessionUserId, "update", "User", String.valueOf(updatedUser.getId()), "success");
        return ResponseEntity.ok(updatedUser);
    }

    // ユーザー復活API
    /**
     * ユーザー復活API.
     * <p>
     * 論理削除されたユーザーを復活。
     * 
     * @param id     ユーザーID
     * @param userId 操作ユーザーID（任意）
     * @return 復活後のユーザー情報
     */
    @PutMapping("/users/restore/{id}")
    public Object restore(@PathVariable Long id, jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Optional<User> optionalUser = repository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = optionalUser.get();
        user.setDeletedAt(null);
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = repository.save(user);
        String sessionUserId = String.valueOf(session.getAttribute("userId"));
        logService.writeLog(sessionUserId, "restore", "User", String.valueOf(updatedUser.getId()), "success");
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * ユーザー論理削除API.
     * <p>
     * 指定IDのユーザーを論理削除（deletedAt設定）。
     * 
     * @param id          ユーザーID
     * @param userDetails 削除内容（通常空）
     * @param userId      操作ユーザーID（任意）
     * @return 削除後のユーザー情報
     */
    @PutMapping("/users/delete/{id}")
    public Object softDelete(@PathVariable Long id, @RequestBody User userDetails, jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Optional<User> optionalUser = repository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = optionalUser.get();
        user.setUpdatedAt(LocalDateTime.now());
        user.setDeletedAt(LocalDateTime.now());
        User updatedUser = repository.save(user);
        String sessionUserId = String.valueOf(session.getAttribute("userId"));
        logService.writeLog(sessionUserId, "softDelete", "User", String.valueOf(updatedUser.getId()), "success");
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * ユーザー完全削除API.
     * <p>
     * 指定IDのユーザーをDBから完全削除。
     * 
     * @param id     ユーザーID
     * @param userId 操作ユーザーID（任意）
     * @return 204 No Content
     */
    @DeleteMapping("/users/{id}")
    public Object delete(@PathVariable Long id, jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Optional<User> user = repository.findById(id);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        String sessionUserId = String.valueOf(session.getAttribute("userId"));
        logService.writeLog(sessionUserId, "delete", "User", String.valueOf(id), "success");
        return ResponseEntity.noContent().build();
    }

    // パスワード変更リクエストDTO
    /**
     * パスワード変更リクエストDTOクラス。
     * <p>
     * パスワード変更APIで使用。currentPasswordとnewPasswordを持ちます。
     */
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    // パスワード変更API（メールアドレスで検索）
    /**
     * パスワード変更API（メールアドレス指定）。
     * <p>
     * 指定メールアドレスのユーザーのパスワードを変更。
     * 
     * @param email  メールアドレス
     * @param req    パスワード変更リクエスト
     * @param userId 操作ユーザーID（任意）
     * @return 変更結果（OK or エラー）
     */
    @PutMapping("/users/email/{email}/password")
    public Object changePasswordByEmail(@PathVariable String email, @RequestBody ChangePasswordRequest req, jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Optional<User> optionalUser = repository.findByEmail(email);
        String sessionUserId = String.valueOf(session.getAttribute("userId"));
        if (optionalUser.isEmpty()) {
            logService.writeLog(sessionUserId, "changePassword", "User", "-", "error:user_not_found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new HashMap<String, Object>() {{
                put("status", "error");
                put("message", "ユーザーが見つかりません");
            }});
        }
        User user = optionalUser.get();
        if (req.getCurrentPassword() == null || req.getNewPassword() == null) {
            logService.writeLog(sessionUserId, "changePassword", "User", String.valueOf(user.getId()), "error:bad_request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new HashMap<String, Object>() {{
                put("status", "error");
                put("message", "パラメータ不正");
            }});
        }
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            logService.writeLog(sessionUserId, "changePassword", "User", String.valueOf(user.getId()), "error:wrong_password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new HashMap<String, Object>() {{
                put("status", "error");
                put("message", "現在のパスワードが違います");
            }});
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        repository.save(user);
        logService.writeLog(sessionUserId, "changePassword", "User", String.valueOf(user.getId()), "success");
        return ResponseEntity.ok(new HashMap<String, Object>() {{
            put("status", "OK");
        }});
    }
}
