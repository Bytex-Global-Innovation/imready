export interface Product {
  id: string;
  name: string;
  image: string;
  comments: string;
  Model: string;
  processorcompany: string;
  processor: string;
  cores: string;
  threads: string;
  memory: string;
  storage: string;
  operatingSystem: string;
  graphics: string;
  gpuMemory: string;
  warranty: string;
  camera: string;
  battery: string;
  screen: string;
  weight: string;
  price: string;
  specialPrice: string;
  category: "consumer" | "commercial";
  tagLabel?: string;
}

export const BYTEX_IMAGE_CDN =
  "https://bytex-uex-production.s3.ap-south-1.amazonaws.com/SMB";

export function getProcessorLogoUrl(processorCompany: string): string {
  return `${BYTEX_IMAGE_CDN}/processor_logo/${processorCompany.toLowerCase()}.png`;
}

export const KEY_SPEC_FIELDS = [
  { key: "processor", field: "processor" as const },
  { key: "memory", field: "memory" as const },
  { key: "storage", field: "storage" as const },
  { key: "graphics", field: "graphics" as const },
] as const;

export const PRODUCTS_INVENTORY: Product[] = [
  {
    id: "1",
    name: "Lenovo V14 Gen 4",
    image:
      "https://bytex-uex-production.s3.ap-south-1.amazonaws.com/SMB/Lenovo+Thinkpad+E14+Gen+6+new.jpeg",
    comments: `Professional hardware security & build quality.
 Top durability and reliability in the category.
 Unbeatable performance-to-price ratio in the E14 lineup.`,
    Model: "21M3007NIG",
    processorcompany: "AMD",
    processor: "Ryzen™ 3 7520U Processor",
    cores: "6",
    threads: "12",
    memory: "8 GB",
    storage: "512 GB",
    operatingSystem: "Windows 11 Home",
    graphics: "Integrated AMD Graphics",
    gpuMemory: "Integrated",
    warranty: "1 Yr Onsite Warranty",
    camera: "720P HD with Dual Microphone",
    battery: "2 Cell Rechargeable Li-ion 38Wh",
    screen:
      '35.56cms (14) FHD (1920 x 1080), TN, Anti-Glare, Non-Touch, 45%NTSC, 250 nits, Narrow Bezel',
    weight: "1420g",
    price: "₹ 44,800",
    specialPrice: "₹ 35,000",
    category: "commercial",
  },
  {
    id: "2",
    name: "Lenovo V14",
    image:
      "https://bytex-uex-production.s3.ap-south-1.amazonaws.com/SMB/Asus+Expertbook+B1.jpeg",
    comments: `Ultra lightweight 14 inch chassis.
 Essential power for basic office tasks.
 Portable for on-the-go business work.`,
    Model: "B1403",
    processorcompany: "Intel",
    processor: "13th Generation Intel® Core™ i3-1315U Processor",
    cores: "6",
    threads: "8",
    memory: "8 GB",
    storage: "512 GB",
    operatingSystem: "Windows 11 Home",
    graphics: "Integrated Intel® UHD Graphics",
    gpuMemory: "Integrated",
    warranty: "1 Yr Onsite Warranty",
    camera: "720p HD camera with privacy shutter",
    battery: "2 Cell Rechargeable Li-ion 38Wh",
    screen: '14" FHD (1920 x 1080), TN, Anti-Glare, Non-Touch, 45%NTSC, 250 nits, 60Hz',
    weight: "1400g",
    price: "₹ 35,500",
    specialPrice: "₹ 35,500",
    category: "commercial",
  },
  {
    id: "3",
    name: "Lenovo V15 Gen5i",
    image:
      "https://bytex-uex-production.s3.ap-south-1.amazonaws.com/SMB/lenvo+v15.jpg",
    comments: `Large 15.6-inch screen for comfortable viewing.
Dedicated number keypad for faster data entry.
Smooth performance for everyday office work and big files.`,
    Model: "83HF006YIG",
    processorcompany: "Intel",
    processor: "13th Generation Intel® Core™ i3-1315U Processor",
    cores: "6",
    threads: "8",
    memory: "8 GB",
    storage: "512 GB",
    operatingSystem: "Windows 11 Home",
    graphics: "Integrated Intel® UHD Graphics",
    gpuMemory: "Integrated",
    warranty: "1 Yr Onsite Warranty",
    camera: "HD 720p with Privacy Shutter",
    battery: "2 Cell Rechargeable Li-ion 38Wh",
    screen: '14" FHD (1920 x 1080), TN, Anti-Glare, Non-Touch, 45%NTSC, 250 nits, 60Hz',
    weight: "1610g",
    price: "₹ 38,450",
    specialPrice: "₹ 38,450",
    category: "consumer",
  },
];

export const COMPARE_SPEC_ROWS: { label: string; key: keyof Product }[] = [
  { label: "Model", key: "Model" },
  { label: "Processor Company", key: "processorcompany" },
  { label: "Processor", key: "processor" },
  { label: "Cores", key: "cores" },
  { label: "Threads", key: "threads" },
  { label: "Memory", key: "memory" },
  { label: "Storage", key: "storage" },
  { label: "Operating System", key: "operatingSystem" },
  { label: "Graphics", key: "graphics" },
  { label: "GPU Memory", key: "gpuMemory" },
  { label: "Warranty", key: "warranty" },
  { label: "Camera", key: "camera" },
  { label: "Battery", key: "battery" },
  { label: "Screen", key: "screen" },
  { label: "Weight", key: "weight" },
];

export const COMPARE_BREADCRUMBS = [
  { key: "home", label: "Home", href: "/", showHomeIcon: true, isCurrent: false },
  { key: "bytex", label: "Bytex", href: "/bytex", showHomeIcon: false, isCurrent: false },
  {
    key: "compare",
    label: "Compare Devices",
    href: null as string | null,
    showHomeIcon: false,
    isCurrent: true,
  },
];

export const COMPARE_PRICING_CTA = {
  unlockButtonLabel: "Unlock Student Discount",
  verificationHint: "Get up to 20% off with verification",
} as const;

export const COMPARE_MOBILE_SCROLL_HINT = "Scroll right to see more";
