CREATE TABLE curriculum_versions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    level_code VARCHAR(40) NOT NULL,
    version_code VARCHAR(80) NOT NULL,
    title VARCHAR(180) NOT NULL,
    description VARCHAR(1000),
    lifecycle_status VARCHAR(20) NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    source_manifest_json LONGTEXT NOT NULL,
    imported_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_curriculum_version_code UNIQUE (version_code)
);

CREATE TABLE learning_units (
    id BIGINT NOT NULL AUTO_INCREMENT,
    curriculum_version_id BIGINT NOT NULL,
    code VARCHAR(80) NOT NULL,
    title VARCHAR(180) NOT NULL,
    description VARCHAR(1000),
    cover_image_path VARCHAR(500),
    cover_image_width INT,
    cover_image_height INT,
    cover_image_alt VARCHAR(300),
    order_index INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_learning_unit_version_code UNIQUE (curriculum_version_id, code),
    CONSTRAINT fk_learning_unit_version FOREIGN KEY (curriculum_version_id) REFERENCES curriculum_versions (id)
);

CREATE TABLE lessons (
    id BIGINT NOT NULL AUTO_INCREMENT,
    learning_unit_id BIGINT NOT NULL,
    code VARCHAR(80) NOT NULL,
    title VARCHAR(180) NOT NULL,
    objective VARCHAR(1000) NOT NULL,
    cover_image_path VARCHAR(500),
    cover_image_width INT,
    cover_image_height INT,
    cover_image_alt VARCHAR(300),
    order_index INT NOT NULL,
    estimated_minutes INT NOT NULL,
    xp_reward INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_lesson_unit_code UNIQUE (learning_unit_id, code),
    CONSTRAINT fk_lesson_unit FOREIGN KEY (learning_unit_id) REFERENCES learning_units (id)
);

CREATE TABLE learning_activities (
    id BIGINT NOT NULL AUTO_INCREMENT,
    lesson_id BIGINT NOT NULL,
    code VARCHAR(100) NOT NULL,
    activity_type VARCHAR(40) NOT NULL,
    activity_stage VARCHAR(20) NOT NULL,
    order_index INT NOT NULL,
    prompt_text VARCHAR(1000) NOT NULL,
    instruction_text VARCHAR(1000),
    content_json LONGTEXT NOT NULL,
    answer_json LONGTEXT NOT NULL,
    source_refs_json LONGTEXT NOT NULL,
    xp_reward INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_activity_lesson_code UNIQUE (lesson_id, code),
    CONSTRAINT fk_activity_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id)
);

CREATE TABLE lesson_sessions (
    id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    lesson_id BIGINT NOT NULL,
    session_status VARCHAR(20) NOT NULL,
    current_activity_index INT NOT NULL,
    total_attempts INT NOT NULL,
    correct_attempts INT NOT NULL,
    hearts_started INT NOT NULL,
    hearts_remaining INT NOT NULL,
    xp_earned INT NOT NULL,
    started_at DATETIME(6) NOT NULL,
    finished_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_session_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id)
);

CREATE INDEX idx_lesson_sessions_user ON lesson_sessions (user_id, started_at);

CREATE TABLE activity_attempts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    session_id BINARY(16) NOT NULL,
    activity_id BIGINT NOT NULL,
    submitted_answer_json LONGTEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    score INT NOT NULL,
    feedback VARCHAR(500),
    attempted_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_attempt_session FOREIGN KEY (session_id) REFERENCES lesson_sessions (id),
    CONSTRAINT fk_attempt_activity FOREIGN KEY (activity_id) REFERENCES learning_activities (id)
);

CREATE INDEX idx_activity_attempts_session ON activity_attempts (session_id, attempted_at);

CREATE TABLE learner_lesson_progress (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BINARY(16) NOT NULL,
    lesson_code VARCHAR(80) NOT NULL,
    progress_status VARCHAR(20) NOT NULL,
    best_score INT NOT NULL,
    stars INT NOT NULL,
    completion_count INT NOT NULL,
    first_completed_at DATETIME(6),
    last_completed_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_progress_user_lesson UNIQUE (user_id, lesson_code)
);
