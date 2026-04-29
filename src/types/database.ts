export type UserRole = "user" | "startupper" | "researcher" | "admin";
export type PostVisibility = "public" | "followers";
export type ReactionType = "like" | "support" | "idea";
export type ReportTarget = "user" | "post" | "comment";
export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";
export type BugSeverity = "low" | "medium" | "high" | "critical";
export type BugStatus = "open" | "in_progress" | "resolved" | "wontfix";
export type ProjectStage = "idea" | "mvp" | "growth" | "scaling" | "acquired";
export type FeedbackCategory = "suggestion" | "compliment" | "problem" | "idea";
export type AdminActionType =
  | "remove_avatar"
  | "edit_username"
  | "suspend_user"
  | "unsuspend_user"
  | "ban_user"
  | "unban_user"
  | "verify_user"
  | "assign_beta"
  | "revoke_beta"
  | "hide_post"
  | "show_post"
  | "delete_post"
  | "resolve_report"
  | "dismiss_report"
  | "close_bug";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  avatar_emoji: string | null;
  banner_color: string | null;
  role: UserRole;
  country_code: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  is_verified: boolean;
  is_suspended: boolean;
  is_banned: boolean;
  is_beta: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  title: string | null;
  content: string;
  category: string | null;
  tags: string[];
  country_code: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  visibility: PostVisibility;
  community_id: string | null;
  is_hidden: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
  community?: { id: string; name: string; slug: string; avatar_emoji: string | null; category: string | null } | null;
  reactions_count?: number;
  comments_count?: number;
  user_reaction?: ReactionType | null;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  is_hidden: boolean;
  deleted_at: string | null;
  created_at: string;
  author?: Profile;
  replies?: Comment[];
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  type: ReactionType;
  created_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  stage: ProjectStage;
  country_code: string | null;
  looking_for: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  owner?: Profile;
  members?: ProjectMember[];
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: Profile;
}

export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  avatar_emoji: string | null;
  category: string | null;
  country_code: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
  members_count?: number;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTarget;
  target_id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reporter?: Profile;
}

export interface Feedback {
  id: string;
  user_id: string | null;
  category: FeedbackCategory;
  message: string;
  created_at: string;
}

export interface BugReport {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  browser_info: Record<string, unknown>;
  screenshot_url: string | null;
  severity: BugSeverity;
  status: BugStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action: AdminActionType;
  target_type: string;
  target_id: string;
  reason: string;
  metadata: Record<string, unknown>;
  created_at: string;
  admin?: Profile;
}

export type ConnectionStatus = "pending" | "accepted" | "rejected" | "skipped";

export interface Connection {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
  sender?: Profile;
  receiver?: Profile;
}

// Supabase Database type map
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, "created_at" | "updated_at">; Update: Partial<Profile> };
      posts: { Row: Post; Insert: Omit<Post, "id" | "created_at" | "updated_at">; Update: Partial<Post> };
      comments: { Row: Comment; Insert: Omit<Comment, "id" | "created_at">; Update: Partial<Comment> };
      reactions: { Row: Reaction; Insert: Omit<Reaction, "id" | "created_at">; Update: never };
      follows: { Row: Follow; Insert: Follow; Update: never };
      notifications: { Row: Notification; Insert: Omit<Notification, "id" | "created_at">; Update: Partial<Notification> };
      projects: { Row: Project; Insert: Omit<Project, "id" | "created_at" | "updated_at">; Update: Partial<Project> };
      communities: { Row: Community; Insert: Omit<Community, "id" | "created_at">; Update: Partial<Community> };
      reports: { Row: Report; Insert: Omit<Report, "id" | "created_at">; Update: Partial<Report> };
      feedback: { Row: Feedback; Insert: Omit<Feedback, "id" | "created_at">; Update: never };
      bug_reports: { Row: BugReport; Insert: Omit<BugReport, "id" | "created_at" | "updated_at">; Update: Partial<BugReport> };
      admin_actions: { Row: AdminAction; Insert: Omit<AdminAction, "id" | "created_at">; Update: never };
    };
  };
}
