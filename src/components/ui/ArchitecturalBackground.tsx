"use client"

import { MeshGradient, DotOrbit } from "@paper-design/shaders-react"

export default function ArchitecturalBackground() {
  // We use the exact mesh effect from the user's snippet.
  // We ensure it acts as an absolute layer beneath the cards without pushing them out of the way.
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <MeshGradient
        className="w-full h-full absolute inset-0"
        colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
        speed={1.0}
      />
      
      {/* Lighting overlay effects from the snippet */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-32 h-32 bg-gray-800/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: `3s` }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDuration: `2s`, animationDelay: "1s" }}
        />
      </div>
    </div>
  )
}
