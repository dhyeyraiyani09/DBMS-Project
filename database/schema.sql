CREATE DATABASE IF NOT EXISTS index_recommendation_engine;
USE index_recommendation_engine;

CREATE TABLE IF NOT EXISTS schemas_def (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tables_def (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schema_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (schema_id) REFERENCES schemas_def(id) ON DELETE CASCADE,
    UNIQUE (schema_id, name)
);

CREATE TABLE IF NOT EXISTS columns_def (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    nullable BOOLEAN DEFAULT TRUE,
    default_value VARCHAR(255),
    is_primary_key BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (table_id) REFERENCES tables_def(id) ON DELETE CASCADE,
    UNIQUE (table_id, name)
);

CREATE TABLE IF NOT EXISTS foreign_keys_def (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_id INT NOT NULL,
    column_id INT NOT NULL,
    ref_table_id INT NOT NULL,
    ref_column_id INT NOT NULL,
    FOREIGN KEY (table_id) REFERENCES tables_def(id) ON DELETE CASCADE,
    FOREIGN KEY (column_id) REFERENCES columns_def(id) ON DELETE CASCADE,
    FOREIGN KEY (ref_table_id) REFERENCES tables_def(id) ON DELETE CASCADE,
    FOREIGN KEY (ref_column_id) REFERENCES columns_def(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS indexes_def (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    index_type VARCHAR(50) DEFAULT 'BTREE',
    is_unique BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (table_id) REFERENCES tables_def(id) ON DELETE CASCADE,
    UNIQUE (table_id, name)
);

CREATE TABLE IF NOT EXISTS index_columns_def (
    id INT AUTO_INCREMENT PRIMARY KEY,
    index_id INT NOT NULL,
    column_id INT NOT NULL,
    seq_in_index INT NOT NULL,
    FOREIGN KEY (index_id) REFERENCES indexes_def(id) ON DELETE CASCADE,
    FOREIGN KEY (column_id) REFERENCES columns_def(id) ON DELETE CASCADE,
    UNIQUE (index_id, seq_in_index),
    UNIQUE (index_id, column_id)
);
