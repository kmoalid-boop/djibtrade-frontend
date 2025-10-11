import { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  className = '',
  lazy = true,
  quality = 'auto'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();
  const observerRef = useRef();

  // OPTIMISATION CLOUDINARY INTELLIGENTE
  const optimizeCloudinaryUrl = (url, desiredWidth, quality = 'auto') => {
    if (!url || !url.includes('cloudinary')) return url;
    
    // Transformation Cloudinary optimisée
    return url.replace(
      /upload\//, 
      `upload/w_${desiredWidth},f_auto,q_${quality},c_limit/`
    );
  };

  useEffect(() => {
    if (!lazy) return;

    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observerRef.current?.disconnect();
      }
    }, {
      rootMargin: '50px',
      threshold: 0.1
    });

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [lazy]);

  const optimizedSrc = optimizeCloudinaryUrl(src, width, quality);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder avec ratio correct */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
          style={{ 
            aspectRatio: `${width} / ${height}`
          }}
        />
      )}
      
      {/* Image optimisée */}
      {isInView && !hasError && (
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={lazy ? "lazy" : "eager"}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`transition-all duration-500 ${
            isLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-105'
          } ${className}`}
          style={{
            aspectRatio: `${width} / ${height}`
          }}
        />
      )}
      
      {/* Fallback si erreur */}
      {hasError && (
        <div 
          className="flex items-center justify-center bg-gray-100 text-gray-400"
          style={{ 
            aspectRatio: `${width} / ${height}`
          }}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Image non disponible</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;