package com.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * MstroleControllerクラス。
 * <p>
 * Mstroleエンティティの操作APIを提供します。
 */
@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequestMapping("/api/mstrole")
public class MstroleController {
    @Autowired
    private MstroleRepository repository;

    @Autowired
    private SystemlogService logService;

    /**
     * 全ロール取得API。
     * <p>
     * 論理削除されていないロールの一覧を返却。
     * 
     * @return ロールリスト
     */
    @GetMapping("")
    public List<Mstrole> getAll() {
        return repository.findAll();
    }

    /**
     * ロールID指定取得API。
     * <p>
     * 指定IDのロール情報を返却。
     * 
     * @param id ロールID
     * @return ロール情報 or 404
     */
    @GetMapping("/{id}")
    public Mstrole getById(@PathVariable Integer id, jakarta.servlet.http.HttpSession session) {
        String sessionUserId = session != null && session.getAttribute("userId") != null
            ? String.valueOf(session.getAttribute("userId"))
            : "system";
        return repository.findById(id).map(mstrole -> mstrole).orElseGet(() -> {
            logService.writeLog(sessionUserId, "getById", "Mstrole", String.valueOf(id), "error:not_found");
            return null;
        });
    }

    /**
     * ロール新規登録API。
     * <p>
     * ロール情報を受け取り新規作成。操作ユーザーIDをログに記録。
     * 
     * @param mstrole ロール情報
     * @param userId  操作ユーザーID（任意）
     * @return 作成されたロール情報
     */
    @PostMapping("")
    public Mstrole create(@RequestBody Mstrole mstrole, jakarta.servlet.http.HttpSession session) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        mstrole.setCreatedAt(now);
        mstrole.setUpdatedAt(now);
        String sessionUserId = session != null && session.getAttribute("userId") != null
            ? String.valueOf(session.getAttribute("userId"))
            : "system";
        Mstrole saved = repository.save(mstrole);
        logService.writeLog(sessionUserId, "create", "Mstrole", String.valueOf(saved.getId()), "success");
        return saved;
    }

    /**
     * ロール更新API。
     * <p>
     * 指定IDのロール情報を受け取り更新。操作ユーザーIDをログに記録。
     * 
     * @param id      ロールID
     * @param mstrole 更新するロール情報
     * @param userId  操作ユーザーID（任意）
     * @return 更新されたロール情報 or 404
     */
    @PutMapping("/{id}")
    public Mstrole update(@PathVariable Integer id, @RequestBody Mstrole mstrole, jakarta.servlet.http.HttpSession session) {
        String sessionUserId = session != null && session.getAttribute("userId") != null
            ? String.valueOf(session.getAttribute("userId"))
            : "system";
        if (!repository.existsById(id)) {
            logService.writeLog(sessionUserId, "update", "Mstrole", String.valueOf(id), "error:not_found");
            return null;
        }
        mstrole.setId(id);
        Mstrole saved = repository.save(mstrole);
        logService.writeLog(sessionUserId, "update", "Mstrole", String.valueOf(saved.getId()), "success");
        return saved;
    }

    /**
     * ロール復活API。
     * <p>
     * 論理削除されたロールを復活させる。操作ユーザーIDをログに記録。
     *
     * @param id     復活させるロールのID
     * @param userId 操作ユーザーID（任意）
     * @return 復活後のロール情報
     */
    @PutMapping("/restore/{id}")
    public Mstrole restore(@PathVariable Integer id, jakarta.servlet.http.HttpSession session) {
        String sessionUserId = session != null && session.getAttribute("userId") != null
            ? String.valueOf(session.getAttribute("userId"))
            : "system";
        return repository.findById(id).map(mstrole -> {
            mstrole.setDeletedAt(null);
            mstrole.setUpdatedAt(java.time.LocalDateTime.now());
            Mstrole saved = repository.save(mstrole);
            logService.writeLog(sessionUserId, "restore", "Mstrole", String.valueOf(saved.getId()), "success");
            return saved;
        }).orElseGet(() -> {
            logService.writeLog(sessionUserId, "restore", "Mstrole", String.valueOf(id), "error:not_found");
            return null;
        });
    }

    /**
     * ロール論理削除API。
     * <p>
     * 指定IDのロールを論理削除。操作ユーザーIDをログに記録。
     * 
     * @param id     ロールID
     * @param userId 操作ユーザーID（任意）
     * @return 論理削除されたロール情報 or 404
     */
    @PutMapping("/delete/{id}")
    public Mstrole softDelete(@PathVariable Integer id, jakarta.servlet.http.HttpSession session) {
        String sessionUserId = session != null && session.getAttribute("userId") != null
            ? String.valueOf(session.getAttribute("userId"))
            : "system";
        return repository.findById(id).map(mstrole -> {
            mstrole.setUpdatedAt(java.time.LocalDateTime.now());
            mstrole.setDeletedAt(java.time.LocalDateTime.now());
            Mstrole saved = repository.save(mstrole);
            logService.writeLog(sessionUserId, "softDelete", "Mstrole", String.valueOf(saved.getId()), "success");
            return saved;
        }).orElseGet(() -> {
            logService.writeLog(sessionUserId, "softDelete", "Mstrole", String.valueOf(id), "error:not_found");
            return null;
        });
    }
}
