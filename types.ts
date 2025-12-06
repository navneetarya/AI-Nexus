import { LucideIcon } from 'lucide-react';

export enum Category {
  ALL = 'All',
  WRITING = 'Writing',
  IMAGE = 'Image',
  VIDEO = 'Video',
  AUDIO = 'Audio',
  MARKETING = 'Marketing',
  DESIGN = 'Design',
  CODING = 'Coding',
  PRODUCTIVITY = 'Productivity',
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Category;
  affiliateLink: string;
  iconName: string; 
  color?: string;
}

export interface FilterState {
  search: string;
  category: Category;
}