'use client';

import { useId, useLayoutEffect, useMemo, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './StrokeText.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * SplitText Component
 * Splits text into words and characters for smooth GSAP stagger animations
 * while strictly preserving line breaks, responsive typography, font weight, and colors.
 */
export const SplitText = ({
  text = '',
  className = '',
  delay = 40,
  duration = 0.6,
  stagger = 0.025,
  animationFrom = { opacity: 0, y: 32 },
  animationTo = { opacity: 1, y: 0 },
  ease = 'power3.out',
  easing, // fallback alias
  threshold = 0.1,
  rootMargin = '-50px',
  textAlign = 'left',
  splitBy = 'chars', // 'chars' | 'words'
  onLetterAnimationComplete,
  children
}) => {
  const containerRef = useRef(null);
  const elementsRef = useRef([]);

  const content = text || (typeof children === 'string' ? children : '');

  // Split content into words
  const words = useMemo(() => {
    return content ? content.split(' ') : [];
  }, [content]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === 'undefined' || elementsRef.current.length === 0) return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(elementsRef.current, { opacity: 1, y: 0, clearProps: 'all' });
      return;
    }

    const resolvedEase = ease || easing || 'power3.out';
    const resolvedStagger = stagger ?? (delay ? delay / 1000 : 0.025);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementsRef.current,
        { ...animationFrom },
        {
          ...animationTo,
          duration,
          ease: resolvedEase,
          stagger: resolvedStagger,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
          },
          onComplete: () => {
            if (onLetterAnimationComplete) {
              onLetterAnimationComplete();
            }
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [content, delay, duration, stagger, ease, easing, animationFrom, animationTo, onLetterAnimationComplete]);

  // Clear elementsRef on each render pass before mapping
  elementsRef.current = [];

  return (
    <span
      ref={containerRef}
      className={`inline ${className}`.trim()}
      style={{ textAlign, display: 'inline' }}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap">
          {splitBy === 'words' ? (
            <span
              ref={el => {
                if (el) elementsRef.current.push(el);
              }}
              className="inline-block will-change-[transform,opacity]"
            >
              {word}
            </span>
          ) : (
            Array.from(word).map((char, charIndex) => (
              <span
                key={charIndex}
                ref={el => {
                  if (el) elementsRef.current.push(el);
                }}
                className="inline-block will-change-[transform,opacity]"
              >
                {char}
              </span>
            ))
          )}
          {wordIndex < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  );
};

/* =========================================================================
   StrokeText Component (SVG-based stroke drawing & fill animation)
   Strictly follows palette: neon lime (#8AD82A) and crisp white (#FFFFFF)
   ========================================================================= */

const DEFAULT_STROKE_TEXT = 'CAS ENET\'Com';
const SHADOW_OPACITY = 0.5;

const getWipeFrames = (box, wipeFrom) => {
  const end = { x: box.x, y: box.y, width: box.width, height: box.height };
  if (wipeFrom === 'right') return { start: { ...end, x: box.x + box.width, width: 0 }, end };
  if (wipeFrom === 'top') return { start: { ...end, height: 0 }, end };
  if (wipeFrom === 'bottom') return { start: { ...end, y: box.y + box.height, height: 0 }, end };
  return { start: { ...end, width: 0 }, end };
};

const getDashPattern = (strokeStyle, dashLength, strokeWidth) => {
  const width = Math.max(Number(strokeWidth) || 0, 0.1);
  const length = Math.max(Number(dashLength) || 0, 1);
  if (strokeStyle === 'dotted') {
    const gap = Math.max(length, width * 1.8);
    return { array: `0 ${gap}`, period: gap };
  }
  if (strokeStyle === 'dashed') {
    const on = Math.max(length - width, 0.5);
    const off = length * 0.6 + width;
    return { array: `${on} ${off}`, period: on + off };
  }
  return null;
};

export const StrokeText = ({
  text = DEFAULT_STROKE_TEXT,
  strokeColor = '#8AD82A',
  fillColor = '#FFFFFF',
  strokeWidth = 1.4,
  drawDuration = 1.6,
  fillDelay = 0.2,
  stagger = 0.05,
  ease = 'power2.out',
  trigger = 'mount',
  fillMode = 'wipe',
  wipeFrom = 'left',
  fontSize = 128,
  fontWeight = 800,
  fontFamily = 'inherit',
  letterSpacing = -4,
  reverse = false,
  strokeStyle = 'solid',
  dashLength = 10,
  marching = false,
  hoverRedraw = false,
  shadow = false,
  shadowColor,
  className = '',
  style = {}
}) => {
  const rootRef = useRef(null);
  const strokeTextRef = useRef(null);
  const wipeRectRef = useRef(null);
  const shadowRef = useRef(null);

  const [box, setBox] = useState(null);

  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const wipeId = `stroke-text-wipe-${baseId}`;
  const revealId = `stroke-text-reveal-${baseId}`;
  const erodeId = `stroke-text-erode-${baseId}`;
  const shadowId = `stroke-text-shadow-${baseId}`;

  const characters = useMemo(() => Array.from(String(text ?? '')), [text]);

  const dash = Math.max(fontSize * 7, 200);
  const pattern = getDashPattern(strokeStyle, dashLength, strokeWidth);
  const dashArray = pattern ? pattern.array : null;
  const dashPeriod = pattern ? pattern.period : 0;
  const lift = fontSize * 0.06;
  const softness = fontSize * 0.016;
  const castShadow = shadow && fillMode !== 'none';

  const fontStyle = useMemo(
    () => ({
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight,
      letterSpacing: `${letterSpacing}px`
    }),
    [fontFamily, fontSize, fontWeight, letterSpacing]
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !strokeTextRef.current) return undefined;

    let cancelled = false;

    const measure = () => {
      if (cancelled || !strokeTextRef.current) return;
      let bbox;
      try {
        bbox = strokeTextRef.current.getBBox();
      } catch {
        return;
      }
      if (!bbox || !bbox.width) return;

      const pad = Math.max(Number(strokeWidth) || 1, fontSize * 0.1);
      const next = {
        x: bbox.x - pad,
        y: bbox.y - pad,
        width: bbox.width + pad * 2,
        height: bbox.height + pad * 2
      };

      setBox(prev =>
        prev &&
          Math.abs(prev.x - next.x) < 0.5 &&
          Math.abs(prev.width - next.width) < 0.5 &&
          Math.abs(prev.y - next.y) < 0.5 &&
          Math.abs(prev.height - next.height) < 0.5
          ? prev
          : next
      );
    };

    measure();
    document.fonts?.ready?.then(measure).catch(() => { });

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(root);

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [characters, fontFamily, fontSize, fontWeight, letterSpacing, strokeWidth]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (typeof window === 'undefined' || !root || !box) return undefined;

    const strokes = gsap.utils.toArray(root.querySelectorAll('[data-stroke-char]'));
    const fills = gsap.utils.toArray(root.querySelectorAll('[data-fill-char]'));
    const wipe = wipeRectRef.current;
    const outline = strokeTextRef.current;
    const drop = shadowRef.current;
    if (!strokes.length) return undefined;

    const fillEnabled = fillMode !== 'none';
    const useWipe = fillEnabled && fillMode === 'wipe';
    const fillDuration = Math.max(0.4, drawDuration * 0.5);
    const staggerConfig = reverse ? { each: stagger, from: 'end' } : stagger;
    const frames = getWipeFrames(box, wipeFrom);
    const lifted = { dx: lift, dy: lift, 'flood-opacity': SHADOW_OPACITY };
    const grounded = { dx: 0, dy: 0, 'flood-opacity': 0 };
    const targets = [...strokes, ...fills, wipe, drop].filter(Boolean);

    const setStart = () => {
      gsap.killTweensOf(targets);
      gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: dash, strokeOpacity: 1 });
      gsap.set(fills, { opacity: useWipe ? 1 : 0 });
      if (wipe) gsap.set(wipe, { attr: frames.start });
      if (drop) gsap.set(drop, { attr: grounded });
    };

    const setEnd = () => {
      gsap.killTweensOf(targets);
      gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: 0, strokeOpacity: 1 });
      gsap.set(fills, { opacity: fillEnabled ? 1 : 0 });
      if (wipe) gsap.set(wipe, { attr: fillEnabled ? frames.end : frames.start });
      if (drop) gsap.set(drop, { attr: fillEnabled ? lifted : grounded });
    };

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setEnd();
      return () => gsap.killTweensOf(targets);
    }

    const build = () => {
      setStart();
      const looping = trigger === 'loop';
      const tl = gsap.timeline({
        paused: true,
        repeat: looping ? -1 : 0,
        repeatDelay: looping ? 0.9 : 0,
        yoyo: looping,
        defaults: { overwrite: 'auto' }
      });

      tl.to(strokes, { strokeDashoffset: 0, duration: drawDuration, ease, stagger: staggerConfig }, 0);

      if (useWipe && wipe) {
        tl.to(wipe, { attr: frames.end, duration: fillDuration, ease: 'power2.inOut' }, drawDuration + fillDelay);
      } else if (fillEnabled) {
        tl.to(
          fills,
          { opacity: 1, duration: fillDuration, ease: 'power2.out', stagger: staggerConfig },
          drawDuration + fillDelay
        );
      }

      if (drop && fillEnabled) {
        tl.to(
          drop,
          { attr: lifted, duration: fillDuration * 1.4, ease: 'power3.out' },
          drawDuration + fillDelay + fillDuration * 0.3
        );
      }

      return tl;
    };

    let timeline = null;
    let scrollTrigger = null;
    const listeners = [];

    const listen = handler => {
      root.addEventListener('pointerenter', handler);
      listeners.push(handler);
    };

    if (trigger === 'hover') {
      setEnd();
      listen(() => {
        timeline?.kill();
        timeline = build();
        timeline.play(0);
      });
    } else {
      timeline = build();
      if (trigger === 'scroll') {
        scrollTrigger = ScrollTrigger.create({
          trigger: root,
          start: 'top 82%',
          once: true,
          onEnter: () => timeline?.play(0)
        });
      } else {
        timeline.play(0);
      }
    }

    return () => {
      timeline?.kill();
      scrollTrigger?.kill();
      listeners.forEach(remove => root.removeEventListener('pointerenter', remove));
      gsap.killTweensOf(targets);
    };
  }, [
    box,
    castShadow,
    dash,
    drawDuration,
    ease,
    fillDelay,
    fillMode,
    lift,
    reverse,
    stagger,
    trigger,
    wipeFrom
  ]);

  const wipeFrames = box ? getWipeFrames(box, wipeFrom) : null;
  const wipeStart = wipeFrames?.start;

  const outlineLayer = (
    <text
      ref={strokeTextRef}
      className="stroke-text__stroke"
      x="0"
      y="0"
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray || undefined}
      style={fontStyle}
    >
      {characters.map((char, index) => (
        <tspan data-stroke-char key={`s-${index}`}>
          {char}
        </tspan>
      ))}
    </text>
  );

  return (
    <span
      ref={rootRef}
      className={`stroke-text ${hoverRedraw ? 'stroke-text--hover' : ''} ${className}`.trim()}
      style={{
        ...style,
        display: 'block',
        width: '100%',
        lineHeight: 0
      }}
    >
      <svg
        ref={strokeTextRef}
        className="stroke-text__svg"
        viewBox={box ? `${box.x} ${box.y} ${box.width} ${box.height}` : '0 0 100 100'}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          {fillMode === 'wipe' && wipeStart && (
            <clipPath id={wipeId}>
              <rect
                ref={wipeRectRef}
                x={wipeStart.x}
                y={wipeStart.y}
                width={wipeStart.width}
                height={wipeStart.height}
              />
            </clipPath>
          )}

          {castShadow && (
            <filter id={shadowId} x="-20%" y="-20%" width="160%" height="160%">
              <feDropShadow
                ref={shadowRef}
                dx="0"
                dy="0"
                stdDeviation={softness}
                floodColor={shadowColor || '#8AD82A'}
                floodOpacity="0"
              />
            </filter>
          )}
        </defs>

        {!dashArray && outlineLayer}

        <g filter={castShadow ? `url(#${shadowId})` : undefined}>
          <text
            className="stroke-text__fill"
            x="0"
            y="0"
            fill={fillColor}
            stroke="none"
            style={fontStyle}
            clipPath={fillMode === 'wipe' && wipeStart ? `url(#${wipeId})` : undefined}
          >
            {characters.map((char, index) => (
              <tspan data-fill-char key={`f-${index}`}>
                {char}
              </tspan>
            ))}
          </text>
        </g>

        {dashArray && outlineLayer}
      </svg>
    </span>
  );
};

export default SplitText;
