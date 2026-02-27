package com.backend;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

/**
 * SystemlogControllerクラス。
 * <p>
 * Systemlogエンティティの操作APIを提供します。
 */
@RestController
@RequestMapping("/systemlogs")
public class SystemlogController {

    @Autowired
    private SystemlogRepository repository;

    /**
     * 全システムログ取得API。
     * <p>
     * システムログ一覧を返却。
     * 
     * @return システムログリスト
     */
    @GetMapping
    public List<Systemlog> getAll() {
        return repository.findAll();
    }

    /**
     * システムログ新規登録API。
     * <p>
     * システムログ情報を受け取り新規作成。
     * 
     * @param log システムログ情報
     * @return 作成されたシステムログ情報
     */
    @PostMapping
    public Systemlog create(@RequestBody Systemlog log) {
        return repository.save(log);
    }

    // 必要に応じて詳細取得や検索API追加
}
