import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect, useId } from 'react';
import Image from 'next/image';
import type { ImageProps } from 'next/image';


interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  classNameWrapper?: string;
  fallbackComponent?: React.ReactNode;
  onLoad?: () => void;
}

// Helper component to avoid inline styles
const FallbackDiv = ({ width, height, className, children }: { width: string | number | undefined, height: string | number | undefined, className: string, children: React.ReactNode }) => {
  const id = useId().replace(/:/g, '');
  const widthVal = typeof width === 'number' ? `${width}px` : width;
  const heightVal = typeof height === 'number' ? `${height}px` : height;
  
  return (
    <>
      <style>{`
        .fallback-${id} {
          width: ${widthVal};
          height: ${heightVal};
        }
      `}</style>
      <div
        className={`bg-gray-200 flex items-center justify-center ${className} fallback-${id}`}
      >
        {children}
      </div>
    </>
  );
};

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  className = '',
  classNameWrapper = '',
  width,
  height,
  onLoad,
  fallbackComponent,
  placeholder = 'blur',
  blurDataURL,
  ...props
}) => {
  const [error, setError] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const startTime = React.useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();
  }, []);

  const defaultBlur = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHN0eWxlPSJmaWxsOiNlOWVhZWI7Ii8+PC9zdmc+';

  const handleError = () => {
    console.warn('Image failed to load', {
      component: 'OptimizedImage',
      operation: 'error',
      metadata: { src, alt, width, height }
    });
    setError(true);
  };

  const handleLoad = () => {
    const endTime = performance.now();
    const loadDuration = endTime - startTime.current;
    setLoaded(true);

    console.info(`Image load time: ${loadDuration}ms`, {
      component: 'OptimizedImage',
      operation: 'load',
      duration: loadDuration,
      metadata: {
        src: typeof src === 'string' ? src : 'object',
        width,
        height
      }
    });

    if (onLoad) onLoad();
  };

  return (
    <div className={`relative ${classNameWrapper}`}>
      {error ? (
        fallbackComponent ? (
          fallbackComponent
        ) : fallbackSrc ? (
          <Image
            src={fallbackSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            {...props}
          />
        ) : (
          <FallbackDiv width={width} height={height} className={className}>
            <svg
              className="w-10 h-10 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </FallbackDiv>
        )
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          onError={handleError}
          onLoad={handleLoad}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlur}
          priority={props.priority}
          {...props}
        />
      )}

      {!loaded && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
        >
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;