/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState } from 'react';
import Image from 'next/image';
import type { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackElement?: React.ReactNode;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  fallbackElement,
  alt,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  const handleError = () => {
    if (fallbackSrc && !error) {
      setImgSrc(fallbackSrc);
      setError(true);
    }
  };

  if (error && !fallbackSrc && fallbackElement) {
    return <>{fallbackElement}</>;
  }

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  );
};

export default ImageWithFallback;