package com.backend;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * SystemlogServiceクラス。
 * <p>
 * システム操作ログの記録を担当するサービス。
 * 各種操作（ユーザー認証、CRUD等）の履歴をSystemlogエンティティとしてDBに保存します。
 */
@Service
public class SystemlogService {
    @Autowired
    private SystemlogRepository repository;

    /**
     * システム操作ログを記録するメソッド。
     * <p>
     * 指定されたユーザーID、アクション、エンティティ種別・ID、結果をSystemlogとして保存します。
     * 
     * @param userId     操作ユーザーID
     * @param action     操作内容（例: login, create, update, delete等）
     * @param entityType 操作対象エンティティ種別（例: User, Address等）
     * @param entityId   操作対象エンティティID
     * @param result     操作結果（例: success, error:bad_request等）
     */
    public void writeLog(String userId, String action, String entityType, String entityId, String result) {

        Systemlog log = new Systemlog();
        log.setTimestamp(java.time.LocalDateTime.now());
        log.setUserId(userId);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setResult(result);
        repository.save(log);
    }
}