
package com.backend;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

import jakarta.persistence.Column;

/**
 * Addressエンティティクラス。
 * <p>
 * ユーザーの住所情報を管理します。
 * name, phoneNumber, age, address, sex, role, categoryなどの属性を持ちます。
 * createdAt, updatedAt, deletedAtで履歴管理も行います。
 */
@Entity
@Table(name = "address")
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "age", nullable = false)
    private Integer age;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "sex", nullable = false, columnDefinition = "ENUM('male', 'female', 'other') DEFAULT 'other'")
    private String sex;

    @Column(name = "role")
    private Integer role;

    @Column(name = "category")
    private Integer category;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * デフォルトコンストラクタ
     */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public Address() {
    }

    /**
    * フィールド指定コンストラクタ
    * @param id ID
    * @param name 名前
    * @param phoneNumber 電話番号
    * @param address 住所
    * @param age 年齢
    * @param sex 性別
    * @param role 権限
    * @param category カテゴリ
    */
    public Address(Long id, String name, String phoneNumber, String address, Integer age, String sex, Integer role,
            Integer category) {
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.age = age;
        this.sex = sex;
        this.role = role;
        this.category = category;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * カテゴリを取得します。
     * @return category カテゴリ
     */
    public Integer getCategory() {
        return category;
    }

    /**
     * カテゴリを設定します。
     * @param category カテゴリ
     */
    public void setCategory(Integer category) {
        this.category = category;
    }

    /**
     * 電話番号を取得します。
     * @return phoneNumber 電話番号
     */
    public String getPhoneNumber() {
        return phoneNumber;
    }

    /**
     * 電話番号を設定します。
     * @param phoneNumber 電話番号
     */
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    /**
     * IDを取得します。
     * @return id ID
     */
    public Long getId() {
        return id;
    }

    /**
     * IDを設定します。
     * @param id ID
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * 名前を取得します。
     * @return name 名前
     */
    public String getName() {
        return name;
    }

    /**
     * 名前を設定します。
     * @param name 名前
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 住所を取得します。
     * @return address 住所
     */
    public String getAddress() {
        return address;
    }

    /**
     * 住所を設定します。
     * @param address 住所
     */
    public void setAddress(String address) {
        this.address = address;
    }

    /**
     * 年齢を取得します。
     * @return age 年齢
     */
    public Integer getAge() {
        return age;
    }

    /**
     * 年齢を設定します。
     * @param age 年齢
     */
    public void setAge(Integer age) {
        this.age = age;
    }

    /**
     * 性別を取得します。
     * @return sex 性別
     */
    public String getSex() {
        return sex;
    }

    /**
     * 性別を設定します。
     * @param sex 性別
     */
    public void setSex(String sex) {
        this.sex = sex;
    }

    /**
     * 権限を取得します。
     * @return role 権限
     */
    public Integer getRole() {
        return role;
    }

    /**
     * 権限を設定します。
     * @param role 権限
     */
    public void setRole(Integer role) {
        this.role = role;
    }

    /**
     * 作成日時を取得します。
     * @return createdAt 作成日時
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * 作成日時を設定します。
     * @param createdAt 作成日時
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * 更新日時を取得します。
     * @return updatedAt 更新日時
     */
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    /**
     * 更新日時を設定します。
     * @param updatedAt 更新日時
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * 削除日時を取得します。
     * @return deletedAt 削除日時
     */
    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    /**
     * 削除日時を設定します。
     * @param deletedAt 削除日時
     */
    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}