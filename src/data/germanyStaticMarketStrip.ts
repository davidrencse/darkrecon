/**
 * Static Germany / DAX-style strip — no network calls.
 * 
 */

export type GermanyStockStripRow = {
  ticker: string;
  companyName: string;
  priceEur: number;
  changeEur: number;
  changePercent: number;
  highlight?: string;
  /** Seven closing values (oldest → newest), last = priceEur */
  history: { close: number }[];
};

function buildWeekSpark(last: number, changePercent: number, phase: number): { close: number }[] {
  const prev = last / (1 + changePercent / 100);
  const out: { close: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    let v = prev + (last - prev) * t;
    v += Math.sin(i * 2.1 + phase) * 0.0038 * last;
    out.push({ close: Math.round(v * 100) / 100 });
  }
  out[6] = { close: Math.round(last * 100) / 100 };
  return out;
}

function row(
  ticker: string,
  companyName: string,
  priceEur: number,
  changeEur: number,
  changePercent: number,
  highlight?: string,
): GermanyStockStripRow {
  return {
    ticker,
    companyName,
    priceEur,
    changeEur,
    changePercent,
    highlight,
    history: buildWeekSpark(priceEur, changePercent, ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 0.01),
  };
}

/** Illustrative snapshot — not a live feed. */
export const GERMANY_STATIC_MARKET_STRIP: GermanyStockStripRow[] = [
  row(
    'SAP.DE',
    'SAP SE',
    156.24,
    4.58,
    3.02,
    'Strong session; closed near 156–157 range.',
  ),
  row('SIE.DE', 'Siemens AG', 247.65, 8.05, 3.36, 'Solid gain.'),
  row('ALV.DE', 'Allianz SE', 390.0, 4.1, 1.06, 'Around 386–390 recently.'),
  row(
    'ENR.DE',
    'Siemens Energy AG',
    167.22,
    -2.53,
    -1.52,
    'Volatile; recent range about 164–170 €.',
  ),
  row('DTE.DE', 'Deutsche Telekom AG', 29.59, 0.48, 1.65, 'Steady telecom performer.'),
  row('AIR.DE', 'Airbus SE', 173.68, 1.9, 1.11, 'Good session.'),
  row(
    'MUV2.DE',
    'Munich Re (Münchener Rück)',
    522.4,
    2.15,
    0.41,
    'Large reinsurer; typically less volatile than cyclicals.',
  ),
  row(
    'IFX.DE',
    'Infineon Technologies AG',
    46.77,
    0.49,
    1.1,
    'Semis; recent band roughly 45–48 €.',
  ),
  row(
    'DBK.DE',
    'Deutsche Bank AG',
    28.48,
    0.07,
    0.23,
    'Around mid-28 € handle.',
  ),
  row(
    'MBG.DE',
    'Mercedes-Benz Group AG',
    58.85,
    0.52,
    0.89,
    'Premium autos; illustrative snapshot level.',
  ),
  row(
    'RHM.DE',
    'Rheinmetall AG',
    1500.8,
    -2.0,
    -0.13,
    'High-priced defence name; tight daily range.',
  ),
  row('BAS.DE', 'BASF SE', 52.77, -0.64, -1.2, 'Chemicals; slight decline.'),
  row(
    'BAYN.DE',
    'Bayer AG',
    26.94,
    -0.18,
    -0.66,
    'Pharma / crop science; illustrative print.',
  ),
  row('ADS.DE', 'Adidas AG', 146.4, 4.55, 3.21, 'Strong consumer gain.'),
  row('EOAN.DE', 'E.ON SE', 18.8, -0.41, -2.13, 'Utilities; softer recent print.'),
  row(
    'X03G.DE',
    'Xtrackers Germany Govt Bond UCITS ETF',
    175.18,
    0.95,
    0.55,
    'Bund-heavy ETF proxy; relatively stable.',
  ),
  row('VOW3.DE', 'Volkswagen AG (Vz.)', 102.3, 1.25, 1.24, 'Volume OEM; diversified brands.'),
  row('HEI.DE', 'Heidelberg Materials AG', 53.2, -0.35, -0.65, 'Cement / building materials.'),
  row('MRK.DE', 'Merck KGaA', 124.6, 0.85, 0.69, 'Healthcare / life science.'),
  row('SHL.DE', 'Siemens Healthineers AG', 21.45, 0.22, 1.04, 'Medtech spin-off complex.'),
  row('LHA.DE', 'Deutsche Lufthansa AG', 8.42, -0.03, -0.35, 'Airline; equity is cyclical.'),
  row('CON.DE', 'Continental AG', 61.1, 0.55, 0.91, 'Tyres / automotive tech.'),
  row('SY1.DE', 'Symrise AG', 86.75, -0.45, -0.52, 'Flavours & fragrances.'),
  row('ZAL.DE', 'Zalando SE', 27.55, 0.35, 1.29, 'E-commerce fashion.'),
  row('P911.DE', 'Dr. Ing. h.c. F. Porsche AG', 41.85, 0.65, 1.58, 'Luxury autos listing.'),
  row('G24.DE', 'Scout24 SE', 83.9, 0.4, 0.48, 'Digital classifieds / real estate verticals.'),
];
