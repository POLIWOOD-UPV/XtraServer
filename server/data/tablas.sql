USE `xtrachallenge25`;

CREATE TABLE IF NOT EXISTS `universidades` (
  `acr` varchar(6) NOT NULL,
  `name` varchar(50) NOT NULL,
  `pais` char(2) NOT NULL,
  `logo` varchar(50) NOT NULL,
  `acad` BIT(1) NOT NULL,
  PRIMARY KEY (`acr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  CONSTRAINT `FK_uni` FOREIGN KEY (`uni`) 
    REFERENCES `universidades` (`acr`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `rondas` (
  `num` tinyint unsigned NOT NULL,
  `pres` float unsigned DEFAULT NULL,
  `velv` float unsigned DEFAULT NULL,
  `actv` BIT(1) DEFAULT 0,
  `time` DATETIME DEFAULT NULL,
  PRIMARY KEY (`num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `puntos` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `cronos` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `fichas` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `vuelos` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
