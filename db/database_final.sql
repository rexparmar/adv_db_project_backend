-- Create the main database/schema for the project
CREATE DATABASE gps_project
  DEFAULT CHARACTER SET utf8mb4           
  COLLATE utf8mb4_unicode_ci;
-- Supports all character


-- Create a separate database user for the backend
CREATE USER 'gps_app'@'localhost'
IDENTIFIED BY 'admin'; 
-- Password, somthing everyone can remember


-- Grant CRUD permissions on your project DB
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER
ON gps_project.*
TO 'gps_app'@'localhost';
FLUSH PRIVILEGES;
-- Backend connects as gps_app, not root


-- Table Creation, Main GPS data table
USE gps_project;
CREATE TABLE locations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,      
  address VARCHAR(255),               
  latitude DECIMAL(9,6) NOT NULL,    
  longitude DECIMAL(9,6) NOT NULL,   
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for fast geolocation queries
CREATE INDEX idx_locations_lat_lng 
ON locations(latitude, longitude);



-- Sample Data insertion 
INSERT INTO locations (name, address, latitude, longitude)
VALUES
('Algonquin College', '1385 Woodroffe Ave, Ottawa', 45.3499, -75.7570),
('Parliament Hill', '111 Wellington St, Ottawa', 45.4236, -75.7009),
('Rideau Centre', '50 Rideau St, Ottawa', 45.4256, -75.6910);
SELECT * FROM locations;
SELECT * FROM home_address;
-- (New added by Rex) Places cache data to reduce API costs 
CREATE TABLE places_cache (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  place_name VARCHAR(150),
  place_type VARCHAR(50),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  google_place_id VARCHAR(100),
  travel_time_seconds INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from places_cache;

CREATE INDEX idx_cache_type ON places_cache(place_type);

-- (New Added by Rex) DB to save the present address of user
CREATE TABLE home_address (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  address VARCHAR(255),
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


