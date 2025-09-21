import { useEffect, useRef, useState } from 'react';
import '@google/model-viewer';

interface ModelViewerProps {
  src?: string;
  iosSrc?: string;
  width?: number;
  height?: number;
  alt?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  ar?: boolean;
  arModes?: string; // e.g. "quick-look scene-viewer webxr"
  poster?: string;
  style?: React.CSSProperties;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          'ios-src'?: string;
          alt?: string;
          'auto-rotate'?: boolean;
          'camera-controls'?: boolean;
          'shadow-intensity'?: number;
          ar?: boolean;
          'ar-modes'?: string;
          poster?: string;
          style?: React.CSSProperties;
        },
        HTMLElement
      >;
    }
  }
}

export const ModelViewer = ({
  src,
  iosSrc,
  width = 300,
  height = 200,
  alt = "3D Model",
  autoRotate = true,
  cameraControls = true,
  ar = true,
  arModes = 'quick-look',
  poster,
  style: customStyle
}: ModelViewerProps) => {
  const modelViewerRef = useRef<HTMLElement>(null);
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(src);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;

    if (!modelViewer) return;

    const handleLoad = () => {
      console.log('Model loaded successfully');
    };

    const handleError = (event: Event & { detail?: any }) => {
      console.error('Model loading error:', event);
      // If GLB load failed, drop src to fall back to AR-only
      const type = (event as any)?.detail?.type;
      if (type === 'loadfailure') {
        setResolvedSrc(undefined);
      }
    };

    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);

    return () => {
      modelViewer.removeEventListener('load', handleLoad);
      modelViewer.removeEventListener('error', handleError);
    };
  }, []);

  // Probe that GLB exists; if not, fall back to poster+AR only
  useEffect(() => {
    let cancelled = false;
    if (!src) {
      setResolvedSrc(undefined);
      return;
    }
    const check = async () => {
      try {
        const res = await fetch(src, { method: 'HEAD', cache: 'no-store' });
        if (!cancelled) setResolvedSrc(res.ok ? src : undefined);
      } catch {
        if (!cancelled) setResolvedSrc(undefined);
      }
    };
    check();
    return () => { cancelled = true; };
  }, [src]);

  return (
    <model-viewer
      ref={modelViewerRef}
      {...(resolvedSrc ? { src: resolvedSrc } : {})}
      {...(iosSrc ? { ['ios-src']: iosSrc } : {})}
      alt={alt}
      auto-rotate={autoRotate}
      camera-controls={cameraControls}
      ar={ar}
      ar-modes={arModes}
      shadow-intensity={1}
      {...(poster ? { poster } : {})}
      style={customStyle ?? {
        width: `${width}px`,
        height: `${height}px`,
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f5f5f5'
      }}
    />
  );
};
