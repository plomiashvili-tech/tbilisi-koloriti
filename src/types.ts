export type ReportCategory =
  | 'road'
  | 'building'
  | 'flooding'
  | 'lighting'
  | 'sidewalk'
  | 'other';

export interface FixVerification {
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  userId: string;
  userName: string;
  createdAt: Date;
}

export interface Rating {
  userId: string;
  stars: number;
}

export interface Report {
  id: string;
  category: ReportCategory;
  description: string;
  street: string;
  region: string;
  location: {
    latitude: number;
    longitude: number;
  };
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  deviceId: string;
  reporterUserId?: string;
  reporterUserName?: string;
  fixVerification?: FixVerification;
  ratings: Rating[];
  averageRating: number;
}

export interface Badge {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const BADGES: Badge[] = [
  { id: 'first_report',  label: 'Pioneer',     icon: '🏁',  description: 'Submitted your first report' },
  { id: 'reporter_5',    label: 'Watchdog',     icon: '👁️',  description: 'Submitted 5 reports' },
  { id: 'reporter_10',   label: 'Guardian',     icon: '🛡️',  description: 'Submitted 10 reports' },
  { id: 'first_fix',     label: 'Fix Finder',   icon: '🔧',  description: 'First to verify a fix' },
  { id: 'verifier_5',    label: 'Inspector',    icon: '🔍',  description: 'Verified 5 fixes' },
  { id: 'rater_5',       label: 'Critic',       icon: '⭐',  description: 'Rated 5 fixed problems' },
  { id: 'hero',          label: 'City Hero',    icon: '🏆',  description: 'Earned 50+ points' },
];

export const POINT_VALUES = { REPORT: 10, FIX_VERIFY: 15, RATE: 2 } as const;

export type RootStackParamList = {
  Main: undefined;
  Camera: undefined;
  Submit: { mediaUri: string; mediaType: 'photo' | 'video' };
  ReportDetail: { reportId: string };
  Privacy: undefined;
  Login: undefined;
  Register: undefined;
};

export type TabParamList = {
  Map: undefined;
  MyReports: undefined;
  About: undefined;
};

export const CATEGORIES: {
  key: ReportCategory;
  label: string;
  icon: string;
  color: string;
}[] = [
  { key: 'road',     label: 'Road Damage', icon: '🛣️',  color: '#E63946' },
  { key: 'building', label: 'Building',    icon: '🏚️',  color: '#F4A261' },
  { key: 'flooding', label: 'Flooding',    icon: '💧',  color: '#457B9D' },
  { key: 'lighting', label: 'Lighting',    icon: '💡',  color: '#FFB703' },
  { key: 'sidewalk', label: 'Sidewalk',    icon: '🚶',  color: '#8338EC' },
  { key: 'other',    label: 'Other',       icon: '⚠️',  color: '#8D99AE' },
];

// All Tbilisi districts and neighbourhoods
export const TBILISI_REGIONS: { label: string; group: string }[] = [
  // Official administrative districts
  { label: 'Mtatsminda',         group: 'District' },
  { label: 'Vake',               group: 'District' },
  { label: 'Saburtalo',          group: 'District' },
  { label: 'Krtsanisi',          group: 'District' },
  { label: 'Isani',              group: 'District' },
  { label: 'Samgori',            group: 'District' },
  { label: 'Chughureti',         group: 'District' },
  { label: 'Didube',             group: 'District' },
  { label: 'Nadzaladevi',        group: 'District' },
  { label: 'Gldani',             group: 'District' },
  // Popular neighbourhoods
  { label: 'Old Town (Kala)',    group: 'Neighbourhood' },
  { label: 'Avlabari',          group: 'Neighbourhood' },
  { label: 'Ortachala',         group: 'Neighbourhood' },
  { label: 'Varketili',         group: 'Neighbourhood' },
  { label: 'Navtlugi',          group: 'Neighbourhood' },
  { label: 'Ponichala',         group: 'Neighbourhood' },
  { label: 'Mukhiani',          group: 'Neighbourhood' },
  { label: 'Dighomi',           group: 'Neighbourhood' },
  { label: 'Nutsubidze Plateau',group: 'Neighbourhood' },
  { label: 'Vera',              group: 'Neighbourhood' },
  { label: 'Marjanishvili',     group: 'Neighbourhood' },
  { label: 'Temka',             group: 'Neighbourhood' },
  { label: 'Lisi',              group: 'Neighbourhood' },
  { label: 'Bagebi',            group: 'Neighbourhood' },
  { label: 'Okrokana',          group: 'Neighbourhood' },
  { label: 'Zahesi',            group: 'Neighbourhood' },
  { label: 'Tskneti',           group: 'Neighbourhood' },
  { label: 'Kojori',            group: 'Neighbourhood' },
  { label: 'Shindisi',          group: 'Neighbourhood' },
  { label: 'Vaziani',           group: 'Neighbourhood' },
];
