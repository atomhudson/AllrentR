export interface StatBox {
  title: string;
  value: string;
  subtitle: string;
  valueColor?: string; // "red", "green", "default"
}

export interface TimelineEvent {
  year: string;
  event: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogExtraData {
  stats?: StatBox[];
  timeline?: TimelineEvent[];
  faq?: FAQItem[];
}

export const EXTRA_DATA_PREFIX = "__json_data__:";
