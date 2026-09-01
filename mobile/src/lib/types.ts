export type Role = "citizen" | "volunteer" | "ngo" | "hospital" | "police" | "admin" | "super_admin";

export interface User {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  is_verified: boolean;
  preferred_language: string;
  city: string;
  date_joined: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterInput {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
  preferred_language?: string;
}

export interface Paginated<T> {
  count: number;
  num_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MissingPersonPhoto {
  id: string;
  image: string;
  created_at: string;
}

export interface PublicFeedReport {
  id: string;
  public_slug: string;
  name: string;
  age: number;
  gender: string;
  clothing_description: string;
  last_seen_location: string;
  last_seen_at: string;
  status: string;
  photos: MissingPersonPhoto[];
  created_at: string;
}

export interface BloodRequest {
  id: string;
  patient_name: string;
  blood_group: string;
  units_needed: number;
  city: string;
  urgency: string;
  status: string;
  notes: string;
  responses: { id: string }[];
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  event_date: string;
  start_time: string | null;
  location: string;
  city: string;
  creator_name: string;
  rsvp_count: number;
  has_rsvped: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  organizer_name: string;
  title: string;
  category: string;
  description: string;
  city: string;
  venue: string;
  banner_image: string | null;
  registered_count: number;
  available_slots: number | null;
  starts_at: string;
  ends_at: string | null;
  status: string;
  created_at: string;
}

export interface Community {
  id: string;
  owner_name: string;
  name: string;
  description: string;
  banner_image: string | null;
  city: string;
  member_count: number;
  is_member: boolean;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  uploader_name: string;
  image: string;
  caption: string;
  created_at: string;
}

export interface SearchResult {
  type: string;
  id: string;
  public_slug: string;
  title: string;
  subtitle: string;
  status: string;
}

export interface NotificationItem {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface SOSAlert {
  id: string;
  status: string;
  latitude: string | null;
  longitude: string | null;
  notes: string;
  created_at: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface Hospital {
  id: string;
  name: string;
  hospital_type: string;
  address: string;
  city: string;
  phone: string;
  emergency_phone: string;
  has_blood_bank: boolean;
  has_trauma_center: boolean;
  distance_km?: number;
}

export interface Shelter {
  id: string;
  name: string;
  shelter_type: string;
  address: string;
  city: string;
  capacity: number;
  available_capacity: number;
  contact_phone: string;
  distance_km?: number;
}

export interface DisasterEvent {
  id: string;
  name: string;
  disaster_type: string;
  description: string;
  affected_area: string;
  radius_km: string;
  status: string;
  started_at: string;
  open_needs_count: number;
  created_at: string;
}
