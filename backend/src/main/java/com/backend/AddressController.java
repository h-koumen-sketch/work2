// ...existing code...
package com.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * AddressControllerクラス。
 * <p>
 * Addressエンティティの操作APIを提供します。
 */
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class AddressController {

    @Autowired
    private SystemlogService logService;

    // 削除済み住所一覧取得API
        /**
         * 削除済み住所一覧取得API。
         * <p>
         * 論理削除された住所の一覧を返却。
         *
         * @return 削除済み住所リスト
         */
    @GetMapping("/address/deleted")
    public List<Address> getDeletedAddresses() {
        return repository.findByDeletedAtIsNotNull();
    }

    // 住所復活API
    /**
     * 住所復活API。
     * <p>
     * 論理削除された住所を復活させる。
     *
     * @param id 復活させる住所のID
     * @return 復活後の住所情報
     */
    @PutMapping("/address/restore/{id}")
    public ResponseEntity<Address> restore(@PathVariable Long id) {
        return restore(id, "system");
    }

    /**
     * 住所復活API（ユーザーID付き）。
     * <p>
     * 論理削除された住所を復活させる。操作ユーザーIDをログに記録。
     *
     * @param id     復活させる住所のID
     * @param userId 操作ユーザーID（任意）
     * @return 復活後の住所情報
     */
    @PutMapping(value = "/address/restore/{id}", headers = "X-User-Id")
    public ResponseEntity<Address> restore(@PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Optional<Address> optionalAddress = repository.findById(id);
        if (optionalAddress.isEmpty()) {
            logService.writeLog(userId != null ? userId : "system", "restore", "Address", String.valueOf(id),
                    "error:not_found");
            return ResponseEntity.notFound().build();
        }
        Address address = optionalAddress.get();
        address.setDeletedAt(null);
        address.setUpdatedAt(LocalDateTime.now());
        Address updatedAddress = repository.save(address);
        logService.writeLog(userId != null ? userId : "system", "restore", "Address",
                String.valueOf(updatedAddress.getId()), "success");
        return ResponseEntity.ok(updatedAddress);
    }

    private final AddressRepository repository;

    /**
     * AddressControllerのコンストラクタ。
     * @param repository AddressRepositoryのインスタンス
     */
    public AddressController(AddressRepository repository) {
        this.repository = repository;
    }

    /**
     * 全住所取得API。
     * <p>
     * 論理削除されていない住所の一覧を返却。
     * 
     * @return 住所リスト
     */
    @GetMapping("/address")
    public List<Address> getAll() {
        return repository.findByDeletedAtIsNull();
    }

    /**
     * 住所ID指定取得API。
     * <p>
     * 指定IDの住所情報を返却。
     * 
     * @param id 住所ID
     * @return 住所情報 or 404
     */
    @GetMapping("/address/{id}")
    public ResponseEntity<Address> getById(@PathVariable Long id) {
        Optional<Address> address = repository.findById(id);
        return address.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * 住所新規登録API。
     * <p>
     * 住所情報を受け取り新規作成。操作ユーザーIDをログに記録。
     * 
     * @param address 住所情報
     * @param userId  操作ユーザーID（任意）
     * @return 作成された住所情報
     */
    @PostMapping("/address")
    public ResponseEntity<Address> create(@RequestBody Address address) {
        return create(address, "system");
    }

    /**
     * 住所新規登録API（ユーザーID付き）。
     * <p>
     * 住所情報を受け取り新規作成。操作ユーザーIDをログに記録。
     * 
     * @param address 住所情報
     * @param userId  操作ユーザーID（任意）
     * @return 作成された住所情報
     */
    @PostMapping(value = "/address", headers = "X-User-Id")
    public ResponseEntity<Address> create(@RequestBody Address address,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        address.setCreatedAt(LocalDateTime.now());
        address.setUpdatedAt(LocalDateTime.now());
        Address savedAddress = repository.save(address);
        logService.writeLog(userId != null ? userId : "system", "create", "Address",
                String.valueOf(savedAddress.getId()), "success");
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAddress);
    }

    /**
     * 住所更新API。
     * <p>
     * 指定IDの住所情報を受け取り更新。操作ユーザーIDをログに記録。
     * 
     * @param id      住所ID
     * @param address 更新する住所情報
     * @param userId  操作ユーザーID（任意）
     * @return 更新された住所情報 or 404
     */
    @PutMapping("/address/{id}")
    public ResponseEntity<Address> update(@PathVariable Long id, @RequestBody Address addressDetails) {
        return update(id, addressDetails, "system");
    }

    /**
     * 住所更新API（ユーザーID付き）。
     * <p>
     * 指定IDの住所情報を受け取り更新。操作ユーザーIDをログに記録。
     * 
     * @param id      住所ID
     * @param address 更新する住所情報
     * @param userId  操作ユーザーID（任意）
     * @return 更新された住所情報 or 404
     */
    @PutMapping(value = "/address/{id}", headers = "X-User-Id")
    public ResponseEntity<Address> update(@PathVariable Long id, @RequestBody Address addressDetails,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Optional<Address> optionalAddress = repository.findById(id);
        if (optionalAddress.isEmpty()) {
            logService.writeLog(userId != null ? userId : "system", "update", "Address", String.valueOf(id),
                    "error:not_found");
            return ResponseEntity.notFound().build();
        }
        Address address = optionalAddress.get();
        if (addressDetails.getName() != null) {
            address.setName(addressDetails.getName());
        }
        if (addressDetails.getPhoneNumber() != null) {
            address.setPhoneNumber(addressDetails.getPhoneNumber());
        }
        if (addressDetails.getAddress() != null) {
            address.setAddress(addressDetails.getAddress());
        }
        if (addressDetails.getAge() != null) {
            address.setAge(addressDetails.getAge());
        }
        if (addressDetails.getSex() != null) {
            address.setSex(addressDetails.getSex());
        }
        if (addressDetails.getRole() != null) {
            address.setRole(addressDetails.getRole());
        }
        if (addressDetails.getCategory() != null) {
            address.setCategory(addressDetails.getCategory());
        }
        address.setUpdatedAt(LocalDateTime.now());
        Address updatedAddress = repository.save(address);
        logService.writeLog(userId != null ? userId : "system", "update", "Address",
                String.valueOf(updatedAddress.getId()), "success");
        return ResponseEntity.ok(updatedAddress);
    }

    /**
     * 住所論理削除API。
     * <p>
     * 指定IDの住所を論理削除。操作ユーザーIDをログに記録。
     * 
     * @param id     住所ID
     * @param userId 操作ユーザーID（任意）
     * @return 論理削除された住所情報 or 404
     */
    @PutMapping("/address/delete/{id}")
    public ResponseEntity<Address> softDelete(@PathVariable Long id) {
        return softDelete(id, "system");
    }

    /**
     * 住所論理削除API（ユーザーID付き）。
     * <p>
     * 指定IDの住所を論理削除。操作ユーザーIDをログに記録。
     * 
     * @param id     住所ID
     * @param userId 操作ユーザーID（任意）
     * @return 論理削除された住所情報 or 404
     */
    @PutMapping(value = "/address/delete/{id}", headers = "X-User-Id")
    public ResponseEntity<Address> softDelete(@PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Optional<Address> optionalAddress = repository.findById(id);
        if (optionalAddress.isEmpty()) {
            logService.writeLog(userId != null ? userId : "system", "softDelete", "Address", String.valueOf(id),
                    "error:not_found");
            return ResponseEntity.notFound().build();
        }
        Address address = optionalAddress.get();
        address.setUpdatedAt(LocalDateTime.now());
        address.setDeletedAt(LocalDateTime.now());
        Address updatedAddress = repository.save(address);
        logService.writeLog(userId != null ? userId : "system", "softDelete", "Address",
                String.valueOf(updatedAddress.getId()), "success");
        return ResponseEntity.ok(updatedAddress);
    }

    /**
     * 住所完全削除API。
     * <p>
     * 指定IDの住所をDBから完全削除。操作ユーザーIDをログに記録。
     * 
     * @param id     住所ID
     * @param userId 操作ユーザーID（任意）
     * @return 204 No Content or 404
     */
    @DeleteMapping("/address/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<Address> address = repository.findById(id);
        if (address.isEmpty()) {
            logService.writeLog("system", "delete", "Address", String.valueOf(id), "error:not_found");
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        logService.writeLog("system", "delete", "Address", String.valueOf(id), "success");
        return ResponseEntity.noContent().build();
    }
}
