-- Zapisov stanja po vnosu ni mogoče spreminjati ali brisati (US-05, kriterij 4).

CREATE FUNCTION prepovej_spremembo_zapisa() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Zapisov stanja ni dovoljeno spreminjati ali brisati';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER zapis_stanja_nespremenljiv
    BEFORE UPDATE OR DELETE ON zapis_stanja
    FOR EACH ROW EXECUTE FUNCTION prepovej_spremembo_zapisa();