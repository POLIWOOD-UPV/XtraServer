CREATE DATABASE IF NOT EXISTS `xtrachallenge25`;

USE `xtrachallenge25`;

DROP TABLE IF EXISTS `universidades`;

CREATE TABLE `universidades` (
  `acr` varchar(6) NOT NULL,
  `name` varchar(50) NOT NULL,
  `pais` char(2) NOT NULL,
  `logo` varchar(50) NOT NULL,
  `acad` boolean NOT NULL,
  PRIMARY KEY(`acr`)
);

DROP TABLE IF EXISTS `equipos`;

CREATE TABLE `equipos` (
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
  CONSTRAINT `FK_uni` FOREIGN KEY (`uni`) 
    REFERENCES `universidades` (`acr`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS `rondas`;

CREATE TABLE `rondas` (
  `num` tinyint unsigned NOT NULL,
  `pres` float unsigned DEFAULT NULL,
  `velv` float unsigned DEFAULT NULL,
  `actv` boolean DEFAULT false,
  `time` DATETIME DEFAULT NULL,
  PRIMARY KEY (`num`)
);

DROP TABLE IF EXISTS `puntos`;

CREATE TABLE `puntos` (
  `ronda` tinyint unsigned NOT NULL,
  `equipo` tinyint unsigned NOT NULL,
  `valor` integer DEFAULT 0,
  PRIMARY KEY (`ronda`, `equipo`),
  CONSTRAINT `FK_ronda` FOREIGN KEY (`ronda`)
    REFERENCES `rondas` (`num`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_equipo` FOREIGN KEY (`equipo`)
    REFERENCES `equipos` (`dorsal`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS `cronos`;

CREATE TABLE `cronos` (
  `ronda` tinyint unsigned NOT NULL,
  `equipo` tinyint unsigned NOT NULL,
  `tipo` char(2) NOT NULL,
  `start` DATETIME DEFAULT NULL,
  `stop` DATETIME DEFAULT NULL,
  PRIMARY KEY (`ronda`, `equipo`, `tipo`),
  CONSTRAINT `FK_ronda` FOREIGN KEY (`ronda`)
    REFERENCES `rondas` (`num`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_equipo` FOREIGN KEY (`equipo`)
    REFERENCES `equipos` (`dorsal`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS `fichas`;

CREATE TABLE `fichas` (
  `ronda` tinyint unsigned NOT NULL,
  `equipo` tinyint unsigned NOT NULL,
  `carga` float unsigned DEFAULT NULL,
  `piloto` boolean DEFAULT NULL,
  `repuestos` boolean DEFAULT NULL,
  `despegue` BIT(2) DEFAULT NULL,
  PRIMARY KEY (`ronda`, `equipo`),
  CONSTRAINT `FK_ronda` FOREIGN KEY (`ronda`)
    REFERENCES `rondas` (`num`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_equipo` FOREIGN KEY (`equipo`)
    REFERENCES `equipos` (`dorsal`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS `vuelos`;

CREATE TABLE `vuelos` (
  `ronda` tinyint unsigned NOT NULL,
  `equipo` tinyint unsigned NOT NULL,
  `nulo` boolean DEFAULT NULL,
  `aterrizaje` boolean DEFAULT NULL,
  `carga` float unsigned DEFAULT NULL,
  `altura` float unsigned DEFAULT NULL,
  PRIMARY KEY (`ronda`, `equipo`),
  CONSTRAINT `FK_ronda` FOREIGN KEY (`ronda`)
    REFERENCES `rondas` (`num`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_equipo` FOREIGN KEY (`equipo`)
    REFERENCES `equipos` (`dorsal`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);