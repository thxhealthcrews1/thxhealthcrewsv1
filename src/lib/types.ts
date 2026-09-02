export interface GlobeComment {
  id: string;
  created_at: string;
  city: string;
  state: string;
  comment: string;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  medical_center?: string | null;
  visit_date?: string | null;
  initials?: string | null;
}

export interface PendingCoords {
  x: number;
  y: number;
  z: number;
}

export type ModalStep = 'IDLE' | 'LOCATION' | 'MESSAGE' | 'DETAILS';
