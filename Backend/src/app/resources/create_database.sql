# MySQL scripts for dropping existing tables and recreating the database table structure

### DROP EVERYTHING ###
# Tables/views must be dropped in reverse order due to referential constraints (foreign keys).
SET GLOBAL default_storage_engine = 'InnoDB';
DROP TABLE IF EXISTS `film_review`;
DROP TABLE IF EXISTS `film`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `map_pings`;


### TABLES ###
# Tables must be created in a particular order due to referential constraints i.e. foreign keys.

CREATE TABLE `user` (
  `id`          int(11)       NOT NULL AUTO_INCREMENT,
  `email`       varchar(256)  NOT NULL,
  `first_name`  varchar(64)   NOT NULL,
  `last_name`   varchar(64)   NOT NULL,
  `image_filename`  varchar(64)   DEFAULT NULL,
  `password`    varchar(256)  NOT NULL COMMENT 'Only store the hash here, not the actual password!',
  `auth_token`  varchar(256)  DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`email`)
);

CREATE TABLE `film` (
  `id`                          int(11)       NOT NULL AUTO_INCREMENT,
  `title`                       VARCHAR(64)   NOT NULL,
  `description`                 VARCHAR(512)  NOT NULL,
  `release_date`                DATETIME      NOT NULL,
  `image_filename`              VARCHAR(64)   NULL,
  `runtime`                     int(11)       DEFAULT NULL,
  `director_id`                 int(11)       NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`title`),
  FOREIGN KEY (`director_id`) REFERENCES `user` (`id`)

);

CREATE TABLE `film_review` (
  `id`                  int(11)         NOT NULL AUTO_INCREMENT,
  `film_id`             int(11)         NOT NULL,
  `user_id`             int(11)         NOT NULL,
  `rating`              int(11)         NOT NULL,
  `review`              VARCHAR(512)    NULL,
  `timestamp`           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`film_id`, `user_id`),
  FOREIGN KEY (`user_id`)   REFERENCES `user` (`id`),
  FOREIGN KEY (`film_id`)   REFERENCES `film` (`id`) ON DELETE CASCADE
);

CREATE TABLE `map_pings` (
  `id`          int(11)       NOT NULL AUTO_INCREMENT,
  `latitude`    FLOAT         NOT NULL,
  `longitude`   FLOAT         NOT NULL,
  `elevation`   FLOAT         NOT NULL,
  `velocity`    FLOAT         NOT NULL,
  `text_message`VARCHAR(512)  NULL,
  `timestamp`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`timestamp`)
);