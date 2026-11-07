CREATE EXTENSION IF NOT EXISTS pgcrypto; -- crypt() za bcrypt gesla v testnih podatkih

CREATE TYPE vloga_uporabnika AS ENUM ('clan', 'skrbnik', 'admin');
CREATE TYPE status_opreme AS ENUM ('na_voljo', 'v_popravilu', 'izgubljena', 'arhivirana');
CREATE TYPE status_izposoje AS ENUM ('zahtevana', 'odobrena', 'zavrnjena', 'preklicana', 'izdana', 'vrnjena');
CREATE TYPE tip_zapisa AS ENUM ('izdaja', 'vrnitev');
CREATE TYPE ocena_stanja AS ENUM ('brez_poskodb', 'manjse_poskodbe', 'poskodovano');

CREATE TABLE uporabnik (
    id           int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email        varchar(255) NOT NULL UNIQUE,
    ime          varchar(100) NOT NULL,
    priimek      varchar(100) NOT NULL,
    geslo_hash   varchar(255) NOT NULL,
    vloga        vloga_uporabnika NOT NULL DEFAULT 'clan',
    aktiven      boolean NOT NULL DEFAULT true,
    ustvarjen_ob timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE kategorija (
    id    int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    naziv varchar(100) NOT NULL UNIQUE,
    opis  text
);

CREATE TABLE oprema (
    id            int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kategorija_id int NOT NULL REFERENCES kategorija(id),
    naziv         varchar(200) NOT NULL,
    inventarna_st varchar(50) NOT NULL UNIQUE,
    opis          text,
    status        status_opreme NOT NULL DEFAULT 'na_voljo',
    ustvarjena_ob timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE izposoja (
    id               int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    clan_id          int NOT NULL REFERENCES uporabnik(id),
    oprema_id        int NOT NULL REFERENCES oprema(id),
    odobril_id       int REFERENCES uporabnik(id),
    termin_od        timestamptz NOT NULL,
    termin_do        timestamptz NOT NULL,
    namen            text NOT NULL,
    status           status_izposoje NOT NULL DEFAULT 'zahtevana',
    razlog_zavrnitve text,
    izdana_ob        timestamptz,
    vrnjena_ob       timestamptz,
    ustvarjena_ob    timestamptz NOT NULL DEFAULT now(),
    CHECK (termin_do > termin_od),
    CHECK (length(namen) >= 5),
    -- zavrnitev mora imeti razlog
    CHECK (status <> 'zavrnjena' OR razlog_zavrnitve IS NOT NULL),
    -- izdana in vrnjena izposoja morata imeti čas izdaje, vrnjena tudi čas vrnitve
    CHECK (status NOT IN ('izdana', 'vrnjena') OR izdana_ob IS NOT NULL),
    CHECK (status <> 'vrnjena' OR vrnjena_ob IS NOT NULL)
);

-- hitrejše iskanje prekrivanj in zamud, uporabimo zato 2 preprosta indeksa
CREATE INDEX izposoja_oprema_termin_idx ON izposoja (oprema_id, termin_od, termin_do);
CREATE INDEX izposoja_status_idx ON izposoja (status);

CREATE TABLE zapis_stanja (
    id          int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    izposoja_id int NOT NULL REFERENCES izposoja(id),
    zapisal_id  int NOT NULL REFERENCES uporabnik(id),
    tip         tip_zapisa NOT NULL,
    ocena       ocena_stanja NOT NULL,
    opomba      text,
    zapisano_ob timestamptz NOT NULL DEFAULT now(),
    UNIQUE (izposoja_id, tip)
);