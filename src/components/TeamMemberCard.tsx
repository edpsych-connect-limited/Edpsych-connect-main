/**
 * TeamMemberCard Component - Enterprise-Grade Team Member Display
 *
 * This component provides a robust, professional display for team members
 * with graceful handling of missing images and enterprise-level error handling.
 */

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { FaLinkedin, FaTwitter, FaEnvelope, FaUser } from 'react-icons/fa';

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  email?: string;
}

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  socialLinks: SocialLinks;
}

interface TeamMemberCardProps {
  member: TeamMember;
}

/**
 * Professional Avatar Placeholder Component
 */
const AvatarPlaceholder: React.FC<{ name: string; size?: 'small' | 'medium' | 'large' }> = ({
  name,
  size = 'large'
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    small: 'w-12 h-12 text-sm',
    medium: 'w-16 h-16 text-lg',
    large: 'w-24 h-24 text-xl'
  };

  // Generate consistent color based on name
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500'
  ];

  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  return (
    <div className={`${sizeClasses[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
      {initials || <FaUser className="w-8 h-8" />}
    </div>
  );
};

/**
 * Professional Image Component with Error Handling
 */
const ProfessionalImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fallbackName: string;
}> = ({ src, alt, className = '', fallbackName }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  if (imageError || !src || src.includes('placeholder')) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <AvatarPlaceholder name={fallbackName} size="large" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

/**
 * Social Links Component
 */
const SocialLinks: React.FC<{ links: SocialLinks; variant?: 'overlay' | 'inline' }> = ({
  links,
  variant = 'inline'
}) => {
  const baseClasses = "transition-colors duration-200";
  const overlayClasses = "text-white hover:text-blue-300";
  const inlineClasses = "text-gray-400 hover:text-blue-600";

  const classes = variant === 'overlay' ? overlayClasses : inlineClasses;
  const size = variant === 'overlay' ? 'h-6 w-6' : 'h-5 w-5';

  return (
    <div className={`flex space-x-4 ${variant === 'overlay' ? 'justify-center' : ''}`}>
      {links.linkedin && (
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses} ${classes}`}
          aria-label={`${links.linkedin} profile`}
        >
          <FaLinkedin className={size} />
        </a>
      )}
      {links.twitter && (
        <a
          href={links.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses} ${classes}`}
          aria-label="Twitter profile"
        >
          <FaTwitter className={size} />
        </a>
      )}
      {links.email && (
        <a
          href={`mailto:${links.email}`}
          className={`${baseClasses} ${classes}`}
          aria-label="Email contact"
        >
          <FaEnvelope className={size} />
        </a>
      )}
    </div>
  );
};

/**
 * Main TeamMemberCard Component
 */
const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-gray-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-w-3 aspect-h-2 overflow-hidden">
        <ProfessionalImage
          src={member.image}
          alt={`${member.name} - ${member.role}`}
          className="w-full h-64"
          fallbackName={member.name}
        />

        {/* Overlay with Social Links */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute bottom-0 w-full p-4">
            <SocialLinks links={member.socialLinks} variant="overlay" />
          </div>
        </div>

        {/* Professional Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
            {member.role.includes('Senior') || member.role.includes('Chief') || member.role.includes('Director')
              ? 'Senior Leadership'
              : member.role.includes('Executive')
              ? 'Executive Team'
              : 'Team Member'
            }
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
          {member.name}
        </h3>

        <p className="text-blue-600 font-medium mb-4 text-sm leading-tight">
          {member.role}
        </p>

        <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-gray-600 text-sm leading-relaxed">
            {member.bio}
          </p>
        </div>

        {/* Inline Social Links */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <SocialLinks links={member.socialLinks} variant="inline" />
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
export { AvatarPlaceholder, ProfessionalImage, SocialLinks };
export type { TeamMember };
// Note: SocialLinks type is already exported through the component export