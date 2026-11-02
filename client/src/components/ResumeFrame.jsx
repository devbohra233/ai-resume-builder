import { useEffect, useRef, useState } from 'react';
import ResumeDocument from './ResumeDocument';
import { cn } from '../lib/utils';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

/**
 * Renders the A4 resume scaled to the available width.
 * Pass cropHeight to show only the top of the page (dashboard thumbnails).
 */
export default function ResumeFrame({
  resume,
  className,
  cropHeight,
  placeholder = true,
  template,
  docRef,
}) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(A4_HEIGHT / 2);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return undefined;

    const update = () => {
      const width = wrap.clientWidth;
      if (!width) return;
      const nextScale = width / A4_WIDTH;
      setScale(nextScale);
      setHeight(Math.max(inner.scrollHeight, A4_HEIGHT) * nextScale);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrap);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [resume, template]);

  return (
    <div
      ref={wrapRef}
      className={cn('relative w-full overflow-hidden bg-white', className)}
      style={{ height: cropHeight || height }}
    >
      <div
        ref={(node) => {
          innerRef.current = node;
          if (docRef) docRef.current = node;
        }}
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: A4_WIDTH, transform: `scale(${scale})` }}
      >
        <ResumeDocument resume={resume} placeholder={placeholder} template={template} />
      </div>
    </div>
  );
}
