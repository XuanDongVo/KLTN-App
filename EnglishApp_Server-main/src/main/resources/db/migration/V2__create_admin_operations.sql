CREATE TABLE IF NOT EXISTS users (
    id BINARY(16) NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    total_score BIGINT,
    role TINYINT NOT NULL,
    verified BIT(1) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email)
);

ALTER TABLE users ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);
ALTER TABLE users ADD COLUMN last_login_at DATETIME(6) NULL;

CREATE TABLE admin_media_assets (
    id BIGINT NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(255) NOT NULL,
    secure_url VARCHAR(700) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(80) NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    bytes BIGINT NOT NULL,
    created_by BINARY(16) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_admin_media_public_id UNIQUE (public_id)
);

CREATE INDEX idx_admin_media_created_at ON admin_media_assets (created_at);

CREATE TABLE admin_audit_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    admin_user_id BINARY(16) NOT NULL,
    action_code VARCHAR(80) NOT NULL,
    target_type VARCHAR(80) NOT NULL,
    target_id VARCHAR(100),
    details VARCHAR(1000),
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id)
);

CREATE INDEX idx_admin_audit_created_at ON admin_audit_logs (created_at);
