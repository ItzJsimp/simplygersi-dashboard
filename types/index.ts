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
  collected: number;     // payments received this calendar month
  goal: number;          // monthly target ($5K)
  totalInvoiced: number; // outstanding invoices not yet paid
  activeDealsCount: number;
}

export interface Task {
  id: string;
  name: string;
  status: string;
  priority: string;
  dueDate: string | null; // ISO date string YYYY-MM-DD
  area: string;
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

export interface DashboardData {
  deals: Deal[];
  revenue: RevenueData;
  tasks: Task[];         // all open tasks
  contentTasks: Task[];  // subset: area = content / ugc / tiktok / etc.
  goals: Goal[];
  lastUpdated: string;   // ISO datetime
}
