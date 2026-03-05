export {
  getNewsletterAnalytics,
  getBestPerformingNewsletters,
  getOpenRateBySegment,
  getClickRateByTopic,
  getPerformanceByDayOfWeek,
  getOpenRateTrend,
  getSubscriberGrowthTrend,
} from "./aggregations";
export type {
  NewsletterMetrics,
  BestPerformingItem,
  OpenRateBySegmentRow,
  ClickRateByTopicRow,
  PerformanceByDayRow,
  OpenRateTrendRow,
  SubscriberGrowthTrendRow,
} from "./types";
