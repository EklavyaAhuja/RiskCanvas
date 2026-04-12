"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { Color } from "three"

export default function Globe() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current

    // Set height if not set by parent to ensure visibility
    if (container.clientHeight === 0) {
      container.style.height = "500px"
    }

    // Create scene, camera, and renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Create a starfield
    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 3000
    const positions = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1500
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1500
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1500
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.8,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8
    })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    // Create atmosphere
    const atmosphereVertexShader = `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
    const atmosphereFragmentShader = `
     uniform vec3 glowColor;
     varying vec3 vNormal;
     void main() {
       float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
       gl_FragColor = vec4(glowColor, 1.0) * intensity;
     }
    `
    const atmosphereGeometry = new THREE.SphereGeometry(5.4, 64, 64)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      uniforms: {
        glowColor: { value: new Color(0x3a86ff) },
      },
    })
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    scene.add(atmosphereMesh)

    // Create wireframe globe
    const wireframeGeometry = new THREE.SphereGeometry(5, 48, 48)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x3a86ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    })
    const wireframeGlobe = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
    scene.add(wireframeGlobe)

    // Create solid inner globe
    const innerGeometry = new THREE.SphereGeometry(4.9, 64, 64)
    const innerMaterial = new THREE.MeshPhongMaterial({
      color: 0x050a14,
      transparent: true,
      opacity: 0.9,
      shininess: 50,
    })
    const innerGlobe = new THREE.Mesh(innerGeometry, innerMaterial)
    scene.add(innerGlobe)

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)
    const pointLight = new THREE.PointLight(0xffffff, 2)
    pointLight.position.set(20, 20, 20)
    scene.add(pointLight)

    camera.position.z = 13

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.2

    const colors = [
      new Color(0x3a86ff), // Blue
      new Color(0x8338ec), // Purple
      new Color(0xff006e), // Pink
    ]
    let colorIndex = 0
    let nextColorIndex = 1
    let colorT = 0
    const colorTransitionSpeed = 0.003

    const lerpColor = (a: Color, b: Color, t: number) => {
      const color = new Color()
      color.r = a.r + (b.r - a.r) * t
      color.g = a.g + (b.g - a.g) * t
      color.b = a.b + (b.b - a.b) * t
      return color
    }

    let animationId: number

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // Dynamic color cycle
      colorT += colorTransitionSpeed
      if (colorT >= 1) {
        colorT = 0
        colorIndex = nextColorIndex
        nextColorIndex = (nextColorIndex + 1) % colors.length
      }

      const currentColor = lerpColor(colors[colorIndex], colors[nextColorIndex], colorT)

      // Apply dynamic colors
      wireframeMaterial.color = currentColor
      if (atmosphereMesh.material instanceof THREE.ShaderMaterial) {
        atmosphereMesh.material.uniforms.glowColor.value = currentColor
      }

      // Manual rotations
      wireframeGlobe.rotation.y += 0.001
      innerGlobe.rotation.y -= 0.0005
      stars.rotation.y += 0.00005
      
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle container resizing
    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener("resize", handleResize)
    const resizer = new ResizeObserver(handleResize)
    resizer.observe(container)

    const hintTimer = setTimeout(() => setShowHint(false), 4000)

    return () => {
      window.removeEventListener("resize", handleResize)
      resizer.disconnect()
      cancelAnimationFrame(animationId)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      controls.dispose()
      clearTimeout(hintTimer)
      
      // Memory cleanup
      starsGeometry.dispose()
      starsMaterial.dispose()
      atmosphereGeometry.dispose()
      atmosphereMaterial.dispose()
      wireframeGeometry.dispose()
      wireframeMaterial.dispose()
      innerGeometry.dispose()
      innerMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={mountRef} className="w-full h-full relative cursor-grab active:cursor-grabbing bg-black rounded-[2rem] overflow-hidden">
      {showHint && (
        <div className="absolute top-6 left-6 z-10">
          <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Interactive Core</span>
          </div>
        </div>
      )}
    </div>
  )
}
