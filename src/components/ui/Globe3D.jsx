import { useEffect, useState } from 'react';

function projectMarker(lat, lng, rotation) {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = ((lng + rotation) * Math.PI) / 180;

  const x = Math.cos(latRad) * Math.sin(lngRad);
  const y = Math.sin(latRad);
  const z = Math.cos(latRad) * Math.cos(lngRad);

  return {
    x,
    y,
    z,
    visible: z > -0.18,
  };
}

export function Globe3D({
  markers = [],
  config = {},
  onMarkerClick,
  onMarkerHover,
}) {
  const {
    atmosphereColor = '#4da6ff',
    atmosphereIntensity = 20,
    bumpScale = 5,
    autoRotateSpeed = 0.3,
  } = config;

  const [rotation, setRotation] = useState(0);
  const [hoveredMarker, setHoveredMarker] = useState(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRotation((current) => (current + autoRotateSpeed) % 360);
    }, 32);

    return () => window.clearInterval(interval);
  }, [autoRotateSpeed]);

  useEffect(() => {
    onMarkerHover?.(hoveredMarker);
  }, [hoveredMarker, onMarkerHover]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
      <div
        className="absolute inset-[7%] rounded-full"
        style={{
          background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.26), transparent 18%),
            radial-gradient(circle at 55% 45%, rgba(106,91,226,0.16), transparent 26%),
            radial-gradient(circle at 50% 55%, rgba(77,166,255,0.08), transparent 44%),
            linear-gradient(135deg, #0f1838 0%, #12214d 36%, #17346d 68%, #102245 100%)
          `,
          boxShadow: `0 0 ${atmosphereIntensity}px ${atmosphereColor}55, inset 0 0 ${18 + bumpScale * 2}px rgba(255,255,255,0.06)`,
        }}
      />

      <div
        className="absolute inset-[2%] rounded-full opacity-70 blur-2xl"
        style={{
          background: `radial-gradient(circle, ${atmosphereColor}66 0%, rgba(77,166,255,0.12) 40%, transparent 72%)`,
        }}
      />

      <div className="absolute inset-[7%] overflow-hidden rounded-full border border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.14),transparent_18%),linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_35%,rgba(0,0,0,0.24)_100%)]" />
        <div
          className="absolute inset-0 opacity-45"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100% 15%, 15% 100%',
            transform: `rotate(${rotation * 0.15}deg) scale(1.04)`,
          }}
        />
      </div>

      {markers.map((marker) => {
        const projected = projectMarker(marker.lat, marker.lng, rotation);
        const left = 50 + projected.x * 34;
        const top = 50 - projected.y * 34;
        const scale = 0.72 + Math.max(projected.z, 0) * 0.45;

        return (
          <button
            key={`${marker.label}-${marker.lat}-${marker.lng}`}
            type="button"
            onClick={() => onMarkerClick?.(marker)}
            onMouseEnter={() => setHoveredMarker(marker)}
            onMouseLeave={() => setHoveredMarker(null)}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              opacity: projected.visible ? 0.96 : 0,
              pointerEvents: projected.visible ? 'auto' : 'none',
              transform: `translate(-50%, -50%) scale(${scale})`,
              zIndex: Math.round((projected.z + 1) * 20),
            }}
            aria-label={marker.label}
          >
            <div className="relative">
              <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/30 blur-xl" />
              <img
                src={marker.src}
                alt={marker.label}
                className="h-10 w-10 rounded-full border-2 border-white/80 object-cover shadow-lg"
              />
              <span className="absolute left-1/2 top-full mt-2 h-3 w-px -translate-x-1/2 bg-white/40" />
            </div>
          </button>
        );
      })}

      <div className="absolute inset-x-[20%] bottom-[7%] h-[16%] rounded-full bg-cyan-400/12 blur-2xl" />

      {hoveredMarker && (
        <div className="absolute left-1/2 top-[8%] -translate-x-1/2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl">
          {hoveredMarker.label}
        </div>
      )}
    </div>
  );
}
