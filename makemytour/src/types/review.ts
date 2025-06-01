export interface Review {
  id: string;
  userId: string;
  userName: string;
  entityId: string; // flight or hotel id
  entityType: 'flight' | 'hotel';
  rating: number; // 1 to 5
  text: string;
  images: string[]; // URLs of uploaded images
  flagged: boolean;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  helpfulCount: number;
  adminReplies: AdminReply[];
}

export interface AdminReply {
  id: string;
  reviewId: string;
  text: string;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  parentReplyId?: string; // for nested replies
  replies?: AdminReply[]; // nested replies
}

export interface ReviewInput {
  entityId: string;
  entityType: 'flight' | 'hotel';
  rating: number;
  text: string;
  images?: File[]; // files to upload
}

export type SortOption = 'mostHelpful' | 'newest';
