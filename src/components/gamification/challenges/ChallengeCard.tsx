/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  GAMIFICATION_COLORS,
  SHADOWS,
  TYPOGRAPHY,
  DIFFICULTY_STYLES,
  BORDER_RADIUS,
} from '../design-system/GamificationTheme';
import { PointDisplay } from '../common/PointDisplay';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'expired';
export type ChallengeCategory =
  | 'math'
  | 'science'
  | 'language'
  | 'history'
  | 'geography'
  | 'arts'
  | 'sports'
  | 'social_studies'
  | 'programming'
  | 'special';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  difficulty: ChallengeDifficulty;
  category: ChallengeCategory;
  points: number;
  status: ChallengeStatus;
  progress?: number; // 0-100
  expiresAt?: Date;
  completedAt?: Date;
  image?: string;
  duration?: number; // in minutes
  prerequisites?: string[];
  tags?: string[];
  linkedAchievementId?: string;
}

export interface ChallengeCardProps {
  challenge: Challenge;
  onSelect?: (challenge: Challenge) => void;
  onStart?: (challenge: Challenge) => void;
  size?: 'small' | 'medium' | 'large';
  animate?: boolean;
  className?: string;
}

/**
 * ChallengeCard - An engaging, interactive card for educational challenges
 *
 * Migrated from edpsych-connect-school-new2 with enterprise-grade improvements.
 * Provides difficulty-based styling, progress tracking, time indicators, and accessibility.
 */
const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onSelect,
  onStart,
  size = 'medium',
  animate = true,
  className = '',
}) => {
  const {
    title,
    description,
    shortDescription,
    difficulty,
    points,
    status,
    progress = 0,
    expiresAt,
    completedAt,
    image,
    duration,
    tags = [],
  } = challenge;

  const difficultyStyle = DIFFICULTY_STYLES[difficulty];

  const sizeStyles = {
    small: {
      container: 'p-3 w-64',
      image: 'h-28',
      title: 'text-sm',
      description: 'text-xs line-clamp-2',
      progressBar: 'h-1.5',
      tag: 'text-xs px-1.5 py-0.5',
      icon: 'w-4 h-4',
      button: 'text-xs py-1.5 px-3',
    },
    medium: {
      container: 'p-4 w-80',
      image: 'h-36',
      title: 'text-base',
      description: 'text-sm line-clamp-3',
      progressBar: 'h-2',
      tag: 'text-xs px-2 py-0.5',
      icon: 'w-5 h-5',
      button: 'text-sm py-2 px-4',
    },
    large: {
      container: 'p-5 w-96',
      image: 'h-48',
      title: 'text-lg font-semibold',
      description: 'text-base line-clamp-4',
      progressBar: 'h-2.5',
      tag: 'text-sm px-2.5 py-1',
      icon: 'w-6 h-6',
      button: 'text-base py-2.5 px-5',
    },
  };

  const cardVariants = {
    initial: animate
      ? {
          opacity: 0,
          y: 20,
          scale: 0.95,
        }
      : {},
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4 },
    },
    hover: {
      y: -5,
      boxShadow: difficultyStyle.shadow,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  };

  const formatTimeRemaining = () => {
    if (!expiresAt) return null;

    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m remaining`;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''} remaining`;
  };

  const getStatusDetails = () => {
    switch (status) {
      case 'pending':
        return {
          color: GAMIFICATION_COLORS.neutrals.dark,
          background: GAMIFICATION_COLORS.neutrals.lightest,
          label: 'Not Started',
        };
      case 'active':
        return {
          color: GAMIFICATION_COLORS.primary.base,
          background: GAMIFICATION_COLORS.primary.lightest,
          label: 'In Progress',
        };
      case 'completed':
        return {
          color: GAMIFICATION_COLORS.success.dark,
          background: GAMIFICATION_COLORS.success.lightest,
          label: 'Completed',
        };
      case 'expired':
        return {
          color: GAMIFICATION_COLORS.challenge.dark,
          background: GAMIFICATION_COLORS.challenge.lightest,
          label: 'Expired',
        };
      default:
        return {
          color: GAMIFICATION_COLORS.neutrals.dark,
          background: GAMIFICATION_COLORS.neutrals.lightest,
          label: 'Unknown',
        };
    }
  };

  const statusDetails = getStatusDetails();

  return (
    <motion.div
      className={`
        rounded-lg overflow-hidden bg-white flex flex-col
        ${sizeStyles[size].container} ${className}
      `}
      style={{
        boxShadow: SHADOWS.medium,
        borderRadius: BORDER_RADIUS.large,
        border: `2px solid ${difficultyStyle.primaryColor}1A`,
      }}
      initial={cardVariants.initial}
      animate={cardVariants.animate}
      whileHover={cardVariants.hover}
      whileTap={cardVariants.tap}
      onClick={() => onSelect && onSelect(challenge)}
      role="button"
      aria-label={`Challenge: ${title}, status: ${statusDetails.label}`}
    >
      {/* Challenge Image */}
      <div
        className={`
          relative mb-3 rounded overflow-hidden
          ${sizeStyles[size].image}
          ${!image ? 'bg-gradient-to-r' : ''}
        `}
        style={!image ? { background: difficultyStyle.background } : {}}
      >
        {image ? (
          <Image
            src={image.startsWith('/') ? image : `/images/${image}`}
            alt={title}
            className="w-full h-full object-cover"
            width={400}
            height={300}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={difficultyStyle.primaryColor}
              className={`${sizeStyles[size].icon} opacity-50 w-12 h-12`}
              aria-hidden="true"
            >
              <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
              <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
              <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
            </svg>
          </div>
        )}

        {/* Difficulty Badge */}
        <div
          className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center"
          style={{
            backgroundColor: `${difficultyStyle.primaryColor}1A`,
            color: difficultyStyle.primaryColor,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3 h-3 mr-1"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </div>

        {/* Points Badge */}
        <div className="absolute bottom-2 left-2">
          <PointDisplay points={points} size="sm" />
        </div>
      </div>

      {/* Title and Description */}
      <h3
        className={`${sizeStyles[size].title} font-medium mb-1`}
        style={{
          color: difficultyStyle.primaryColor,
          fontFamily: TYPOGRAPHY.fontFamily.accent,
        }}
      >
        {title}
      </h3>

      <p className={`${sizeStyles[size].description} mb-3`}>
        {shortDescription || description}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`
                ${sizeStyles[size].tag} rounded-full
                bg-gray-100 text-gray-600 font-medium
              `}
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span
              className={`
                ${sizeStyles[size].tag} rounded-full
                bg-gray-100 text-gray-600 font-medium
              `}
            >
              +{tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Status and Progress */}
      <div className="mt-auto">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="font-medium" style={{ color: statusDetails.color }}>
            {statusDetails.label}
          </span>

          {status === 'active' && expiresAt && (
            <span className="text-gray-500">{formatTimeRemaining()}</span>
          )}

          {status === 'completed' && completedAt && (
            <span className="text-gray-500">
              {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
              }).format(completedAt)}
            </span>
          )}

          {duration && status === 'pending' && (
            <span className="text-gray-500 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3 h-3 mr-1"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                  clipRule="evenodd"
                />
              </svg>
              {duration} min
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {status !== 'pending' && (
          <div
            className={`w-full ${sizeStyles[size].progressBar} bg-gray-200 rounded-full overflow-hidden mb-3`}
          >
            <motion.div
              className="h-full"
              style={{
                background:
                  status === 'completed'
                    ? `linear-gradient(90deg, ${GAMIFICATION_COLORS.success.light}, ${GAMIFICATION_COLORS.success.base})`
                    : difficultyStyle.background,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${status === 'completed' ? 100 : progress}%` }}
              transition={{
                duration: animate ? 1 : 0,
                delay: animate ? 0.3 : 0,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            />
          </div>
        )}

        {/* Action Button */}
        {status === 'pending' && onStart && (
          <button
            className={`
              ${sizeStyles[size].button} w-full rounded-full font-medium
              transition-all duration-300 mt-2
            `}
            style={{
              backgroundColor: difficultyStyle.primaryColor,
              color: '#FFFFFF',
              boxShadow: difficultyStyle.shadow,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onStart(challenge);
            }}
          >
            Start Challenge
          </button>
        )}

        {status === 'active' && (
          <button
            className={`
              ${sizeStyles[size].button} w-full rounded-full font-medium
              transition-all duration-300 mt-2
            `}
            style={{
              backgroundColor: GAMIFICATION_COLORS.primary.base,
              color: '#FFFFFF',
              boxShadow: SHADOWS.medium,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(challenge);
            }}
          >
            Continue
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ChallengeCard;