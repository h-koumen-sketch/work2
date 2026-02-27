
package com.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * MstcategoryRepositoryインターフェース。
 * <p>
 * MstcategoryエンティティのDB操作を提供します。
 */
@Repository
public interface MstcategoryRepository extends JpaRepository<Mstcategory, Integer> {
}
