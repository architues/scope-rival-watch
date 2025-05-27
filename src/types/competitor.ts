
export interface Competitor {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'checking' | 'error';
  lastChecked: Date;
  changesDetected: number;
  addedAt: Date;
}

export interface ChangeRecord {
  id: string;
  competitorId: string;
  competitorName: string;
  changeType: 'content' | 'design' | 'structure';
  description: string;
  detectedAt: Date;
  severity: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  email: string;
  name?: string;
}
