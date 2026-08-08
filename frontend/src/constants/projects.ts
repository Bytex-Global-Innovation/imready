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

export type ProjectCategory = string;

export interface ProjectCategoryTab {
  id: ProjectCategory;
  label: string;
  icon: LucideIcon;
}

export interface ProjectDeliverable {
  id: string;
  label: string;
}

export interface ProjectEvaluationCriterion {
  label: string;
  percent: number;
}

export interface ProjectResource {
  label: string;
  type: "pdf" | "zip";
  href: string;
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
  /** Project brief page fields (optional so existing usages stay valid) */
  estimatedTime?: string;
  level?: string;
  overview?: string;
  briefRequirements?: string[];
  deliverables?: ProjectDeliverable[];
  evaluationCriteria?: ProjectEvaluationCriterion[];
  resources?: ProjectResource[];
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
    estimatedTime: "6-10 hours",
    level: "Intermediate Level",
    overview:
      "In this project, you will build a predictive health-monitoring system that ingests live sensor data and flags early warning signs before they become critical. The goal is to demonstrate real-time inference on lightweight hardware while keeping the model interpretable for non-technical users.",
    briefRequirements: [
      "Collect and clean sample sensor datasets.",
      "Train a baseline predictive model in Python.",
      "Deploy the model for real-time inference on a Raspberry Pi.",
      "Build a simple dashboard to visualize predictions.",
    ],
    deliverables: [
      { id: "d1", label: "Trained model with evaluation report" },
      { id: "d2", label: "Real-time inference demo on device" },
      { id: "d3", label: "Short write-up of approach and limitations" },
    ],
    evaluationCriteria: [
      { label: "Model Accuracy", percent: 40 },
      { label: "Real-Time Performance", percent: 35 },
      { label: "Documentation", percent: 25 },
    ],
    resources: [
      { label: "Sensor Dataset Guide.pdf", type: "pdf", href: "#" },
      { label: "Starter Code (Raspberry Pi).zip", type: "zip", href: "#" },
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
    estimatedTime: "8-12 hours",
    level: "Advanced Level",
    overview:
      "In this challenge, you will build a computer-vision pipeline that detects vehicle density from live camera feeds and dynamically adjusts traffic-light timing to reduce congestion at intersections.",
    briefRequirements: [
      "Set up a vehicle-detection pipeline using OpenCV.",
      "Estimate traffic density per lane from video frames.",
      "Design a rules-based signal-timing algorithm.",
      "Simulate results on a sample intersection dataset.",
    ],
    deliverables: [
      { id: "d1", label: "Vehicle detection and counting module" },
      { id: "d2", label: "Signal-timing simulation results" },
      { id: "d3", label: "Architecture diagram and demo video" },
    ],
    evaluationCriteria: [
      { label: "Detection Accuracy", percent: 35 },
      { label: "System Design", percent: 40 },
      { label: "Presentation", percent: 25 },
    ],
    resources: [
      { label: "Traffic Camera Dataset.pdf", type: "pdf", href: "#" },
      { label: "Starter Code (PyTorch).zip", type: "zip", href: "#" },
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
    estimatedTime: "5-8 hours",
    level: "Intermediate Level",
    overview:
      "You will design a recommendation engine that analyzes a student's progress and learning history to suggest the most relevant next module, mimicking how adaptive learning platforms personalize a curriculum.",
    briefRequirements: [
      "Explore and clean the sample student-progress dataset.",
      "Engineer features representing student strengths and gaps.",
      "Train a collaborative-filtering or content-based model.",
      "Evaluate recommendations against held-out data.",
    ],
    deliverables: [
      { id: "d1", label: "Cleaned dataset and feature notebook" },
      { id: "d2", label: "Trained recommendation model" },
      { id: "d3", label: "Evaluation report with sample outputs" },
    ],
    evaluationCriteria: [
      { label: "Recommendation Quality", percent: 45 },
      { label: "Data Handling", percent: 30 },
      { label: "Documentation", percent: 25 },
    ],
    resources: [
      { label: "Student Progress Dataset.pdf", type: "pdf", href: "#" },
      { label: "Starter Notebook.zip", type: "zip", href: "#" },
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
    estimatedTime: "7-10 hours",
    level: "Advanced Level",
    overview:
      "You will build a classification pipeline that flags potentially fraudulent transactions while keeping false positives low. A key focus is making the model's decisions explainable for a non-technical review team.",
    briefRequirements: [
      "Handle class imbalance in the transaction dataset.",
      "Engineer transaction-level and account-level features.",
      "Train and tune a supervised classification model.",
      "Add explainability for flagged predictions.",
    ],
    deliverables: [
      { id: "d1", label: "Fraud detection model with metrics" },
      { id: "d2", label: "Explainability report for flagged cases" },
      { id: "d3", label: "Pipeline documentation" },
    ],
    evaluationCriteria: [
      { label: "Detection Performance", percent: 40 },
      { label: "Explainability", percent: 35 },
      { label: "Documentation", percent: 25 },
    ],
    resources: [
      { label: "Transaction Dataset Guide.pdf", type: "pdf", href: "#" },
      { label: "Starter Code.zip", type: "zip", href: "#" },
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
    estimatedTime: "6-9 hours",
    level: "Beginner Level",
    overview:
      "You will prototype a multi-sensor hub that reads temperature, air quality, and occupancy data, then streams it over MQTT to a live dashboard — a foundational IoT workflow used across smart-building systems.",
    briefRequirements: [
      "Wire up temperature, air-quality, and occupancy sensors.",
      "Write firmware to read and publish sensor data.",
      "Set up an MQTT broker and topic structure.",
      "Build a minimal live dashboard to view readings.",
    ],
    deliverables: [
      { id: "d1", label: "Working sensor hub prototype" },
      { id: "d2", label: "Firmware source code" },
      { id: "d3", label: "Live dashboard demo" },
    ],
    evaluationCriteria: [
      { label: "Hardware Functionality", percent: 40 },
      { label: "Data Reliability", percent: 35 },
      { label: "Documentation", percent: 25 },
    ],
    resources: [
      { label: "Wiring Diagram.pdf", type: "pdf", href: "#" },
      { label: "Firmware Starter.zip", type: "zip", href: "#" },
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
    estimatedTime: "9-14 hours",
    level: "Advanced Level",
    overview:
      "You will design a low-power wearable that captures motion data using an accelerometer, processes it on-device, and syncs daily activity summaries to a companion view over Bluetooth Low Energy.",
    briefRequirements: [
      "Design a compact PCB layout in KiCad.",
      "Write firmware for motion capture and power management.",
      "Implement BLE syncing to a companion view.",
      "Benchmark battery life under typical daily use.",
    ],
    deliverables: [
      { id: "d1", label: "PCB design files" },
      { id: "d2", label: "Firmware source code" },
      { id: "d3", label: "Battery-life benchmark report" },
    ],
    evaluationCriteria: [
      { label: "Hardware Design", percent: 40 },
      { label: "Power Efficiency", percent: 35 },
      { label: "Documentation", percent: 25 },
    ],
    resources: [
      { label: "PCB Design Guide.pdf", type: "pdf", href: "#" },
      { label: "Firmware Starter.zip", type: "zip", href: "#" },
    ],
  },
];