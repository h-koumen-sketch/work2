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
@CrossOrigin(origins = "http://localhost:3000")
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
    public List<Mstcategory> getAll() {
        return repository.findAll();
    }

    /**
     * カテゴリID指定取得API。
     * <p>
     * 指定IDのカテゴリ情報を返却。
     * 
     * @param id カテゴリID
     * @return カテゴリ情報 or 404
     */
    @GetMapping("/{id}")
    public Mstcategory getById(@PathVariable Integer id) {
        return repository.findById(id).map(mstcategory -> mstcategory).orElseGet(() -> {
            logService.writeLog("system", "getById", "Mstcategory", String.valueOf(id), "error:not_found");
            return null;
        });
    }

    /**
     * カテゴリ新規登録API。
     * <p>
     * カテゴリ情報を受け取り新規作成。操作ユーザーIDをログに記録。
     * 
     * @param mstcategory カテゴリ情報
     * @param userId      操作ユーザーID（任意）
     * @return 作成されたカテゴリ情報
     */
    @PostMapping("")
    public Mstcategory create(@RequestBody Mstcategory mstcategory) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        mstcategory.setCreatedAt(now);
        mstcategory.setUpdatedAt(now);
        Mstcategory saved = repository.save(mstcategory);
        logService.writeLog("system", "create", "Mstcategory", String.valueOf(saved.getId()), "success");
        return saved;
    }

    /**
     * カテゴリ更新API。
     * <p>
     * 指定IDのカテゴリ情報を受け取り更新。操作ユーザーIDをログに記録。
     * 
     * @param id          カテゴリID
     * @param mstcategory 更新するカテゴリ情報
     * @param userId      操作ユーザーID（任意）
     * @return 更新されたカテゴリ情報 or 404
     */
    @PutMapping("/{id}")
    public Mstcategory update(@PathVariable Integer id, @RequestBody Mstcategory mstcategory) {
        if (!repository.existsById(id)) {
            logService.writeLog("system", "update", "Mstcategory", String.valueOf(id), "error:not_found");
            return null;
        }
        mstcategory.setId(id);
        Mstcategory saved = repository.save(mstcategory);
        logService.writeLog("system", "update", "Mstcategory", String.valueOf(saved.getId()), "success");
        return saved;
    }

    /**
     * カテゴリ論理削除API。
     * <p>
     * 指定IDのカテゴリを論理削除。操作ユーザーIDをログに記録。
     * 
     * @param id     カテゴリID
     * @param userId 操作ユーザーID（任意）
     * @return 論理削除されたカテゴリ情報 or 404
     */
    @PutMapping("/restore/{id}")
    public Mstcategory restore(@PathVariable Integer id) {
        return repository.findById(id).map(mstcategory -> {
            mstcategory.setDeletedAt(null);
            mstcategory.setUpdatedAt(java.time.LocalDateTime.now());
            Mstcategory saved = repository.save(mstcategory);
            logService.writeLog("system", "restore", "Mstcategory", String.valueOf(saved.getId()), "success");
            return saved;
        }).orElseGet(() -> {
            logService.writeLog("system", "restore", "Mstcategory", String.valueOf(id), "error:not_found");
            return null;
        });
    }

    
    
    @PutMapping("/delete/{id}")
    public Mstcategory softDelete(@PathVariable Integer id) {
        return repository.findById(id).map(mstcategory -> {
            mstcategory.setUpdatedAt(java.time.LocalDateTime.now());
            mstcategory.setDeletedAt(java.time.LocalDateTime.now());
            Mstcategory saved = repository.save(mstcategory);
            logService.writeLog("system", "softDelete", "Mstcategory", String.valueOf(saved.getId()), "success");
            return saved;
        }).orElseGet(() -> {
            logService.writeLog("system", "softDelete", "Mstcategory", String.valueOf(id), "error:not_found");
            return null;
        });
    }
}
