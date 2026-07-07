export type Role =
  | "citizen"
  | "volunteer"
  | "ngo"
  | "hospital"
  | "police"
  | "admin"
  | "super_admin";

export interface User {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  is_verified: boolean;
  preferred_language: string;
  profile_photo: string | null;
  date_joined: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export type MissingPersonStatus = "missing" | "verified" | "found" | "closed";
export type Gender = "male" | "female" | "other";

export interface MissingPersonPhoto {
  id: string;
  image: string;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface SightingReport {
  id: string;
  description: string;
  location_text: string;
  latitude: string | null;
  longitude: string | null;
  sighted_at: string;
  photo: string | null;
  created_at: string;
}

export interface MissingPersonReport {
  id: string;
  public_slug: string;
  share_url: string;
  name: string;
  age: number;
  gender: Gender;
  height_cm: number | null;
  weight_kg: number | null;
  clothing_description: string;
  last_seen_location: string;
  last_seen_at: string;
  latitude: string | null;
  longitude: string | null;
  medical_conditions: string;
  languages_spoken: string[];
  status: MissingPersonStatus;
  risk_score: string;
  ai_summary: string;
  qr_code: string | null;
  photos: MissingPersonPhoto[];
  emergency_contacts: EmergencyContact[];
  sightings: SightingReport[];
  created_at: string;
}

export interface PublicMissingPersonReport {
  public_slug: string;
  name: string;
  age: number;
  gender: Gender;
  clothing_description: string;
  last_seen_location: string;
  last_seen_at: string;
  status: MissingPersonStatus;
  photos: MissingPersonPhoto[];
  created_at: string;
}

export type SOSStatus = "active" | "resolved" | "cancelled";

export interface SOSLocationPing {
  id: string;
  latitude: string;
  longitude: string;
  recorded_at: string;
}

export interface SOSAlert {
  id: string;
  status: SOSStatus;
  notes: string;
  media: string | null;
  latitude: string | null;
  longitude: string | null;
  pings: SOSLocationPing[];
  resolved_at: string | null;
  created_at: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type Urgency = "normal" | "urgent" | "critical";
export type BloodRequestStatus = "open" | "fulfilled" | "expired" | "cancelled";

export interface BloodRequestResponseItem {
  id: string;
  donor: string;
  donor_name: string;
  status: string;
  created_at: string;
}

export interface BloodRequest {
  id: string;
  patient_name: string;
  blood_group: BloodGroup;
  units_needed: number;
  hospital: string | null;
  city: string;
  urgency: Urgency;
  status: BloodRequestStatus;
  notes: string;
  latitude: string | null;
  longitude: string | null;
  responses: BloodRequestResponseItem[];
  created_at: string;
}

export type DisasterType = "flood" | "earthquake" | "fire" | "cyclone";
export type DisasterEventStatus = "active" | "contained" | "closed";
export type NeedType = "safe" | "need_rescue" | "need_food" | "need_water" | "need_medicine";

export interface DisasterEvent {
  id: string;
  name: string;
  disaster_type: DisasterType;
  description: string;
  affected_area: string;
  radius_km: string;
  status: DisasterEventStatus;
  latitude: string | null;
  longitude: string | null;
  started_at: string;
  ended_at: string | null;
  open_needs_count: number;
  created_at: string;
}

export interface StatusReport {
  id: string;
  event: string;
  user: string;
  user_name: string;
  need_type: NeedType;
  notes: string;
  latitude: string | null;
  longitude: string | null;
  is_resolved: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  num_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
