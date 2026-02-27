package com.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * MstroleRepositoryインターフェース。
 * <p>
 * MstroleエンティティのDB操作を提供します。
 */
@Repository
public interface MstroleRepository extends JpaRepository<Mstrole, Integer> {
}
