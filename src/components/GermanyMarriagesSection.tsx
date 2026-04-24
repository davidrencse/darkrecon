import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from './ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CollapsibleFlagSection } from './CollapsibleFlagSection';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

type MarriageTrendRow = {
  year: string;
  totalMarriages: number;
  nonGermanCount: number;
  nonGermanPct: number;
  europeanCount: number;
  europeanPct: number;
  nonEuropeanCount: number;
  nonEuropeanPct: number;
  africanCount: number;
  africanPct: number;
  arabCount: number;
  arabPct: number;
  asianIndianCount: number;
  asianIndianPct: number;
};

type MarriageAggregate = {
  totalMarriages: number;
  nonGermanTotal: number;
  europeanTotal: number;
  nonEuropeanTotal: number;
  africanTotal: number;
  arabTotal: number;
  asianIndianTotal: number;
};

type LgbtUnionRow = {
  year: string;
  total: number;
  gay: number;
  lesbian: number;
  type: string;
};

const FEMALE_SERIES: readonly MarriageTrendRow[] = [
  { year: '2000', totalMarriages: 418550, nonGermanCount: 10250, nonGermanPct: 2.45, europeanCount: 7130, europeanPct: 1.7, nonEuropeanCount: 3120, nonEuropeanPct: 0.75, africanCount: 420, africanPct: 0.1, arabCount: 1850, arabPct: 0.44, asianIndianCount: 920, asianIndianPct: 0.22 },
  { year: '2001', totalMarriages: 389591, nonGermanCount: 10800, nonGermanPct: 2.77, europeanCount: 7520, europeanPct: 1.93, nonEuropeanCount: 3280, nonEuropeanPct: 0.84, africanCount: 450, africanPct: 0.12, arabCount: 1950, arabPct: 0.5, asianIndianCount: 980, asianIndianPct: 0.25 },
  { year: '2002', totalMarriages: 391963, nonGermanCount: 11300, nonGermanPct: 2.88, europeanCount: 7810, europeanPct: 1.99, nonEuropeanCount: 3450, nonEuropeanPct: 0.88, africanCount: 480, africanPct: 0.12, arabCount: 2050, arabPct: 0.52, asianIndianCount: 1050, asianIndianPct: 0.27 },
  { year: '2003', totalMarriages: 382911, nonGermanCount: 11800, nonGermanPct: 3.08, europeanCount: 8180, europeanPct: 2.14, nonEuropeanCount: 3620, nonEuropeanPct: 0.95, africanCount: 510, africanPct: 0.13, arabCount: 2150, arabPct: 0.56, asianIndianCount: 1120, asianIndianPct: 0.29 },
  { year: '2004', totalMarriages: 395992, nonGermanCount: 12400, nonGermanPct: 3.13, europeanCount: 8580, europeanPct: 2.17, nonEuropeanCount: 3820, nonEuropeanPct: 0.96, africanCount: 540, africanPct: 0.14, arabCount: 2280, arabPct: 0.58, asianIndianCount: 1190, asianIndianPct: 0.3 },
  { year: '2005', totalMarriages: 388451, nonGermanCount: 12900, nonGermanPct: 3.32, europeanCount: 8900, europeanPct: 2.29, nonEuropeanCount: 4000, nonEuropeanPct: 1.03, africanCount: 570, africanPct: 0.15, arabCount: 2380, arabPct: 0.61, asianIndianCount: 1260, asianIndianPct: 0.32 },
  { year: '2006', totalMarriages: 373681, nonGermanCount: 13500, nonGermanPct: 3.61, europeanCount: 9300, europeanPct: 2.49, nonEuropeanCount: 4200, nonEuropeanPct: 1.12, africanCount: 610, africanPct: 0.16, arabCount: 2500, arabPct: 0.67, asianIndianCount: 1340, asianIndianPct: 0.36 },
  { year: '2007', totalMarriages: 368922, nonGermanCount: 14100, nonGermanPct: 3.82, europeanCount: 9690, europeanPct: 2.63, nonEuropeanCount: 4420, nonEuropeanPct: 1.2, africanCount: 650, africanPct: 0.18, arabCount: 2630, arabPct: 0.71, asianIndianCount: 1420, asianIndianPct: 0.39 },
  { year: '2008', totalMarriages: 377055, nonGermanCount: 14800, nonGermanPct: 3.92, europeanCount: 10130, europeanPct: 2.68, nonEuropeanCount: 4670, nonEuropeanPct: 1.24, africanCount: 690, africanPct: 0.18, arabCount: 2780, arabPct: 0.74, asianIndianCount: 1510, asianIndianPct: 0.4 },
  { year: '2009', totalMarriages: 378439, nonGermanCount: 15500, nonGermanPct: 4.1, europeanCount: 10550, europeanPct: 2.79, nonEuropeanCount: 4950, nonEuropeanPct: 1.31, africanCount: 740, africanPct: 0.2, arabCount: 2950, arabPct: 0.78, asianIndianCount: 1610, asianIndianPct: 0.43 },
  { year: '2010', totalMarriages: 382047, nonGermanCount: 16200, nonGermanPct: 4.24, europeanCount: 10940, europeanPct: 2.86, nonEuropeanCount: 5260, nonEuropeanPct: 1.38, africanCount: 790, africanPct: 0.21, arabCount: 3130, arabPct: 0.82, asianIndianCount: 1720, asianIndianPct: 0.45 },
  { year: '2011', totalMarriages: 377816, nonGermanCount: 16900, nonGermanPct: 4.47, europeanCount: 11300, europeanPct: 2.99, nonEuropeanCount: 5600, nonEuropeanPct: 1.48, africanCount: 850, africanPct: 0.23, arabCount: 3320, arabPct: 0.88, asianIndianCount: 1840, asianIndianPct: 0.49 },
  { year: '2012', totalMarriages: 374000, nonGermanCount: 17600, nonGermanPct: 4.71, europeanCount: 11630, europeanPct: 3.11, nonEuropeanCount: 5970, nonEuropeanPct: 1.6, africanCount: 920, africanPct: 0.25, arabCount: 3520, arabPct: 0.94, asianIndianCount: 1970, asianIndianPct: 0.53 },
  { year: '2013', totalMarriages: 373000, nonGermanCount: 18300, nonGermanPct: 4.91, europeanCount: 11940, europeanPct: 3.2, nonEuropeanCount: 6360, nonEuropeanPct: 1.71, africanCount: 990, africanPct: 0.27, arabCount: 3730, arabPct: 1, asianIndianCount: 2110, asianIndianPct: 0.57 },
  { year: '2014', totalMarriages: 387000, nonGermanCount: 19100, nonGermanPct: 4.94, europeanCount: 12320, europeanPct: 3.18, nonEuropeanCount: 6780, nonEuropeanPct: 1.75, africanCount: 1070, africanPct: 0.28, arabCount: 3960, arabPct: 1.02, asianIndianCount: 2260, asianIndianPct: 0.58 },
  { year: '2015', totalMarriages: 400000, nonGermanCount: 19900, nonGermanPct: 4.98, europeanCount: 12660, europeanPct: 3.17, nonEuropeanCount: 7240, nonEuropeanPct: 1.81, africanCount: 1160, africanPct: 0.29, arabCount: 4210, arabPct: 1.05, asianIndianCount: 2430, asianIndianPct: 0.61 },
  { year: '2016', totalMarriages: 410000, nonGermanCount: 20800, nonGermanPct: 5.07, europeanCount: 13050, europeanPct: 3.18, nonEuropeanCount: 7750, nonEuropeanPct: 1.89, africanCount: 1260, africanPct: 0.31, arabCount: 4490, arabPct: 1.1, asianIndianCount: 2620, asianIndianPct: 0.64 },
  { year: '2017', totalMarriages: 400000, nonGermanCount: 21700, nonGermanPct: 5.43, europeanCount: 13390, europeanPct: 3.35, nonEuropeanCount: 8310, nonEuropeanPct: 2.08, africanCount: 1370, africanPct: 0.34, arabCount: 4790, arabPct: 1.2, asianIndianCount: 2830, asianIndianPct: 0.71 },
  { year: '2018', totalMarriages: 400000, nonGermanCount: 22600, nonGermanPct: 5.65, europeanCount: 13680, europeanPct: 3.42, nonEuropeanCount: 8920, nonEuropeanPct: 2.23, africanCount: 1490, africanPct: 0.37, arabCount: 5120, arabPct: 1.28, asianIndianCount: 3060, asianIndianPct: 0.77 },
  { year: '2019', totalMarriages: 400000, nonGermanCount: 23600, nonGermanPct: 5.9, europeanCount: 14020, europeanPct: 3.51, nonEuropeanCount: 9580, nonEuropeanPct: 2.4, africanCount: 1630, africanPct: 0.41, arabCount: 5480, arabPct: 1.37, asianIndianCount: 3310, asianIndianPct: 0.83 },
  { year: '2020', totalMarriages: 357785, nonGermanCount: 16849, nonGermanPct: 4.71, europeanCount: 9749, europeanPct: 2.72, nonEuropeanCount: 7120, nonEuropeanPct: 1.99, africanCount: 980, africanPct: 0.27, arabCount: 4120, arabPct: 1.15, asianIndianCount: 2890, asianIndianPct: 0.81 },
  { year: '2021', totalMarriages: 357785, nonGermanCount: 18639, nonGermanPct: 5.21, europeanCount: 10719, europeanPct: 3, nonEuropeanCount: 7920, nonEuropeanPct: 2.21, africanCount: 1120, africanPct: 0.31, arabCount: 4580, arabPct: 1.28, asianIndianCount: 3210, asianIndianPct: 0.9 },
  { year: '2022', totalMarriages: 390743, nonGermanCount: 19382, nonGermanPct: 4.96, europeanCount: 11102, europeanPct: 2.84, nonEuropeanCount: 8280, nonEuropeanPct: 2.12, africanCount: 1210, africanPct: 0.31, arabCount: 4790, arabPct: 1.23, asianIndianCount: 3380, asianIndianPct: 0.87 },
  { year: '2023', totalMarriages: 360979, nonGermanCount: 18547, nonGermanPct: 5.14, europeanCount: 10657, europeanPct: 2.95, nonEuropeanCount: 7890, nonEuropeanPct: 2.19, africanCount: 1150, africanPct: 0.32, arabCount: 4560, arabPct: 1.26, asianIndianCount: 3220, asianIndianPct: 0.89 },
  { year: '2024', totalMarriages: 349200, nonGermanCount: 18122, nonGermanPct: 5.19, europeanCount: 10442, europeanPct: 2.99, nonEuropeanCount: 7680, nonEuropeanPct: 2.2, africanCount: 1110, africanPct: 0.32, arabCount: 4430, arabPct: 1.27, asianIndianCount: 3130, asianIndianPct: 0.9 },
  { year: '2025', totalMarriages: 355000, nonGermanCount: 17900, nonGermanPct: 5.04, europeanCount: 10320, europeanPct: 2.91, nonEuropeanCount: 7580, nonEuropeanPct: 2.14, africanCount: 1090, africanPct: 0.31, arabCount: 4370, arabPct: 1.23, asianIndianCount: 3080, asianIndianPct: 0.87 },
];

const MALE_SERIES: readonly MarriageTrendRow[] = [
  { year: '2000', totalMarriages: 418550, nonGermanCount: 14800, nonGermanPct: 3.54, europeanCount: 10220, europeanPct: 2.44, nonEuropeanCount: 4580, nonEuropeanPct: 1.09, africanCount: 380, africanPct: 0.09, arabCount: 920, arabPct: 0.22, asianIndianCount: 3120, asianIndianPct: 0.75 },
  { year: '2001', totalMarriages: 389591, nonGermanCount: 15500, nonGermanPct: 3.98, europeanCount: 10680, europeanPct: 2.74, nonEuropeanCount: 4820, nonEuropeanPct: 1.24, africanCount: 410, africanPct: 0.11, arabCount: 980, arabPct: 0.25, asianIndianCount: 3310, asianIndianPct: 0.85 },
  { year: '2002', totalMarriages: 391963, nonGermanCount: 16200, nonGermanPct: 4.13, europeanCount: 11100, europeanPct: 2.83, nonEuropeanCount: 5100, nonEuropeanPct: 1.3, africanCount: 450, africanPct: 0.11, arabCount: 1050, arabPct: 0.27, asianIndianCount: 3520, asianIndianPct: 0.9 },
  { year: '2003', totalMarriages: 382911, nonGermanCount: 16900, nonGermanPct: 4.41, europeanCount: 11480, europeanPct: 3, nonEuropeanCount: 5420, nonEuropeanPct: 1.42, africanCount: 490, africanPct: 0.13, arabCount: 1130, arabPct: 0.3, asianIndianCount: 3750, asianIndianPct: 0.98 },
  { year: '2004', totalMarriages: 395992, nonGermanCount: 17700, nonGermanPct: 4.47, europeanCount: 11920, europeanPct: 3.01, nonEuropeanCount: 5780, nonEuropeanPct: 1.46, africanCount: 530, africanPct: 0.13, arabCount: 1220, arabPct: 0.31, asianIndianCount: 4010, asianIndianPct: 1.01 },
  { year: '2005', totalMarriages: 388451, nonGermanCount: 18500, nonGermanPct: 4.76, europeanCount: 12320, europeanPct: 3.17, nonEuropeanCount: 6180, nonEuropeanPct: 1.59, africanCount: 580, africanPct: 0.15, arabCount: 1320, arabPct: 0.34, asianIndianCount: 4300, asianIndianPct: 1.11 },
  { year: '2006', totalMarriages: 373681, nonGermanCount: 19400, nonGermanPct: 5.19, europeanCount: 12770, europeanPct: 3.42, nonEuropeanCount: 6630, nonEuropeanPct: 1.77, africanCount: 640, africanPct: 0.17, arabCount: 1430, arabPct: 0.38, asianIndianCount: 4620, asianIndianPct: 1.24 },
  { year: '2007', totalMarriages: 368922, nonGermanCount: 20300, nonGermanPct: 5.5, europeanCount: 13180, europeanPct: 3.57, nonEuropeanCount: 7120, nonEuropeanPct: 1.93, africanCount: 700, africanPct: 0.19, arabCount: 1550, arabPct: 0.42, asianIndianCount: 4970, asianIndianPct: 1.35 },
  { year: '2008', totalMarriages: 377055, nonGermanCount: 21300, nonGermanPct: 5.65, europeanCount: 13640, europeanPct: 3.62, nonEuropeanCount: 7660, nonEuropeanPct: 2.03, africanCount: 770, africanPct: 0.2, arabCount: 1680, arabPct: 0.45, asianIndianCount: 5350, asianIndianPct: 1.42 },
  { year: '2009', totalMarriages: 378439, nonGermanCount: 22400, nonGermanPct: 5.92, europeanCount: 14140, europeanPct: 3.74, nonEuropeanCount: 8260, nonEuropeanPct: 2.18, africanCount: 850, africanPct: 0.22, arabCount: 1830, arabPct: 0.48, asianIndianCount: 5770, asianIndianPct: 1.53 },
  { year: '2010', totalMarriages: 382047, nonGermanCount: 23600, nonGermanPct: 6.18, europeanCount: 14680, europeanPct: 3.84, nonEuropeanCount: 8920, nonEuropeanPct: 2.33, africanCount: 940, africanPct: 0.25, arabCount: 2000, arabPct: 0.52, asianIndianCount: 6230, asianIndianPct: 1.63 },
  { year: '2011', totalMarriages: 377816, nonGermanCount: 24800, nonGermanPct: 6.56, europeanCount: 15160, europeanPct: 4.01, nonEuropeanCount: 9640, nonEuropeanPct: 2.55, africanCount: 1040, africanPct: 0.28, arabCount: 2190, arabPct: 0.58, asianIndianCount: 6730, asianIndianPct: 1.78 },
  { year: '2012', totalMarriages: 374000, nonGermanCount: 26100, nonGermanPct: 6.98, europeanCount: 15670, europeanPct: 4.19, nonEuropeanCount: 10430, nonEuropeanPct: 2.79, africanCount: 1150, africanPct: 0.31, arabCount: 2400, arabPct: 0.64, asianIndianCount: 7270, asianIndianPct: 1.94 },
  { year: '2013', totalMarriages: 373000, nonGermanCount: 27500, nonGermanPct: 7.37, europeanCount: 16220, europeanPct: 4.35, nonEuropeanCount: 11280, nonEuropeanPct: 3.02, africanCount: 1270, africanPct: 0.34, arabCount: 2630, arabPct: 0.71, asianIndianCount: 7860, asianIndianPct: 2.11 },
  { year: '2014', totalMarriages: 387000, nonGermanCount: 29000, nonGermanPct: 7.49, europeanCount: 16790, europeanPct: 4.34, nonEuropeanCount: 12210, nonEuropeanPct: 3.16, africanCount: 1410, africanPct: 0.36, arabCount: 2890, arabPct: 0.75, asianIndianCount: 8500, asianIndianPct: 2.2 },
  { year: '2015', totalMarriages: 400000, nonGermanCount: 30600, nonGermanPct: 7.65, europeanCount: 17320, europeanPct: 4.33, nonEuropeanCount: 13280, nonEuropeanPct: 3.32, africanCount: 1570, africanPct: 0.39, arabCount: 3180, arabPct: 0.8, asianIndianCount: 9200, asianIndianPct: 2.3 },
  { year: '2016', totalMarriages: 410000, nonGermanCount: 32300, nonGermanPct: 7.88, europeanCount: 17830, europeanPct: 4.35, nonEuropeanCount: 14470, nonEuropeanPct: 3.53, africanCount: 1740, africanPct: 0.42, arabCount: 3500, arabPct: 0.85, asianIndianCount: 9970, asianIndianPct: 2.43 },
  { year: '2017', totalMarriages: 400000, nonGermanCount: 34100, nonGermanPct: 8.53, europeanCount: 18290, europeanPct: 4.57, nonEuropeanCount: 15810, nonEuropeanPct: 3.95, africanCount: 1930, africanPct: 0.48, arabCount: 3850, arabPct: 0.96, asianIndianCount: 10810, asianIndianPct: 2.7 },
  { year: '2018', totalMarriages: 400000, nonGermanCount: 36000, nonGermanPct: 9, europeanCount: 18720, europeanPct: 4.68, nonEuropeanCount: 17280, nonEuropeanPct: 4.32, africanCount: 2140, africanPct: 0.54, arabCount: 4240, arabPct: 1.06, asianIndianCount: 11720, asianIndianPct: 2.93 },
  { year: '2019', totalMarriages: 400000, nonGermanCount: 38100, nonGermanPct: 9.53, europeanCount: 19190, europeanPct: 4.8, nonEuropeanCount: 18910, nonEuropeanPct: 4.73, africanCount: 2380, africanPct: 0.6, arabCount: 4670, arabPct: 1.17, asianIndianCount: 12710, asianIndianPct: 3.18 },
  { year: '2020', totalMarriages: 357785, nonGermanCount: 21373, nonGermanPct: 5.97, europeanCount: 9473, europeanPct: 2.65, nonEuropeanCount: 11890, nonEuropeanPct: 3.32, africanCount: 1180, africanPct: 0.33, arabCount: 2890, arabPct: 0.81, asianIndianCount: 7120, asianIndianPct: 1.99 },
  { year: '2021', totalMarriages: 357785, nonGermanCount: 22665, nonGermanPct: 6.33, europeanCount: 9975, europeanPct: 2.79, nonEuropeanCount: 12690, nonEuropeanPct: 3.55, africanCount: 1290, africanPct: 0.36, arabCount: 3120, arabPct: 0.87, asianIndianCount: 7650, asianIndianPct: 2.14 },
  { year: '2022', totalMarriages: 390743, nonGermanCount: 22769, nonGermanPct: 5.83, europeanCount: 9959, europeanPct: 2.55, nonEuropeanCount: 12810, nonEuropeanPct: 3.28, africanCount: 1310, africanPct: 0.34, arabCount: 3160, arabPct: 0.81, asianIndianCount: 7750, asianIndianPct: 1.98 },
  { year: '2023', totalMarriages: 360979, nonGermanCount: 21890, nonGermanPct: 6.06, europeanCount: 9610, europeanPct: 2.66, nonEuropeanCount: 12280, nonEuropeanPct: 3.4, africanCount: 1240, africanPct: 0.34, arabCount: 3010, arabPct: 0.83, asianIndianCount: 7400, asianIndianPct: 2.05 },
  { year: '2024', totalMarriages: 349200, nonGermanCount: 21542, nonGermanPct: 6.17, europeanCount: 9492, europeanPct: 2.72, nonEuropeanCount: 12050, nonEuropeanPct: 3.45, africanCount: 1210, africanPct: 0.35, arabCount: 2950, arabPct: 0.84, asianIndianCount: 7240, asianIndianPct: 2.07 },
  { year: '2025', totalMarriages: 355000, nonGermanCount: 21300, nonGermanPct: 6, europeanCount: 9390, europeanPct: 2.64, nonEuropeanCount: 11910, nonEuropeanPct: 3.35, africanCount: 1190, africanPct: 0.34, arabCount: 2910, arabPct: 0.82, asianIndianCount: 7150, asianIndianPct: 2.01 },
];

const LGBT_SERIES: readonly LgbtUnionRow[] = [
  { year: '2000', total: 0, gay: 0, lesbian: 0, type: 'No legal recognition' },
  { year: '2001', total: 1400, gay: 950, lesbian: 450, type: 'Civil Partnership' },
  { year: '2002', total: 3200, gay: 2100, lesbian: 1100, type: 'Civil Partnership' },
  { year: '2003', total: 4500, gay: 2900, lesbian: 1600, type: 'Civil Partnership' },
  { year: '2004', total: 5800, gay: 3700, lesbian: 2100, type: 'Civil Partnership' },
  { year: '2005', total: 7000, gay: 4400, lesbian: 2600, type: 'Civil Partnership' },
  { year: '2006', total: 8200, gay: 5100, lesbian: 3100, type: 'Civil Partnership' },
  { year: '2007', total: 9500, gay: 5900, lesbian: 3600, type: 'Civil Partnership' },
  { year: '2008', total: 10800, gay: 6700, lesbian: 4100, type: 'Civil Partnership' },
  { year: '2009', total: 12200, gay: 7500, lesbian: 4700, type: 'Civil Partnership' },
  { year: '2010', total: 13700, gay: 8400, lesbian: 5300, type: 'Civil Partnership' },
  { year: '2011', total: 15200, gay: 9300, lesbian: 5900, type: 'Civil Partnership' },
  { year: '2012', total: 16800, gay: 10200, lesbian: 6600, type: 'Civil Partnership' },
  { year: '2013', total: 18500, gay: 11200, lesbian: 7300, type: 'Civil Partnership' },
  { year: '2014', total: 20300, gay: 12300, lesbian: 8000, type: 'Civil Partnership' },
  { year: '2015', total: 22200, gay: 13400, lesbian: 8800, type: 'Civil Partnership' },
  { year: '2016', total: 24200, gay: 14600, lesbian: 9600, type: 'Civil Partnership' },
  { year: '2017', total: 11147, gay: 6080, lesbian: 5067, type: 'Marriage (from Oct)' },
  { year: '2018', total: 21757, gay: 10686, lesbian: 11071, type: 'Marriage' },
  { year: '2019', total: 14021, gay: 6815, lesbian: 7206, type: 'Marriage' },
  { year: '2020', total: 9939, gay: 4663, lesbian: 5276, type: 'Marriage' },
  { year: '2021', total: 8710, gay: 4068, lesbian: 4642, type: 'Marriage' },
  { year: '2022', total: 10043, gay: 4664, lesbian: 5379, type: 'Marriage' },
  { year: '2023', total: 9226, gay: 4319, lesbian: 4907, type: 'Marriage' },
  { year: '2024', total: 8818, gay: 4112, lesbian: 4706, type: 'Marriage' },
  { year: '2025', total: 8600, gay: 4000, lesbian: 4600, type: 'Marriage (estimated)' },
];

const OVERVIEW_PIE_COLORS = ['#22c55e', '#f59e0b', '#60a5fa', '#c084fc', '#f43f5e', '#38bdf8'];

const FEMALE_LINE_CONFIG = {
  nonGermanPct: { label: 'German F + Non-German M', color: '#f59e0b' },
  europeanPct: { label: 'German F + European (non-German) M', color: '#22c55e' },
  nonEuropeanPct: { label: 'German F + Non-European M', color: '#60a5fa' },
  africanPct: { label: 'German F + African M', color: '#c084fc' },
  arabPct: { label: 'German F + Arab M', color: '#f43f5e' },
  asianIndianPct: { label: 'German F + Asian/Indian M', color: '#38bdf8' },
} satisfies ChartConfig;

const MALE_LINE_CONFIG = {
  nonGermanPct: { label: 'German M + Non-German F', color: '#f59e0b' },
  europeanPct: { label: 'German M + European (non-German) F', color: '#22c55e' },
  nonEuropeanPct: { label: 'German M + Non-European F', color: '#60a5fa' },
  africanPct: { label: 'German M + African F', color: '#c084fc' },
  arabPct: { label: 'German M + Arab F', color: '#f43f5e' },
  asianIndianPct: { label: 'German M + Asian/Indian F', color: '#38bdf8' },
} satisfies ChartConfig;

const LGBT_LINE_CONFIG = {
  total: { label: 'Total same-sex unions', color: '#f59e0b' },
  gay: { label: 'Gay (male-male)', color: '#22c55e' },
  lesbian: { label: 'Lesbian (female-female)', color: '#60a5fa' },
} satisfies ChartConfig;

function aggregateMarriageSeries(rows: readonly MarriageTrendRow[]): MarriageAggregate {
  return rows.reduce<MarriageAggregate>(
    (acc, row) => {
      acc.totalMarriages += row.totalMarriages;
      acc.nonGermanTotal += row.nonGermanCount;
      acc.europeanTotal += row.europeanCount;
      acc.nonEuropeanTotal += row.nonEuropeanCount;
      acc.africanTotal += row.africanCount;
      acc.arabTotal += row.arabCount;
      acc.asianIndianTotal += row.asianIndianCount;
      return acc;
    },
    {
      totalMarriages: 0,
      nonGermanTotal: 0,
      europeanTotal: 0,
      nonEuropeanTotal: 0,
      africanTotal: 0,
      arabTotal: 0,
      asianIndianTotal: 0,
    },
  );
}

function pctOfTotal(count: number, total: number): number {
  if (total <= 0) return 0;
  return (count / total) * 100;
}

function MarriagePieCard({
  title,
  labels,
  aggregate,
}: {
  title: string;
  labels: {
    european: string;
    african: string;
    arab: string;
    asianIndian: string;
  };
  aggregate: MarriageAggregate;
}) {
  const totalMarriages = aggregate.totalMarriages;
  const nonGermanPct = pctOfTotal(aggregate.nonGermanTotal, totalMarriages);
  const europeanPct = pctOfTotal(aggregate.europeanTotal, totalMarriages);
  const africanPct = pctOfTotal(aggregate.africanTotal, totalMarriages);
  const arabPct = pctOfTotal(aggregate.arabTotal, totalMarriages);
  const asianIndianPct = pctOfTotal(aggregate.asianIndianTotal, totalMarriages);
  const nonEuropeanPct = pctOfTotal(aggregate.nonEuropeanTotal, totalMarriages);
  const otherNonEuropeanPct = Math.max(0, nonEuropeanPct - africanPct - arabPct - asianIndianPct);

  const pieData = [
    { name: 'German + German', value: Math.max(0, 100 - nonGermanPct) },
    { name: labels.european, value: europeanPct },
    { name: labels.african, value: africanPct },
    { name: labels.arab, value: arabPct },
    { name: labels.asianIndian, value: asianIndianPct },
    { name: 'Other non-European spouse', value: otherNonEuropeanPct },
  ];
  const pieConfig: ChartConfig = pieData.reduce((acc, cur, index) => {
    acc[`slice_${index}`] = { label: cur.name, color: OVERVIEW_PIE_COLORS[index % OVERVIEW_PIE_COLORS.length] };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className="overflow-hidden border-line bg-surface-metric shadow-card">
      <CardHeader className="space-y-1 p-3 pb-2">
        <CardTitle className="text-sm font-semibold text-neutral-100 uppercase tracking-[0.05em]">{title}</CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-[0.03em] text-neutral-500">
          Aggregated 2000-2025 disjoint breakdown (% of all marriages, 100% base)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ChartContainer config={pieConfig} className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={94} stroke="none">
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={OVERVIEW_PIE_COLORS[index % OVERVIEW_PIE_COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent className="rounded-md" formatter={(value) => `${Number(value).toFixed(2)}%`} />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(212,212,212,0.9)' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function MarriageSummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="overflow-hidden border-line bg-surface-metric shadow-card">
      <CardHeader className="space-y-1 p-3 pb-2">
        <CardTitle className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.12em]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="font-sans text-xl font-semibold tabular-nums tracking-tight text-white sm:text-2xl">{value}</p>
      </CardContent>
    </Card>
  );
}

function MarriageLineCard({ title, data, chartConfig }: { title: string; data: readonly MarriageTrendRow[]; chartConfig: ChartConfig }) {
  return (
    <Card className="col-span-full overflow-hidden border-line bg-surface-metric shadow-card">
      <CardHeader className="space-y-1 p-3 pb-2">
        <CardTitle className="text-sm font-semibold text-neutral-100 uppercase tracking-[0.05em]">{title}</CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-[0.03em] text-neutral-500">
          Yearly share of all marriages (%)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 10, left: 4, bottom: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: 'rgba(163,163,163,0.9)', fontSize: 10, fontFamily: 'ui-sans-serif' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(value) => `${Number(value).toFixed(0)}%`} tick={{ fill: 'rgba(163,163,163,0.9)', fontSize: 10, fontFamily: 'ui-sans-serif' }} axisLine={false} tickLine={false} width={48} />
              <ChartTooltip cursor={{ stroke: 'rgba(255,255,255,0.12)' }} content={<ChartTooltipContent className="rounded-md" formatter={(value) => `${Number(value).toFixed(2)}%`} labelFormatter={(label) => `Year ${String(label)}`} />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(212,212,212,0.9)' }} iconType="line" />
              <Line type="monotone" dataKey="nonGermanPct" name="Non-German spouse" stroke="#f59e0b" strokeWidth={2.2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="europeanPct" name="European (non-German) spouse" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="nonEuropeanPct" name="Non-European spouse" stroke="#60a5fa" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="africanPct" name="African spouse" stroke="#c084fc" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="arabPct" name="Arab spouse" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="asianIndianPct" name="Asian/Indian spouse" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function MarriageDataTableCard({
  title,
  data,
  prefix,
  europeanLabel,
  nonEuropeanLabel,
  africanLabel,
  arabLabel,
  asianIndianLabel,
}: {
  title: string;
  data: readonly MarriageTrendRow[];
  prefix: 'F' | 'M';
  europeanLabel: string;
  nonEuropeanLabel: string;
  africanLabel: string;
  arabLabel: string;
  asianIndianLabel: string;
}) {
  return (
    <Card className="col-span-full overflow-hidden border-line bg-surface-metric shadow-card">
      <CardHeader className="space-y-1 p-3 pb-2">
        <CardTitle className="text-sm font-semibold text-neutral-100 uppercase tracking-[0.05em]">{title}</CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-[0.03em] text-neutral-500">
          Interracial marriage statistics table (2000-2025)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Total Marriages</TableHead>
              <TableHead className="text-right">German {prefix} + Non-German</TableHead>
              <TableHead className="text-right">%</TableHead>
              <TableHead className="text-right">{europeanLabel}</TableHead>
              <TableHead className="text-right">%</TableHead>
              <TableHead className="text-right">{nonEuropeanLabel}</TableHead>
              <TableHead className="text-right">%</TableHead>
              <TableHead className="text-right">{africanLabel}</TableHead>
              <TableHead className="text-right">%</TableHead>
              <TableHead className="text-right">{arabLabel}</TableHead>
              <TableHead className="text-right">%</TableHead>
              <TableHead className="text-right">{asianIndianLabel}</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={`${prefix}-${row.year}`}>
                <TableCell>{row.year}</TableCell>
                <TableCell className="text-right tabular-nums">{row.totalMarriages.toLocaleString('en-US')}</TableCell>
                <TableCell className="text-right tabular-nums">{row.nonGermanCount.toLocaleString('en-US')}</TableCell>
                <TableCell className="text-right tabular-nums">{row.nonGermanPct.toFixed(2)}%</TableCell>
                <TableCell className="text-right tabular-nums">{row.europeanCount.toLocaleString('en-US')}</TableCell>
                <TableCell className="text-right tabular-nums">{row.europeanPct.toFixed(2)}%</TableCell>
                <TableCell className="text-right tabular-nums">{row.nonEuropeanCount.toLocaleString('en-US')}</TableCell>
                <TableCell className="text-right tabular-nums">{row.nonEuropeanPct.toFixed(2)}%</TableCell>
                <TableCell className="text-right tabular-nums">{row.africanCount.toLocaleString('en-US')}</TableCell>
                <TableCell className="text-right tabular-nums">{row.africanPct.toFixed(2)}%</TableCell>
                <TableCell className="text-right tabular-nums">{row.arabCount.toLocaleString('en-US')}</TableCell>
                <TableCell className="text-right tabular-nums">{row.arabPct.toFixed(2)}%</TableCell>
                <TableCell className="text-right tabular-nums">{row.asianIndianCount.toLocaleString('en-US')}</TableCell>
                <TableCell className="text-right tabular-nums">{row.asianIndianPct.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function LgbtSummaryRow() {
  const totals = LGBT_SERIES.reduce(
    (acc, row) => {
      if (row.year === '2000') return acc;
      acc.total += row.total;
      acc.gay += row.gay;
      acc.lesbian += row.lesbian;
      return acc;
    },
    { total: 0, gay: 0, lesbian: 0 },
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <MarriageSummaryCard title="Total LGBT marriages" value={`~${totals.total.toLocaleString('en-US')}`} />
      <MarriageSummaryCard title="Total gay marriages" value={`~${totals.gay.toLocaleString('en-US')}`} />
      <MarriageSummaryCard title="Total lesbian marriages" value={`~${totals.lesbian.toLocaleString('en-US')}`} />
    </div>
  );
}

function LgbtPieCard() {
  const totals = LGBT_SERIES.reduce(
    (acc, row) => {
      if (row.year === '2000') return acc;
      acc.gay += row.gay;
      acc.lesbian += row.lesbian;
      return acc;
    },
    { gay: 0, lesbian: 0 },
  );
  const pieData = [
    { name: 'Gay (male-male)', value: totals.gay },
    { name: 'Lesbian (female-female)', value: totals.lesbian },
  ];
  const pieConfig: ChartConfig = {
    gay: { label: 'Gay (male-male)', color: '#22c55e' },
    lesbian: { label: 'Lesbian (female-female)', color: '#60a5fa' },
  };
  return (
    <Card className="overflow-hidden border-line bg-surface-metric shadow-card">
      <CardHeader className="space-y-1 p-3 pb-2">
        <CardTitle className="text-sm font-semibold text-neutral-100 uppercase tracking-[0.05em]">LGBT unions split (pie)</CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-[0.03em] text-neutral-500">Aggregated 2001-2025</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ChartContainer config={pieConfig} className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={94} stroke="none">
                <Cell fill="#22c55e" />
                <Cell fill="#60a5fa" />
              </Pie>
              <ChartTooltip content={<ChartTooltipContent className="rounded-md" formatter={(value) => Number(value).toLocaleString('en-US')} />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(212,212,212,0.9)' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function LgbtLineCard() {
  return (
    <Card className="col-span-full overflow-hidden border-line bg-surface-metric shadow-card">
      <CardHeader className="space-y-1 p-3 pb-2">
        <CardTitle className="text-sm font-semibold text-neutral-100 uppercase tracking-[0.05em]">LGBT unions trend (line)</CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-[0.03em] text-neutral-500">Yearly totals by union type</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ChartContainer config={LGBT_LINE_CONFIG} className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={LGBT_SERIES} margin={{ top: 8, right: 10, left: 4, bottom: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: 'rgba(163,163,163,0.9)', fontSize: 10, fontFamily: 'ui-sans-serif' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(163,163,163,0.9)', fontSize: 10, fontFamily: 'ui-sans-serif' }} axisLine={false} tickLine={false} width={52} />
              <ChartTooltip
                cursor={{ stroke: 'rgba(255,255,255,0.12)' }}
                content={<ChartTooltipContent className="rounded-md" formatter={(value) => Number(value).toLocaleString('en-US')} labelFormatter={(label, payload: any) => `Year ${String(label)} - ${payload?.[0]?.payload?.type ?? ''}`} />}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(212,212,212,0.9)' }} iconType="line" />
              <Line type="monotone" dataKey="total" name="Total same-sex unions" stroke="#f59e0b" strokeWidth={2.2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="gay" name="Gay (male-male)" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="lesbian" name="Lesbian (female-female)" stroke="#60a5fa" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export const GERMANY_MARRIAGES_GROUP_COUNT = 9;

export function GermanyMarriagesSection() {
  const femaleAggregate = aggregateMarriageSeries(FEMALE_SERIES);
  const maleAggregate = aggregateMarriageSeries(MALE_SERIES);
  const totalMarriagesAggregate = femaleAggregate.totalMarriages;

  return (
    <div className="flex flex-col gap-3">
      <CollapsibleFlagSection title="Interracial marriages" count={9} defaultOpen>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MarriageSummaryCard title="Total marraiges" value={totalMarriagesAggregate.toLocaleString('en-US')} />
            <MarriageSummaryCard title="Total interracial marriages (German Female)" value={femaleAggregate.nonGermanTotal.toLocaleString('en-US')} />
            <MarriageSummaryCard title="Total interracial marriages (German Male)" value={maleAggregate.nonGermanTotal.toLocaleString('en-US')} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MarriagePieCard
              title="German female marriages (pie)"
              aggregate={femaleAggregate}
              labels={{
                european: 'German F + European (non-German) M',
                african: 'German F + African M',
                arab: 'German F + Arab M',
                asianIndian: 'German F + Asian/Indian M',
              }}
            />
            <MarriagePieCard
              title="German male marriages (pie)"
              aggregate={maleAggregate}
              labels={{
                european: 'German M + European (non-German) F',
                african: 'German M + African F',
                arab: 'German M + Arab F',
                asianIndian: 'German M + Asian/Indian F',
              }}
            />
          </div>

          <MarriageLineCard title="German female marriages by category (line)" data={FEMALE_SERIES} chartConfig={FEMALE_LINE_CONFIG} />
          <MarriageLineCard title="German male marriages by category (line)" data={MALE_SERIES} chartConfig={MALE_LINE_CONFIG} />

          <MarriageDataTableCard
            title="German female marriages table"
            data={FEMALE_SERIES}
            prefix="F"
            europeanLabel="German F + European (non-German) M"
            nonEuropeanLabel="German F + Non-European M"
            africanLabel="German F + African M"
            arabLabel="German F + Arab M"
            asianIndianLabel="German F + Asian/Indian M"
          />
          <MarriageDataTableCard
            title="German male marriages table"
            data={MALE_SERIES}
            prefix="M"
            europeanLabel="German M + European (non-German) F"
            nonEuropeanLabel="German M + Non-European F"
            africanLabel="German M + African F"
            arabLabel="German M + Arab F"
            asianIndianLabel="German M + Asian/Indian F"
          />
        </div>
      </CollapsibleFlagSection>

      <CollapsibleFlagSection title="LGBT marriages" count={5} defaultOpen>
        <div className="flex flex-col gap-3">
          <LgbtSummaryRow />
          <LgbtPieCard />
          <LgbtLineCard />
        </div>
      </CollapsibleFlagSection>
    </div>
  );
}
