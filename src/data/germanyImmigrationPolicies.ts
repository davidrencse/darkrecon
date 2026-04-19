export type GermanyImmigrationPolicyArea = {
  id: string;
  title: string;
  current: string;
  details: string;
  impact: string;
  source: string;
};

export const GERMANY_IMMIGRATION_POLICIES_SUBSECTION_COUNT = 11;

export const GERMANY_IMMIGRATION_POLICY_CONTEXT = {
  headline: 'Germany — immigration policy overview',
  period: 'April 2026',
  government: 'Chancellor Friedrich Merz · CDU/CSU–SPD coalition',
  summary:
    'A sharp “Migrationswende”: stricter border controls, faster deportations, tighter family reunification, higher integration bars, and full EU asylum pact alignment. Asylum first-time claims fell sharply in 2025; national measures add to EU rules.',
};

export const GERMANY_IMMIGRATION_POLICY_AREAS: readonly GermanyImmigrationPolicyArea[] = [
  {
    id: 'border',
    title: 'Border control & enforcement',
    current:
      'Systematic border checks with neighbours; asylum seekers may be refused at the border when another EU state is Dublin-responsible.',
    details: 'National checks permanent; irregular entries rejected with EU coordination.',
    impact: 'Large drop in irregular entries.',
    source: 'Coalition agreement 2025 (e.g. Reuters 9 Apr 2025); Federal Interior Ministry (BMI).',
  },
  {
    id: 'asylum',
    title: 'Asylum & refugee policy',
    current: 'Faster, stricter asylum; CEAS/GEAS from Jun 2026, including secondary-migration centres.',
    details: '~113k first-time claims in 2025 (about half prior level); faster decisions, more rejections, expanded safe-country lists.',
    impact: 'Fewer new claims; emphasis on first EU country of entry.',
    source: 'BMI press (4 Jan 2026); EU GEAS implementation law (30 Jan 2026).',
  },
  {
    id: 'legal',
    title: 'Legal migration pathways',
    current: 'Skilled migration first; new “Work and Stay Agency” to streamline work visas and EU Blue Card.',
    details: 'Stronger points-style elements for highly qualified staff; faster tracks for shortage occupations.',
    impact: 'More targeted labour intake; less low-skilled migration.',
    source: 'Coalition agreement 2025; The Local (planned 2026 changes).',
  },
  {
    id: 'family',
    title: 'Family reunification',
    current: 'Two-year suspension for subsidiary protection (to Mar 2028); only narrow humanitarian exceptions.',
    details: 'Refugee family reunion still possible but stricter income and housing tests.',
    impact: 'Major restriction across tens of thousands of cases.',
    source: 'Bundestag vote (1 Apr 2026); coalition / VisaHQ summaries.',
  },
  {
    id: 'citizenship',
    title: 'Citizenship & naturalization',
    current: '3-year “Turbo-Einbürgerung” ended; five years’ residence minimum for all.',
    details: 'Dual citizenship still allowed; B2 German and self-sufficiency tests tightened; fast track ended 30 Oct 2025.',
    impact: 'Citizenship slower and harder.',
    source: 'Sixth Citizenship Law amendment (Bundesregierung Oct 2025); EC Home Affairs note (11 Dec 2025).',
  },
  {
    id: 'integration',
    title: 'Integration requirements',
    current: 'Mandatory B2 German and self-sufficiency proof for long-term stay and naturalization.',
    details: 'Integration courses and civics tests enforced more strictly; failure can block permanent status.',
    impact: '“Successful integration” framed as a precondition to remain.',
    source: 'Coalition agreement 2025; citizenship-law changes.',
  },
  {
    id: 'deportation',
    title: 'Deportation & removal',
    current: 'Expanded returns, including to Syria and Afghanistan (initial focus: crime and security cases).',
    details: '~20% more deportations in 2025; EU return hubs and joint ops; longer pre-removal detention.',
    impact: 'More enforced returns; high political contention.',
    source: 'BAMF / Interior reports 2025–26; EU return-hubs package (Mar 2026).',
  },
  {
    id: 'labour',
    title: 'Labour migration & work rights',
    current: 'Blue Card + Work and Stay Agency; job offer usually still required.',
    details: 'Easier for qualified professionals; low-skilled routes stay narrow.',
    impact: 'Shift from asylum routes toward economic migration.',
    source: 'Coalition agreement 2025; agency plans.',
  },
  {
    id: 'permanent',
    title: 'Permanent residence',
    current: 'Tied to integration outcomes (language + self-sufficiency), especially vs welfare use.',
    details: 'Typically after 5 years lawful stay plus integration proof; stricter if on benefits.',
    impact: 'Clearer “earned” path to long-term residence.',
    source: 'Residence Act (AufenthG) changes via 2025 coalition deal.',
  },
  {
    id: 'rights',
    title: 'Anti-discrimination & rights',
    current: 'AGG and core equality law remain; newer arrivals face tighter welfare and service access.',
    details: 'Temporary / subsidiary protection: reduced benefits and family reunion scope.',
    impact: 'Critics cite disproportionate burdens; government cites fairness and integration.',
    source: 'AGG; 2025–26 migration-package restrictions.',
  },
];
