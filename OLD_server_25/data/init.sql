CREATE DATABASE IF NOT EXISTS `xtrachallenge25`;

USE `xtrachallenge25`;

CREATE TABLE IF NOT EXISTS `universidades` (
  `acr` varchar(6) NOT NULL,
  `name` varchar(50) NOT NULL,
  `pais` char(2) NOT NULL,
  `logo` varchar(50) NOT NULL,
  `acad` boolean NOT NULL,
  PRIMARY KEY(`acr`)
);

CREATE TABLE IF NOT EXISTS `equipos` (
  `dorsal` tinyint unsigned NOT NULL,
  `name` varchar(50) NOT NULL,
  `acr` varchar(5) NOT NULL,
  `acad` boolean NOT NULL,
  `uni` varchar(6) NOT NULL,
  `miembros` tinyint unsigned NULL,
  `lider` varchar(50) NOT NULL,
  `piloto` varchar(50) NOT NULL,
  `foto` varchar(50) NOT NULL,
  `logo` varchar(50) NOT NULL,
  PRIMARY KEY (`dorsal`),
  CONSTRAINT `FK_uni_equipos` FOREIGN KEY (`uni`) 
    REFERENCES `universidades` (`acr`)
);

CREATE TABLE IF NOT EXISTS `rondas` (
  `num` tinyint unsigned NOT NULL,
  `pres` float unsigned DEFAULT NULL,
  `velv` float unsigned DEFAULT NULL,
  `actv` boolean DEFAULT false,
  `time` DATETIME DEFAULT NULL,
  PRIMARY KEY (`num`)
);

CREATE TABLE IF NOT EXISTS `puntos` (
  `ronda` tinyint unsigned NOT NULL,
  `equipo` tinyint unsigned NOT NULL,
  `valor` integer DEFAULT 0,
  PRIMARY KEY (`ronda`, `equipo`),
  CONSTRAINT `FK_ronda_puntos` FOREIGN KEY (`ronda`)
    REFERENCES `rondas` (`num`),
  CONSTRAINT `FK_equipo_puntos` FOREIGN KEY (`equipo`)
    REFERENCES `equipos` (`dorsal`)
);

CREATE TABLE IF NOT EXISTS `cronos` (
  `ronda` tinyint unsigned NOT NULL,
  `equipo` tinyint unsigned NOT NULL,
  `tipo` char(4) NOT NULL,
  `start` bigint DEFAULT 0,
  `stop` bigint DEFAULT 0,
  PRIMARY KEY (`ronda`, `equipo`, `tipo`),
  CONSTRAINT `FK_ronda_cronos` FOREIGN KEY (`ronda`)
    REFERENCES `rondas` (`num`),
  CONSTRAINT `FK_equipo_cronos` FOREIGN KEY (`equipo`)
    REFERENCES `equipos` (`dorsal`)
);

CREATE TABLE IF NOT EXISTS `fichas` (
  `ronda` tinyint unsigned NOT NULL,
  `equipo` tinyint unsigned NOT NULL,
  `carga` float unsigned DEFAULT NULL,
  `piloto` boolean DEFAULT NULL,
  `repuestos` boolean DEFAULT NULL,
  `despegue` BIT(2) DEFAULT NULL,
  PRIMARY KEY (`ronda`, `equipo`),
  CONSTRAINT `FK_ronda_fichas` FOREIGN KEY (`ronda`)
    REFERENCES `rondas` (`num`),
  CONSTRAINT `FK_equipo_fichas` FOREIGN KEY (`equipo`)
    REFERENCES `equipos` (`dorsal`)
);

CREATE TABLE IF NOT EXISTS `vuelos` (
  `ronda` tinyint unsigned NOT NULL,
  `equipo` tinyint unsigned NOT NULL,
  `nulo` boolean DEFAULT NULL,
  `aterrizaje` boolean DEFAULT NULL,
  `carga` float unsigned DEFAULT NULL,
  `altura` float unsigned DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  PRIMARY KEY (`ronda`, `equipo`),
  CONSTRAINT `FK_ronda_vuelos` FOREIGN KEY (`ronda`)
    REFERENCES `rondas` (`num`),
  CONSTRAINT `FK_equipo_vuelos` FOREIGN KEY (`equipo`)
    REFERENCES `equipos` (`dorsal`)
);

CREATE TABLE IF NOT EXISTS `staff` (
  `num` TINYINT UNSIGNED NOT NULL,
  `nombre` VARCHAR(50) NOT NULL,
  `abreviacion` VARCHAR(10) NOT NULL,
  `puesto` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`abreviacion`)
);

CREATE TABLE IF NOT EXISTS `tareas` (
  `num` TINYINT UNSIGNED NOT NULL,
  `tarea` VARCHAR(100) NOT NULL,
  `inicio` DATETIME,
  `final` DATETIME,
  `horario` VARCHAR(10),
  `tipo` VARCHAR(50),
  PRIMARY KEY (`num`)
);

CREATE TABLE IF NOT EXISTS `recursos` (
  `num` TINYINT UNSIGNED NOT NULL,
  `staff` VARCHAR(10) NOT NULL,
  `prioridad` TINYINT UNSIGNED NOT NULL,
  `tarea` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`num`)
);

CREATE TABLE IF NOT EXISTS `facts` (
  `team` tinyint unsigned NOT NULL,
  `weight` float unsigned DEFAULT NULL,
  `span` float unsigned DEFAULT NULL,
  `fact` text DEFAULT NULL,
  PRIMARY KEY (`team`),
  CONSTRAINT `FK_equipo_facts` FOREIGN KEY (`team`)
    REFERENCES `equipos` (`dorsal`)
);
