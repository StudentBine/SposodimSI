-- Testni podatki. def. geslo: geslo123
INSERT INTO uporabnik (email, ime, priimek, geslo_hash, vloga) VALUES
    ('admin@sposodimsi.si',   'Ana',  'Admin',   crypt('geslo123', gen_salt('bf', 10)), 'admin'),
    ('skrbnik@sposodimsi.si', 'Sašo', 'Skrbnik', crypt('geslo123', gen_salt('bf', 10)), 'skrbnik'),
    ('clan@sposodimsi.si',    'Cene', 'Član',    crypt('geslo123', gen_salt('bf', 10)), 'clan'),
    ('maja@sposodimsi.si',    'Maja', 'Novak',   crypt('geslo123', gen_salt('bf', 10)), 'clan');

INSERT INTO uporabnik (email, ime, priimek, geslo_hash, vloga, aktiven) VALUES
    ('blokiran@sposodimsi.si', 'Blaž', 'Blokiran', crypt('geslo123', gen_salt('bf', 10)), 'clan', false);

INSERT INTO kategorija (naziv, opis) VALUES
    ('Kamere',           'Fotoaparati in video kamere'),
    ('Mikrokontrolerji', 'Arduino, ESP32, Raspberry Pi'),
    ('Merilniki',        'Multimetri, osciloskopi'),
    ('Zvok',             'Mikrofoni in snemalniki');

INSERT INTO oprema (kategorija_id, naziv, inventarna_st, opis, status) VALUES
    (1, 'Canon EOS 250D',           'INV-001', 'Zrcalnorefleksni fotoaparat z objektivom 18-55', 'na_voljo'),
    (1, 'Sony ZV-1',                'INV-002', 'Kompaktna kamera za video',                       'na_voljo'),
    (1, 'GoPro Hero 9',             'INV-003', 'Akcijska kamera',                                 'v_popravilu'),
    (2, 'Arduino Uno R3',           'INV-010', NULL,                                              'na_voljo'),
    (2, 'Raspberry Pi 5 komplet',   'INV-011', 'Z napajalnikom in SD kartico',                    'na_voljo'),
    (2, 'ESP32 DevKit',             'INV-012', NULL,                                              'izgubljena'),
    (3, 'Multimeter Fluke 117',     'INV-020', NULL,                                              'na_voljo'),
    (3, 'Osciloskop Rigol DS1054Z', 'INV-021', '4-kanalni, 50 MHz',                               'na_voljo'),
    (4, 'Mikrofon Rode NT-USB',     'INV-030', NULL,                                              'na_voljo'),
    (4, 'Snemalnik Zoom H5',        'INV-031', NULL,                                              'arhivirana');

-- Izposoje v različnih stanjih (termini so relativni glede na čas zagona)
INSERT INTO izposoja (clan_id, oprema_id, odobril_id, termin_od, termin_do, namen, status, razlog_zavrnitve, izdana_ob, vrnjena_ob) VALUES
    -- čakajoč zahtevek
    (3, 1, NULL, now() + interval '2 days', now() + interval '4 days', 'Fotografiranje dogodka kluba', 'zahtevana', NULL, NULL, NULL),
    -- odobrena, še ne izdana
    (4, 2, 2, now() + interval '1 day', now() + interval '3 days', 'Snemanje predstavitvenega videa', 'odobrena', NULL, NULL, NULL),
    -- izdana in zamujena
    (3, 7, 2, now() - interval '6 days', now() - interval '2 days', 'Meritve pri laboratorijski vaji', 'izdana', NULL, now() - interval '6 days', NULL),
    -- izdana, še v roku
    (4, 5, 2, now() - interval '1 day', now() + interval '5 days', 'Projekt pri predmetu RIRS', 'izdana', NULL, now() - interval '1 day', NULL),
    -- vrnjena
    (3, 8, 2, now() - interval '20 days', now() - interval '15 days', 'Analiza signalov za seminarsko', 'vrnjena', NULL, now() - interval '20 days', now() - interval '15 days'),
    -- zavrnjena
    (4, 9, 2, now() + interval '3 days', now() + interval '5 days', 'Snemanje podcasta', 'zavrnjena', 'Mikrofon je ta teden rezerviran za klubski dogodek', NULL, NULL);

INSERT INTO zapis_stanja (izposoja_id, zapisal_id, tip, ocena, opomba, zapisano_ob) VALUES
    (3, 2, 'izdaja',  'brez_poskodb',    NULL,               now() - interval '6 days'),
    (4, 2, 'izdaja',  'brez_poskodb',    NULL,               now() - interval '1 day'),
    (5, 2, 'izdaja',  'brez_poskodb',    NULL,               now() - interval '20 days'),
    (5, 2, 'vrnitev', 'manjse_poskodbe', 'Opraskano ohišje', now() - interval '15 days');