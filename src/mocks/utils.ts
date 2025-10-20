import { Stage } from "../types";

export const generateId = () => Math.random().toString(36).substring(2, 9);
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const maybeFail = (errorRate: number) => Math.random() < errorRate;

export const STAGE_CONFIG: Record<Stage, { label: string; color: string; bgColor: string; icon: string }> = {
  [Stage.Applied]: { label: "Applied", color: "text-blue-700", bgColor: "bg-blue-100", icon: "📝" },
  [Stage.Screen]: { label: "Screening", color: "text-yellow-700", bgColor: "bg-yellow-100", icon: "🎤" },
  [Stage.Tech]: { label: "Technical", color: "text-purple-700", bgColor: "bg-purple-100", icon: "💻" },
  [Stage.Offer]: { label: "Offer", color: "text-green-700", bgColor: "bg-green-100", icon: "📄" },
  [Stage.Hired]: { label: "Hired", color: "text-purple-700", bgColor: "bg-purple-100", icon: "🎉" },
  [Stage.Rejected]: { label: "Rejected", color: "text-red-700", bgColor: "bg-red-100", icon: "❌" },
  [Stage.map]: {
    label: "",
    color: "",
    bgColor: "",
    icon: ""
  }
};
