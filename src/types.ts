export type ReportCategory =
  | 'road'
  | 'building'
  | 'flooding'
  | 'lighting'
  | 'sidewalk'
  | 'other';

export interface Report {
  id: string;
  category: ReportCategory;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  deviceId: string;
}

export type RootStackParamList = {
  Main: undefined;
  Camera: undefined;
  Submit: { mediaUri: string; mediaType: 'photo' | 'video' };
  ReportDetail: { reportId: string };
  Privacy: undefined;
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
  { key: 'road', label: 'Road Damage', icon: '🛣️', color: '#E63946' },
  { key: 'building', label: 'Building', icon: '🏚️', color: '#F4A261' },
  { key: 'flooding', label: 'Flooding', icon: '💧', color: '#457B9D' },
  { key: 'lighting', label: 'Lighting', icon: '💡', color: '#FFB703' },
  { key: 'sidewalk', label: 'Sidewalk', icon: '🚶', color: '#8338EC' },
  { key: 'other', label: 'Other', icon: '⚠️', color: '#8D99AE' },
];
