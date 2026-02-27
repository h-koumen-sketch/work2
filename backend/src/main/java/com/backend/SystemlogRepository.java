package com.backend;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * SystemlogRepositoryインターフェース。
 * <p>
 * SystemlogエンティティのDB操作を提供します。
 */
public interface SystemlogRepository extends JpaRepository<Systemlog, Long> {
    // 必要に応じてカスタムメソッド追加
}
