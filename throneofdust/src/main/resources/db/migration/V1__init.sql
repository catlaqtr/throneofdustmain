-- Complete database schema for Throne of Dust
-- Create the users table (UserAccount entity)
CREATE TABLE users (
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

-- Create the roles table (Role entity)
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Create the user_roles table (Many-to-many relationship)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Create the buildings table (Building entity)
CREATE TABLE buildings (
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

-- Create the characters table (GameCharacter entity)
CREATE TABLE characters (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(60) NOT NULL,
    character_class VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IDLE',
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT characters_class_check 
    CHECK (character_class IN ('WARRIOR', 'MAGE', 'ROGUE', 'PALADIN')),
    CONSTRAINT characters_status_check 
    CHECK (status IN ('IDLE', 'TRAINING', 'RAIDING', 'DEAD')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create the character_traits table (ElementCollection for GameCharacter)
CREATE TABLE character_traits (
    character_id BIGINT NOT NULL,
    trait VARCHAR(30) NOT NULL,
    PRIMARY KEY (character_id, trait),
    FOREIGN KEY (character_id) REFERENCES characters(id)
);

-- Create the raids table (Raid entity)
CREATE TABLE raids (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    map VARCHAR(40) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    ally_mode BOOLEAN NOT NULL DEFAULT FALSE,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    success BOOLEAN,
    loot_gold INTEGER,
    loot_scrap INTEGER,
    betrayal_occurred BOOLEAN,
    extraction_success BOOLEAN,
    casualties INTEGER,
    CONSTRAINT raids_map_check 
    CHECK (map IN ('EASY', 'MEDIUM', 'HARD', 'NIGHTMARE')),
    CONSTRAINT raids_status_check 
    CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'FAILED')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create the raid_members table (Many-to-many relationship)
CREATE TABLE raid_members (
    raid_id BIGINT NOT NULL,
    character_id BIGINT NOT NULL,
    PRIMARY KEY (raid_id, character_id),
    FOREIGN KEY (raid_id) REFERENCES raids(id),
    FOREIGN KEY (character_id) REFERENCES characters(id)
);

-- Insert default roles
INSERT INTO roles (name) VALUES ('USER');
INSERT INTO roles (name) VALUES ('ADMIN');

