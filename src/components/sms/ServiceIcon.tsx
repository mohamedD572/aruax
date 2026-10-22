import React from 'react';
import {
  Send,
  MessageSquare,
  Globe,
  Camera,
  Play,
  Headphones,
  Users,
  Bot,
  Hash,
  Shield,
  Phone,
  Mail,
  Film,
  Key,
} from 'lucide-react';

interface ServiceIconProps {
  iconKey: string;
  className?: string;
  size?: number;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ iconKey, className = 'w-5 h-5', size = 20 }) => {
  switch (iconKey) {
    case 'Send':
      return <Send size={size} className={className} />;
    case 'MessageSquare':
      return <MessageSquare size={size} className={className} />;
    case 'Globe':
      return <Globe size={size} className={className} />;
    case 'Camera':
      return <Camera size={size} className={className} />;
    case 'Play':
      return <Play size={size} className={className} />;
    case 'Headphones':
      return <Headphones size={size} className={className} />;
    case 'Users':
      return <Users size={size} className={className} />;
    case 'Bot':
      return <Bot size={size} className={className} />;
    case 'Hash':
      return <Hash size={size} className={className} />;
    case 'Phone':
      return <Phone size={size} className={className} />;
    case 'Mail':
      return <Mail size={size} className={className} />;
    case 'Film':
      return <Film size={size} className={className} />;
    case 'Key':
      return <Key size={size} className={className} />;
    case 'Shield':
    default:
      return <Shield size={size} className={className} />;
  }
};
