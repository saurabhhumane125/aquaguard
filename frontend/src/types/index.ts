export type Role = 'CITIZEN' | 'AUTHORITY' | 'CREW' | 'ADMIN';

export type Status = 'REPORTED' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type Severity = 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';

export type LeakCategory = 'PIPE_BURST' | 'TAP_LEAK' | 'UNDERGROUND' | 'VALVE_LEAK' | 'METER_LEAK' | 'OTHER';

export type FlowRate = 'DRIP' | 'STREAM' | 'GUSH' | 'FLOOD';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  points: number;
  trustScore: number;
}

export interface Leak {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  photoUrl: string;
  severity: Severity;
  category: LeakCategory;
  flowRate: FlowRate;
  description?: string;
  status: Status;
  priorityScore: number;
  waterLossRate: number;
  reporterId: string;
  reporter?: { name: string; points: number };
  _count?: { upvotes: number; comments: number };
  createdAt: string;
  updatedAt: string;
}

export interface Cluster {
  id: string;
  centerLatitude: number;
  centerLongitude: number;
  radius: number;
  totalReports: number;
  priorityScore: number;
  status: Status;
  leaks: Leak[];
  createdAt: string;
  updatedAt: string;
}
