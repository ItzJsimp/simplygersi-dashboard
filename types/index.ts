export interface Deal {
  id: string;
  name: string;
  brand: string;
  status: string;
  amount: number | null;
  daysSinceUpdate: number;
  stalled: boolean; // 7+ days without edit
  url: string;
}

export interface RevenueData {
  collected: number;          // payments received this calendar month
  goal: number;               // monthly target ($5K)
  totalInvoiced: number;      // outstanding invoices not yet paid
  overdueInvoiceCount: number;
  activeDealsCount: number;
}

export interface Task {
  id: string;
  name: string;
  status: string;
  priority: string;
  dueDate: string | null; // ISO date string YYYY-MM-DD
  area: string;
  relatedDeal: string;
  isOverdue: boolean;
  url: string;
}

export interface Goal {
  id: string;
  name: string;
  status: string;
  progress: number | null; // 0–100
  url: string;
}

export interface ContentItem {
  id: string;
  name: string;
  status: string;
  platform: string;
  type: string;
  dueDate: string | null;
  relatedDeal: string;
  isOverdue: boolean;
  url: string;
}

export interface Note {
  id: string;
  title: string;
  status: string;
  createdDate: string | null;
  tags: string[];
  url: string;
}

export interface Resource {
  id: string;
  title: string;
  resourceUrl: string | null;
  status: string;
  tags: string[];
  type: string;
  url: string;
}

export interface ThreadReview {
  id: string;
  title: string;
  date: string | null;
  summary: string;
  missedTasks: string;
  followUpNeeded: boolean;
  url: string;
}

export interface DashboardData {
  deals: Deal[];
  revenue: RevenueData;
  tasks: Task[];
  contentItems: ContentItem[];  // from SimplyGersi Content HUB
  goals: Goal[];
  notes: Note[];
  resources: Resource[];
  threadReviews: ThreadReview[];
  lastUpdated: string; // ISO datetime
}
