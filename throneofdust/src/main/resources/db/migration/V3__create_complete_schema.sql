-- Create complete database schema
-- Create the buildings table
CREATE TABLE IF NOT EXISTS buildings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    last_collected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_action_at TIMESTAMP,
    recruits_count INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT buildings_type_check 
    CHECK (type IN ('LUMBER_MILL', 'QUARRY', 'MINE', 'TREASURY', 'STOREHOUSE', 'TOWN_HALL', 'TRAINING_YARD', 'RADAR')),
    CONSTRAINT uk_user_building_type UNIQUE (user_id, type),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create the characters table
CREATE TABLE IF NOT EXISTS characters (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(50) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    attack INTEGER NOT NULL DEFAULT 0,
    defense INTEGER NOT NULL DEFAULT 0,
    intelligence INTEGER NOT NULL DEFAULT 0,
    agility INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'IDLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT characters_class_check 
    CHECK (class IN ('WARRIOR', 'MAGE', 'ROGUE', 'PALADIN')),
    CONSTRAINT characters_status_check 
    CHECK (status IN ('IDLE', 'TRAINING', 'RAIDING', 'DEAD')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create the raids table
CREATE TABLE IF NOT EXISTS raids (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    character_id BIGINT NOT NULL,
    map_difficulty VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    rewards_claimed BOOLEAN DEFAULT FALSE,
    CONSTRAINT raids_difficulty_check 
    CHECK (map_difficulty IN ('EASY', 'MEDIUM', 'HARD', 'NIGHTMARE')),
    CONSTRAINT raids_status_check 
    CHECK (status IN ('ACTIVE', 'COMPLETED', 'FAILED')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (character_id) REFERENCES characters(id)
);

-- Create the users table (matches UserAccount entity)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    wood INTEGER NOT NULL DEFAULT 60,
    stone INTEGER NOT NULL DEFAULT 50,
    scrap INTEGER NOT NULL DEFAULT 30,
    gold INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_collected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Create the user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Insert default roles
INSERT INTO roles (name) VALUES ('USER') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;
