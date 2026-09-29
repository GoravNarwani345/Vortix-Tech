export type StatItem = {
  label: string;
  value: number;
  suffix: string;
};

export const DEFAULT_STATS: StatItem[] = [
  { label: "Projects Delivered", value: 15, suffix: "+" },
  { label: "Happy Clients", value: 8, suffix: "+" },
  { label: "Technologies", value: 15, suffix: "+" },
  { label: "Team Members", value: 4, suffix: "" },
];
