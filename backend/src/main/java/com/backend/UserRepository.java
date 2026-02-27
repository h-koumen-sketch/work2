
package com.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * UserRepositoryインターフェース。
 * <p>
 * UserエンティティのDB操作を提供します。
 */
public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByEmail(String email);
}
