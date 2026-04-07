/**
 * Maps `flag-of-*.png` ids to ISO 3166-1 alpha-3 codes present in
 * `Assets/Data/centralized_merged_country_stats.csv` (or legacy screenshot CSV).
 */
export const FLAG_ID_TO_ISO3: Record<string, string> = {
  'flag-of-Australia.png': 'AUS',
  'flag-of-Austria.png': 'AUT',
  'flag-of-Canada.png': 'CAN',
  'flag-of-Belarus.png': 'BLR',
  'flag-of-Belgium.png': 'BEL',
  'flag-of-Bosnia-Herzegovina.png': 'BIH',
  'flag-of-Bulgaria.png': 'BGR',
  'flag-of-Croatia.png': 'HRV',
  'flag-of-Cyprus.png': 'CYP',
  'flag-of-Czech-Republic.png': 'CZE',
  'flag-of-Denmark.png': 'DNK',
  'flag-of-Estonia.png': 'EST',
  'flag-of-Finland.png': 'FIN',
  'flag-of-France.png': 'FRA',
  'flag-of-Germany.png': 'DEU',
  'flag-of-Greece.png': 'GRC',
  'flag-of-Hungary.png': 'HUN',
  'flag-of-Iceland.png': 'ISL',
  'flag-of-Ireland.png': 'IRL',
  'flag-of-Italy.png': 'ITA',
  'flag-of-Latvia.png': 'LVA',
  'flag-of-Liechtenstein.png': 'LIE',
  'flag-of-Lithuania.png': 'LTU',
  'flag-of-Luxembourg.png': 'LUX',
  'flag-of-Malta.png': 'MLT',
  'flag-of-Moldova.png': 'MDA',
  'flag-of-Monaco.png': 'MCO',
  'flag-of-Montenegro.png': 'MNE',
  'flag-of-Netherlands.png': 'NLD',
  'flag-of-New-Zealand.png': 'NZL',
  'flag-of-Norway.png': 'NOR',
  'flag-of-Poland.png': 'POL',
  'flag-of-Portugal.png': 'PRT',
  'flag-of-Romania.png': 'ROU',
  'flag-of-Russia.png': 'RUS',
  'flag-of-Serbia.png': 'SRB',
  'flag-of-Slovakia.png': 'SVK',
  'flag-of-Slovenia.png': 'SVN',
  'flag-of-Spain.png': 'ESP',
  'flag-of-Sweden.png': 'SWE',
  'flag-of-Switzerland.png': 'CHE',
  'flag-of-Ukraine.png': 'UKR',
  'flag-of-United-Kingdom.png': 'GBR',
  'flag-of-United-States.png': 'USA',
  'flag-of-United-States-of-America.png': 'USA',
  'flag-of-USA.png': 'USA',
};

export function getIso3ForFlagId(flagId: string): string | undefined {
  return FLAG_ID_TO_ISO3[flagId];
}

export function flagIdHasCountryStats(flagId: string): boolean {
  return flagId in FLAG_ID_TO_ISO3;
}
