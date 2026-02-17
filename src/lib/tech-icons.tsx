import type { IconType } from "react-icons";
import {
  SiPython,
  SiNextdotjs,
  SiHtml5,
  SiTiktok,
  SiStoryblok,
} from "react-icons/si";
import {
  TbBrandMonday,
} from "react-icons/tb";
import {
  HiOutlineChartBar,
  HiOutlineLightBulb,
  HiOutlineRocketLaunch,
  HiOutlineMegaphone,
  HiOutlineUserGroup,
  HiOutlineCog6Tooth,
  HiOutlineBolt,
  HiOutlineChartPie,
  HiOutlineHandRaised,
  HiOutlineCubeTransparent,
  HiOutlineCursorArrowRays,
  HiOutlinePresentationChartLine,
  HiOutlineEnvelope,
  HiOutlineWrenchScrewdriver,
  HiOutlineMapPin,
  HiOutlineArrowTrendingUp,
} from "react-icons/hi2";

const iconMap: Record<string, IconType> = {
  // Tech stack
  "python": SiPython,
  "next.js": SiNextdotjs,
  "nextjs": SiNextdotjs,
  "html": SiHtml5,
  "tiktok business api": SiTiktok,
  "monday.com": TbBrandMonday,
  "storyblok": SiStoryblok,

  // Skills — marketing & strategy
  "marketing leadership": HiOutlineMegaphone,
  "brand strategy": HiOutlineLightBulb,
  "growth marketing": HiOutlineArrowTrendingUp,
  "demand generation": HiOutlineRocketLaunch,
  "gtm planning": HiOutlineMapPin,
  "revenue and p&l ownership": HiOutlineChartBar,
  "team management": HiOutlineUserGroup,
  "operations": HiOutlineCog6Tooth,
  "marketing automation": HiOutlineBolt,
  "data and analytics": HiOutlineChartPie,
  "stakeholder alignment": HiOutlineHandRaised,
  "product collaboration": HiOutlineCubeTransparent,
  "digital marketing": HiOutlineCursorArrowRays,
  "performance marketing": HiOutlinePresentationChartLine,
  "crm": HiOutlineEnvelope,
  "martech": HiOutlineWrenchScrewdriver,
  "go-to-market strategy": HiOutlineRocketLaunch,
};

export function getTechIcon(name: string): IconType | null {
  return iconMap[name.toLowerCase()] || null;
}
