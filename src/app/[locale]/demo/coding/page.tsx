/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 * 
 * Developers of Tomorrow - Proprietary Coding Curriculum
 * Features video tutorials, progressive learning path, and educational psychology integration.
 */

import React from 'react';
import EnhancedCodingCurriculum from '@/components/demo/EnhancedCodingCurriculum';
import { getCodingCurriculum } from '@/app/actions/coding-curriculum';

export const metadata = {
  title: 'Coders of Tomorrow | EdPsych Connect',
  description: 'Learn to code by modding your favourite games. From block coding to React development with video tutorials and XP tracking.',
};

export default async function CodingDemoPage() {
  const curriculumData = await getCodingCurriculum();
  
  return (
    <EnhancedCodingCurriculum 
      initialLevels={curriculumData?.levels || []}
      initialVideos={curriculumData?.videos || []}
    />
  );
}
