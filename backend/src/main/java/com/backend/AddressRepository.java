package com.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * AddressRepositoryインターフェース。
 * <p>
 * AddressエンティティのDB操作を提供します。
 */
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByDeletedAtIsNull();
    List<Address> findByDeletedAtIsNotNull();
}
