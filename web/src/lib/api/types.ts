export type Role =
  | "citizen"
  | "volunteer"
  | "ngo"
  | "hospital"
  | "police"
  | "admin"
  | "super_admin";

export type Gender = "male" | "female" | "other";

export interface User {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  is_verified: boolean;
  preferred_language: string;
  profile_photo: string | null;
  gender: Gender | "";
  city: string;
  date_joined: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export type MissingPersonStatus = "missing" | "verified" | "found" | "closed";

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

export type CampaignCategory =
  | "awareness"
  | "hackathon"
  | "cleanliness_drive"
  | "blood_camp"
  | "plantation"
  | "relief_collection"
  | "other";
export type CampaignStatus = "published" | "closed" | "cancelled";
export type CampaignRegistrationStatus = "registered" | "cancelled" | "attended";

export interface Campaign {
  id: string;
  organizer: string;
  organizer_name: string;
  title: string;
  category: CampaignCategory;
  description: string;
  city: string;
  venue: string;
  banner_image: string | null;
  capacity: number | null;
  registered_count: number;
  available_slots: number | null;
  starts_at: string;
  ends_at: string | null;
  registration_deadline: string | null;
  status: CampaignStatus;
  latitude: string | null;
  longitude: string | null;
  created_at: string;
}

export interface CampaignRegistration {
  id: string;
  campaign: string;
  user: string;
  full_name: string;
  phone: string;
  email: string;
  team_name: string;
  notes: string;
  status: CampaignRegistrationStatus;
  created_at: string;
}

export interface SearchResult {
  type: "missing_person" | "missing_child" | "missing_elderly" | "lost_pet";
  id: string;
  public_slug: string;
  title: string;
  subtitle: string;
  status: string;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  city: string;
  is_verified: boolean;
  is_active: boolean;
  organization_name: string | null;
  date_joined: string;
}

export interface PlatformSummary {
  users_by_role: Record<string, number>;
  total_users: number;
  pending_ngo_verifications: number;
  missing_persons_by_status: Record<string, number>;
  active_disaster_events: number;
  open_blood_requests_by_urgency: Record<string, number>;
  active_sos_alerts: number;
  verified_volunteers: number;
  campaigns_by_status: Record<string, number>;
  published_campaigns: number;
  total_communities: number;
}

export interface Community {
  id: string;
  owner: string;
  owner_name: string;
  name: string;
  description: string;
  banner_image: string | null;
  city: string;
  is_active: boolean;
  member_count: number;
  is_member: boolean;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  community: string;
  author: string;
  author_name: string;
  content: string;
  image: string | null;
  like_count: number;
  has_liked: boolean;
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

export interface PublicFeedReport {
  id: string;
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

export interface ReportComment {
  id: string;
  author: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  uploaded_by: string;
  uploader_name: string;
  image: string;
  caption: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  notification_type: string;
  channel: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  sent_at: string | null;
  created_at: string;
}

export interface EventItem {
  id: string;
  created_by: string;
  creator_name: string;
  title: string;
  description: string;
  category: "awareness" | "blood_drive" | "relief" | "training" | "meeting" | "other";
  event_date: string;
  start_time: string | null;
  location: string;
  city: string;
  is_public: boolean;
  rsvp_count: number;
  has_rsvped: boolean;
  created_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  hospital_type: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  emergency_phone: string;
  has_blood_bank: boolean;
  has_trauma_center: boolean;
  is_verified: boolean;
  latitude: string | null;
  longitude: string | null;
  distance_km?: number;
  created_at: string;
}

export interface Shelter {
  id: string;
  name: string;
  shelter_type: string;
  address: string;
  city: string;
  capacity: number;
  current_occupancy: number;
  available_capacity: number;
  contact_phone: string;
  is_active: boolean;
  latitude: string | null;
  longitude: string | null;
  distance_km?: number;
  created_at: string;
}

export interface MissingChild {
  id: string;
  name: string;
  age: number;
  gender: string;
  photo: string | null;
  last_seen_location: string;
  last_seen_at: string;
  status: string;
  created_at: string;
}
