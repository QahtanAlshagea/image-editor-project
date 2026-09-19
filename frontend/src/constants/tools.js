import {
  FileCog,
  Layers,
  Crop,
  SlidersHorizontal,
  Sparkles,
  PenTool,
  Combine,
  Wand2,
} from "lucide-react";

export const TOOLS = [
  { id: "convert", label: "الصيغة", icon: FileCog },
  { id: "background", label: "الخلفية", icon: Layers },
  { id: "transform", label: "القص والتحويل", icon: Crop },
  { id: "enhance", label: "تحسين البكسل", icon: SlidersHorizontal },
  { id: "filters", label: "الفلاتر", icon: Sparkles },
  { id: "draw", label: "الرسم", icon: PenTool },
  { id: "merge", label: "الدمج", icon: Combine },
  { id: "creative", label: "أدوات إبداعية", icon: Wand2 },
];
