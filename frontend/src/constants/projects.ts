import type { LucideIcon } from "@/components/icons";
import {
  Brain,
  CircuitBoard,
  Cloud,
  Cpu,
  Database,
  Layers,
  Monitor,
} from "@/components/icons";

export type ProjectCategory =
  | "artificial-intelligence"
  | "machine-learning"
  | "electronics";

export interface ProjectCategoryTab {
  id: ProjectCategory;
  label: string;
  icon: LucideIcon;
}

export interface ProjectItem {
  id: string;
  category: ProjectCategory;
  badge: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  requirements: string[];
  techStack: { label: string; icon: LucideIcon }[];
}

export const PROJECT_CATEGORIES: ProjectCategoryTab[] = [
  {
    id: "artificial-intelligence",
    label: "Artificial Intelligence",
    icon: Brain,
  },
  {
    id: "machine-learning",
    label: "Machine Learning",
    icon: Layers,
  },
  {
    id: "electronics",
    label: "Electronics",
    icon: CircuitBoard,
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: "ai-health-monitor",
    category: "artificial-intelligence",
    badge: "HEALTH-TECH",
    title: "AI-Powered Smart Health Monitor",
    description:
      "Develop an AI system that predicts potential health risks using sensor data. This project focuses on predictive analytics and real-time processing.",
    imageSrc:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Desk with laptop and smart health monitoring device",
    requirements: ["Python", "Basic Data Science", "IoT Sensors"],
    techStack: [
      { label: "TensorFlow", icon: Brain },
      { label: "Scikit-learn", icon: Database },
      { label: "Raspberry Pi", icon: Cpu },
    ],
  },
  {
    id: "ai-traffic-management",
    category: "artificial-intelligence",
    badge: "SMART CITIES",
    title: "Intelligent Traffic Management System",
    description:
      "Optimize urban traffic flow using real-time computer vision. You will build modules that detect congestion and adjust light cycles dynamically.",
    imageSrc:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "City skyline at night with traffic lights",
    requirements: ["OpenCV", "Python", "Networking Basics"],
    techStack: [
      { label: "PyTorch", icon: Brain },
      { label: "NVIDIA Jetson", icon: Monitor },
      { label: "AWS Cloud", icon: Cloud },
    ],
  },
  {
    id: "ml-recommendation-engine",
    category: "machine-learning",
    badge: "ED-TECH",
    title: "Personalized Learning Recommender",
    description:
      "Build a recommendation model that suggests learning paths based on student progress, strengths, and career goals across Stage 1 modules.",
    imageSrc:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Laptop showing code and data visualizations",
    requirements: ["Python", "Statistics", "SQL Basics"],
    techStack: [
      { label: "Scikit-learn", icon: Database },
      { label: "Pandas", icon: Layers },
      { label: "AWS Cloud", icon: Cloud },
    ],
  },
  {
    id: "ml-fraud-detection",
    category: "machine-learning",
    badge: "FINTECH",
    title: "Transaction Fraud Detection Pipeline",
    description:
      "Design a supervised learning pipeline that flags suspicious transactions in near real time and explains model decisions for mentor review.",
    imageSrc:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Analytics dashboard on a laptop screen",
    requirements: ["Python", "Classification", "Feature Engineering"],
    techStack: [
      { label: "TensorFlow", icon: Brain },
      { label: "Scikit-learn", icon: Database },
      { label: "AWS Cloud", icon: Cloud },
    ],
  },
  {
    id: "electronics-iot-lab",
    category: "electronics",
    badge: "IOT LAB",
    title: "Campus Environment Sensor Hub",
    description:
      "Prototype a multi-sensor hub that tracks temperature, air quality, and occupancy, then streams readings to a dashboard for campus ops.",
    imageSrc:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Circuit board and electronic components",
    requirements: ["Circuit Basics", "C/C++", "Sensors"],
    techStack: [
      { label: "Arduino", icon: CircuitBoard },
      { label: "Raspberry Pi", icon: Cpu },
      { label: "MQTT", icon: Cloud },
    ],
  },
  {
    id: "electronics-wearable",
    category: "electronics",
    badge: "WEARABLES",
    title: "Low-Power Wearable Activity Tracker",
    description:
      "Design a wearable PCB and firmware stack that captures motion data efficiently and syncs summaries to a companion mobile view.",
    imageSrc:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Close-up of electronic hardware and chips",
    requirements: ["Embedded C", "PCB Basics", "Power Management"],
    techStack: [
      { label: "ESP32", icon: Cpu },
      { label: "KiCad", icon: CircuitBoard },
      { label: "BLE", icon: Monitor },
    ],
  },
];
