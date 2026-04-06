/** One tile on the country stats dashboard (same shape as the legacy UK CSV rows). */
export type CountryStatMetric = {
  metric: string;
  value: string;
  reference_period: string;
  geography_used: string;
  source_name: string;
  source_url: string;
  source_publication_or_access_date: string;
  notes: string;
};
