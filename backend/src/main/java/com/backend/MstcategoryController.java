package com.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * MstcategoryControllerクラス。
 * <p>
 * Mstcategoryエンティティの操作APIを提供します。
 */
@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequestMapping("/api/mstcategory")
public class MstcategoryController {
    @Autowired
    private MstcategoryRepository repository;

    @Autowired
    private SystemlogService logService;

    /**
     * 全カテゴリ取得API。
     * <p>
     * カテゴリ一覧を返却。
     * 
     * @return カテゴリリスト
     */
    @GetMapping("")
    public Object getAll(jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        return repository.findAll();
    }

    /**
     * カテゴリID指定取得API。
     * <p>
     * 指定IDのカテゴリ情報を返却。
     * 
     * @param id カテゴリID
     * @param session セッション
     * @return カテゴリ情報 or 404
     */
    @GetMapping("/{id}")
    public Object getById(@PathVariable Integer id, jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        String sessionUserId = String.valueOf(session.getAttribute("userId"));
        return repository.findById(id).map(mstcategory -> mstcategory).orElseGet(() -> {
            logService.writeLog(sessionUserId, "getById", "Mstcategory", String.valueOf(id), "error:not_found");
            return null;
        });
    }

    /**
     * カテゴリ新規登録API。
     * <p>
     * カテゴリ情報を受け取り新規作成。操作ユーザーIDをログに記録。
     * 
     * @param mstcategory カテゴリ情報
     * @param session セッション
     * @return 作成されたカテゴリ情報
     */
    @PostMapping("")
    public Object create(@RequestBody Mstcategory mstcategory, jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        mstcategory.setCreatedAt(now);
        mstcategory.setUpdatedAt(now);
        String sessionUserId = String.valueOf(session.getAttribute("userId"));
        Mstcategory saved = repository.save(mstcategory);
        logService.writeLog(sessionUserId, "create", "Mstcategory", String.valueOf(saved.getId()), "success");
        return saved;
    }

    /**
     * カテゴリ更新API。
     * <p>
     * 指定IDのカテゴリ情報を受け取り更新。操作ユーザーIDをログに記録。
     * 
     * @param id          カテゴリID
     * @param mstcategory 更新するカテゴリ情報
     * @param session セッション
     * @return 更新されたカテゴリ情報 or 404
     */
    @PutMapping("/{id}")
    public Object update(@PathVariable Integer id, @RequestBody Mstcategory mstcategory, jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        String sessionUserId = String.valueOf(session.getAttribute("userId"));
        if (!repository.existsById(id)) {
            logService.writeLog(sessionUserId, "update", "Mstcategory", String.valueOf(id), "error:not_found");
            return null;
        }
        mstcategory.setId(id);
        Mstcategory saved = repository.save(mstcategory);
        logService.writeLog(sessionUserId, "update", "Mstcategory", String.valueOf(saved.getId()), "success");
        return saved;
    }

    /**
     * カテゴリ論理削除API。
     * <p>
     * 指定IDのカテゴリを論理削除。操作ユーザーIDをログに記録。
     * 
     * @param id     カテゴリID
     * @param session セッション
     * @return 論理削除されたカテゴリ情報 or 404
     */
    @PutMapping("/restore/{id}")
    public Object restore(@PathVariable Integer id, jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        String sessionUserId = String.valueOf(session.getAttribute("userId"));
        return repository.findById(id).map(mstcategory -> {
            mstcategory.setDeletedAt(null);
            mstcategory.setUpdatedAt(java.time.LocalDateTime.now());
            Mstcategory saved = repository.save(mstcategory);
            logService.writeLog(sessionUserId, "restore", "Mstcategory", String.valueOf(saved.getId()), "success");
            return saved;
        }).orElseGet(() -> {
            logService.writeLog(sessionUserId, "restore", "Mstcategory", String.valueOf(id), "error:not_found");
            return null;
        });
    }

    @PutMapping("/delete/{id}")
    public Object softDelete(@PathVariable Integer id, jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        String sessionUserId = String.valueOf(session.getAttribute("userId"));
        return repository.findById(id).map(mstcategory -> {
            mstcategory.setUpdatedAt(java.time.LocalDateTime.now());
            mstcategory.setDeletedAt(java.time.LocalDateTime.now());
            Mstcategory saved = repository.save(mstcategory);
            logService.writeLog(sessionUserId, "softDelete", "Mstcategory", String.valueOf(saved.getId()), "success");
            return saved;
        }).orElseGet(() -> {
            logService.writeLog(sessionUserId, "softDelete", "Mstcategory", String.valueOf(id), "error:not_found");
            return null;
        });
    }
}
