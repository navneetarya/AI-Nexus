import React from 'react';
import { 
  PenTool, 
  Image as ImageIcon, 
  Video, 
  Code2, 
  FileText, 
  Mic, 
  Copy, 
  Film, 
  SearchCode, 
  ListMusic, 
  Zap,
  Speaker,
  Megaphone,
  Palette,
  Layout,
  Wand2,
  Bot,
  BrainCircuit,
  Cpu,
  Globe,
  MessageSquare,
  BarChart,
  Layers,
  Crop,
  Music,
  MonitorPlay,
  Shield,
  Box,
  User,
  Briefcase,
  Share2,
  Terminal,
  CheckSquare,
  Clock,
  Sparkles,
  Search,
  Type,
  LucideProps
} from 'lucide-react';

interface IconProps extends LucideProps {
  name: string;
}

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const icons: Record<string, React.FC<LucideProps>> = {
    PenTool,
    ImageIcon,
    Video,
    Code2,
    FileText,
    Mic,
    Copy,
    Film,
    SearchCode,
    ListMusic,
    Zap,
    Speaker,
    Megaphone,
    Palette,
    Layout,
    Wand2,
    Bot,
    BrainCircuit,
    Cpu,
    Globe,
    MessageSquare,
    BarChart,
    Layers,
    Crop,
    Music,
    MonitorPlay,
    Shield,
    Box,
    User,
    Briefcase,
    Share2,
    Terminal,
    CheckSquare,
    Clock,
    Sparkles,
    Search,
    Type
  };

  const SelectedIcon = icons[name] || Zap;

  return <SelectedIcon {...props} />;
};