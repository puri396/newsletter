export interface NewsletterMetrics {
  newsletterId: string;
  title: string;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  openRate: number;
  clickRate: number;
  ctr: number;
}

export interface BestPerformingItem {
  newsletterId: string;
  title: string;
  openRate: number;
  clickRate: number;
  sent: number;
  opens: number;
  clicks: number;
}

export interface OpenRateBySegmentRow {
  segment: string;
  sent: number;
  opens: number;
  openRate: number;
}

export interface ClickRateByTopicRow {
  topic: string;
  sent: number;
  clicks: number;
  clickRate: number;
}

export interface PerformanceByDayRow {
  dayOfWeek: number;
  dayName: string;
  opens: number;
  clicks: number;
}

export interface OpenRateTrendRow {
  period: string;
  opens: number;
  delivered: number;
  openRate: number;
}

export interface SubscriberGrowthTrendRow {
  date: string;
  count: number;
  cumulative: number;
}
