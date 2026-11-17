import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import * as THREE from 'three'
import logo from '../../assets/logos/cas-logo.png'

// Full-page 3D background. A circuit board stretches into the distance; the camera flies
// along it as you scroll and leans with the pointer. Fog fades the far end (depth), data
// packets run along raised traces, chips hover, and a CAS chip floats beside the hero.
const PAL = {
  dark: { fog: 0x071009, board: 0x0b2214, grid: 0x2e8b2e, trace: 0x6baa1c, chip: 0x0f3a1a, die: 0x9bd83a },
  light: { fog: 0xdcecd5, board: 0xcfe6c8, grid: 0x2e8b2e, trace: 0x1b5e20, chip: 0x2d6a31, die: 0x1b5e20 },
}
const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647

export default function Scene3D() {
  const mount = useRef(null)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isHomeRef = useRef(isHome)
  isHomeRef.current = isHome

  useEffect(() => {
    if (!mount.current) return
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch {
      return // no WebGL: the CSS background stays
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    mount.current.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.028)
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 220)
    scene.add(new THREE.AmbientLight(0xffffff, 1.3))
    const sun = new THREE.DirectionalLight(0xffffff, 2); sun.position.set(-6, 12, 8); scene.add(sun)
    const glow = new THREE.PointLight(0x6baa1c, 90, 38, 2); scene.add(glow)

    const boardGeo = new THREE.PlaneGeometry(200, 220)
    const boardMat = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.15, transparent: true, opacity: 0.55 })
    const board = new THREE.Mesh(boardGeo, boardMat)
    board.rotation.x = -Math.PI / 2; board.position.z = -60; scene.add(board)
    const grid = new THREE.GridHelper(200, 100, 0xffffff, 0xffffff); grid.position.set(0, 0.02, -50)
    grid.material.transparent = true; grid.material.opacity = 0.35; scene.add(grid)

    // Raised traces, data packets and hovering chips (seeded, so the layout never changes).
    const r = rng(7)
    const traceMat = new THREE.MeshStandardMaterial({ metalness: 0.8, roughness: 0.3, emissiveIntensity: 0.9 })
    const packetMat = new THREE.MeshBasicMaterial()
    const chipMat = new THREE.MeshStandardMaterial({ metalness: 0.5, roughness: 0.4 })
    const dieMat = new THREE.MeshStandardMaterial({ emissiveIntensity: 0.8 })
    const packetGeo = new THREE.SphereGeometry(0.17, 10, 10)
    const packets = [], parts = []
    const N = window.innerWidth < 768 ? 16 : 34
    for (let i = 0; i < N; i++) {
      let x = (r() - 0.5) * 70, z = 18 - r() * 115
      const pts = [new THREE.Vector3(x, 0.08, z)]
      for (let k = 0; k < 3; k++) {
        const len = 4 + r() * 10
        if (k % 2 === 0) x += (r() < 0.5 ? -1 : 1) * len; else z -= len
        pts.push(new THREE.Vector3(x, 0.08, z))
      }
      const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.07, 6, false), traceMat))
      const m = new THREE.Mesh(packetGeo, packetMat); scene.add(m)
      packets.push({ m, curve, t: r(), v: 0.03 + r() * 0.05 })
      const w = 1.2 + r() * 2.2, g = new THREE.Group()
      g.position.set(x, 0.2, z)
      g.add(new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, w), chipMat))
      const die = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, 0.06, w * 0.6), dieMat); die.position.y = 0.17; g.add(die)
      scene.add(g); parts.push({ g, phase: r() * 6.28 })
    }

    // Hero chip: the CAS logo on its top face, pins around the edge.
    const hero = new THREE.Group()
    const tex = new THREE.TextureLoader().load(logo); tex.colorSpace = THREE.SRGBColorSpace
    const topMat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.35 })
    hero.add(new THREE.Mesh(new THREE.BoxGeometry(5, 0.7, 5), [chipMat, chipMat, topMat, chipMat, chipMat, chipMat]))
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xdfeedd, metalness: 0.9, roughness: 0.3 })
    const pinA = new THREE.BoxGeometry(0.22, 0.1, 0.7), pinB = new THREE.BoxGeometry(0.7, 0.1, 0.22)
    for (let s = 0; s < 4; s++) for (let i = 0; i < 8; i++) {
      const o = -2.1 + i * 0.6, p = new THREE.Mesh(s < 2 ? pinA : pinB, pinMat)
      p.position.set(s < 2 ? o : (s === 2 ? 2.8 : -2.8), -0.1, s < 2 ? (s === 0 ? 2.8 : -2.8) : o)
      hero.add(p)
    }
    scene.add(hero)

    const apply = () => {
      const p = PAL[document.documentElement.classList.contains('dark') ? 'dark' : 'light']
      scene.fog.color.setHex(p.fog); board.material.color.setHex(p.board); grid.material.color.setHex(p.grid)
      traceMat.color.setHex(p.trace); traceMat.emissive.setHex(p.trace); chipMat.color.setHex(p.chip)
      dieMat.color.setHex(p.die); dieMat.emissive.setHex(p.die); packetMat.color.setHex(p.die)
    }
    const resize = () => {
      if (!renderer || !mount.current) return
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix()
      const wide = camera.aspect > 1.2
      hero.position.set(wide ? 4.5 : 1.2, 2, 0)
    }
    let mx = 0, my = 0, cx = 0, cy = 0, sm = 0, last = performance.now() / 1000, raf
    const onMove = (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5 }
    const frame = () => {
      const now = performance.now() / 1000, dt = reduce ? 0 : Math.min(0.05, now - last); last = now
      const h = document.documentElement
      sm += (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) - sm) * (reduce ? 1 : 0.06)
      cx += (mx - cx) * 0.05; cy += (my - cy) * 0.05
      camera.position.set(cx * 3, 6.5 - sm * 1.5 - cy * 1.2, 14 - sm * 85)
      camera.lookAt(cx * 1.5, 0.5, camera.position.z - 16)
      glow.position.set(camera.position.x, 3, camera.position.z - 8)
      packets.forEach((p) => { p.t = (p.t + dt * p.v) % 1; p.m.position.copy(p.curve.getPointAt(p.t)) })
      parts.forEach((p) => { p.g.position.y = 0.2 + Math.sin(now * 1.2 + p.phase) * 0.09 })
      dieMat.emissiveIntensity = 0.75 + Math.sin(now * 2.5) * 0.25

      const onHome = isHomeRef.current
      const wide = camera.aspect > 1.2
      const heroScale = onHome ? Math.max(0, 1 - sm * 6) * (wide ? 1 : 0.65) : 0
      hero.visible = heroScale > 0.02
      if (hero.visible) {
        hero.scale.setScalar(heroScale)
        hero.rotation.set(0.5 + cy * 0.3, cx * 0.9 + Math.sin(now * 0.4) * 0.25, 0)
        hero.position.y = 2 + Math.sin(now * 0.9) * 0.15
      }

      renderer.render(scene, camera)
      if (!reduce) raf = requestAnimationFrame(frame)
    }
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden && !reduce) raf = requestAnimationFrame(frame) }

    apply(); resize(); frame()
    const mo = new MutationObserver(() => { apply(); if (reduce) frame() })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    window.addEventListener('resize', resize); window.addEventListener('pointermove', onMove)
    document.addEventListener('visibilitychange', onVis)
    if (reduce) window.addEventListener('scroll', frame, { passive: true })
    return () => {
      cancelAnimationFrame(raf); mo.disconnect()
      window.removeEventListener('resize', resize); window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', frame); document.removeEventListener('visibilitychange', onVis)
      boardGeo.dispose(); boardMat.dispose()
      grid.geometry.dispose(); grid.material.dispose()
      traceMat.dispose(); packetMat.dispose(); chipMat.dispose(); dieMat.dispose(); topMat.dispose(); pinMat.dispose()
      packetGeo.dispose(); pinA.dispose(); pinB.dispose()
      tex.dispose()
      renderer.dispose()
      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mount} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" />
}
