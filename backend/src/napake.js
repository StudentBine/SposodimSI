// Napaka v obliki json
export class ApiNapaka extends Error {
  constructor(status, koda, sporocilo) {
    super(sporocilo);
    this.status = status;
    this.koda = koda;
  }
}

// Za neobstoječe poti
export function niNajdeno(req, res) {
  res.status(404).json({
    napaka: { koda: 'NI_NAJDENO', sporocilo: 'Pot ne obstaja' },
  });
}

// Skupen middleware za napake
export function obdelajNapako(err, req, res, next) {
  if (err instanceof ApiNapaka) {
    return res.status(err.status).json({
      napaka: { koda: err.koda, sporocilo: err.message },
    });
  }

  // Neveljaven JSON v telesu zahteve
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      napaka: { koda: 'NEVELJAVEN_JSON', sporocilo: 'Telo zahteve ni veljaven JSON' },
    });
  }

  console.error(err);
  res.status(500).json({
    napaka: { koda: 'NAPAKA_STREZNIKA', sporocilo: 'Prišlo je do napake na strežniku' },
  });
}