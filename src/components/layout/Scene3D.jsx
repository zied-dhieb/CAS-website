import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import logo from '../../assets/logos/cas-logo.png'

// Full-page 3D background.
//  - A PCB stretches into the distance. Chips sit on it and are wired pin-to-pin with 45-degree
//    traces (see circuitLayout.js). Nothing ends in the air: every trace starts and ends on a pad.
//  - Data packets travel along the traces.
//  - The hero chip floats beside the headline: dark mould body, brushed heat spreader, glowing ring,
//    glass-domed CAS logo, gull-wing pins with a light that runs along them.
//  - The camera flies along the board on scroll and leans with the pointer.
// If anything fails (no WebGL, error), the component quietly leaves the CSS background in place.

// ===================== PCB layout planner =====================
// Pure layout planner for the 3D circuit background (no three.js here, so it is easy to test).
//
// 1. Places chips on the board without overlapping.
// 2. Routes bundles of 1 or 3 parallel traces from a pin of one chip to a pin of another,
//    in strict PCB style: straight run, one 45-degree jog, straight run.
// 3. Rejects any route that would cross another trace or run through another chip.
// 4. Drops chips that ended up with no connection, so nothing is left hanging.
//
// Every trace starts and ends on a pad that sits at the foot of a real pin.

const PITCH = 0.45 // distance between pins, shared by all chips so parallel lanes line up
const PAD_DIST = 0.63 // from the chip body edge to the pad centre (the pin foot)
const NORMALS = [[1, 0], [-1, 0], [0, 1], [0, -1]] // side 0:+x 1:-x 2:+z 3:-z
const TANGENTS = [[0, 1], [0, 1], [1, 0], [1, 0]]

// Pin count per side is always odd (3, 5 or 7) so the centre pin exists and lanes line up.
const chipWidth = (n) => (n - 1) * PITCH + 1.4

function distPointSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax
  const dz = bz - az
  const l2 = dx * dx + dz * dz
  let t = l2 ? ((px - ax) * dx + (pz - az) * dz) / l2 : 0
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
}

/**
 * @param {() => number} r      seeded random function returning [0, 1)
 * @param {{count:number, area:{x:number,z0:number,z1:number}, keepOut?:{x:number,z:number,r:number}}} opts
 * @returns {{chips: Array, lanes: Array<Array<[number, number]>>, bundles: number}}
 */
function planLayout(r, { count, area, keepOut }) {
  const chips = []
  const sizes = [3, 3, 5, 5, 5, 7]

  // ---- 1. place chips ----
  for (let tries = 0; tries < 1200 && chips.length < count; tries++) {
    const n = sizes[Math.floor(r() * sizes.length)]
    const w = chipWidth(n)
    const x = (r() - 0.5) * area.x * 2
    const z = area.z0 - r() * (area.z0 - area.z1)
    if (keepOut && Math.hypot(x - keepOut.x, z - keepOut.z) < keepOut.r) continue
    const clear = chips.every(
      (c) => Math.max(Math.abs(c.x - x), Math.abs(c.z - z)) - (c.w + w) / 2 >= 4.5
    )
    if (clear) chips.push({ x, z, n, w, sides: [0, 0, 0, 0], links: 0 })
  }

  // ---- 2. route ----
  const accepted = [] // every accepted lane segment: [ax, az, bx, bz]
  const lanes = []
  let bundles = 0

  const makeBundle = (A, B, k, f) => {
    const dx = B.x - A.x
    const dz = B.z - A.z
    let sa
    let sb
    if (Math.abs(dz) >= Math.abs(dx)) {
      sa = dz > 0 ? 2 : 3
      sb = dz > 0 ? 3 : 2
    } else {
      sa = dx > 0 ? 0 : 1
      sb = dx > 0 ? 1 : 0
    }
    if (A.sides[sa] || B.sides[sb]) return null

    const [nx, nz] = NORMALS[sa]
    const [tx, tz] = TANGENTS[sa]
    const gap = dx * nx + dz * nz - (A.w + B.w) / 2 - 2 * PAD_DIST // run length between pads
    const sec = dx * tx + dz * tz // sideways offset between pads
    const rem = gap - Math.abs(sec)
    if (rem < 1.2) return null // not enough room for stubs plus the 45-degree jog
    if (Math.abs(sec) > 0.01 && Math.abs(sec) < 1.2) return null // avoid tiny ugly jogs

    const stub = 0.5 + f * (rem - 1.0)
    const out = []
    for (let j = 0; j < k; j++) {
      const o = (j - (k - 1) / 2) * PITCH
      const sx = A.x + nx * (A.w / 2 + PAD_DIST) + tx * o
      const sz = A.z + nz * (A.w / 2 + PAD_DIST) + tz * o
      const at = (p, s) => [sx + nx * p + tx * s, sz + nz * p + tz * s]
      const pts = [[sx, sz]]
      if (Math.abs(sec) > 0.01) {
        pts.push(at(stub, 0), at(stub + Math.abs(sec), sec))
      }
      pts.push(at(gap, sec))
      out.push(pts)
    }
    return { sa, sb, lanes: out }
  }

  const isClear = (A, B, bundleLanes) => {
    for (const pl of bundleLanes) {
      for (let i = 0; i < pl.length - 1; i++) {
        const [ax, az] = pl[i]
        const [bx, bz] = pl[i + 1]
        const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.35))
        for (let s = 0; s <= steps; s++) {
          const px = ax + ((bx - ax) * s) / steps
          const pz = az + ((bz - az) * s) / steps
          for (const c of chips) {
            if (c === A || c === B) continue
            if (Math.abs(px - c.x) < c.w / 2 + 0.9 && Math.abs(pz - c.z) < c.w / 2 + 0.9) return false
          }
          for (const sg of accepted) {
            if (distPointSegment(px, pz, sg[0], sg[1], sg[2], sg[3]) < 0.55) return false
          }
        }
      }
    }
    return true
  }

  const order = chips.map((_, i) => i).sort(() => r() - 0.5)
  for (const i of order) {
    const A = chips[i]
    if (A.links >= 3) continue
    const near = chips
      .filter((c) => c !== A)
      .sort((a, b) => Math.hypot(a.x - A.x, a.z - A.z) - Math.hypot(b.x - A.x, b.z - A.z))
      .slice(0, 4)
    for (const B of near) {
      if (A.links >= 3) break
      if (B.links >= 3) continue
      const f = 0.15 + r() * 0.7
      for (const k of r() < 0.55 ? [3, 1] : [1]) {
        const res = makeBundle(A, B, k, f)
        if (!res) break
        if (!isClear(A, B, res.lanes)) continue
        A.sides[res.sa] = 1
        B.sides[res.sb] = 1
        A.links++
        B.links++
        bundles++
        for (const pl of res.lanes) {
          lanes.push(pl)
          for (let s = 0; s < pl.length - 1; s++) accepted.push([...pl[s], ...pl[s + 1]])
        }
        break
      }
    }
  }

  // ---- 3. drop chips that connect to nothing ----
  return { chips: chips.filter((c) => c.links > 0), lanes, bundles }
}

// ===================== Scene =====================
const PAL = {
  dark: { fog: 0x071009, board: 0x0b2214, grid: 0x2e8b2e, trace: 0x6baa1c, chip: 0x0d2a15, die: 0x9bd83a },
  light: { fog: 0xdcecd5, board: 0xcfe6c8, grid: 0x2e8b2e, trace: 0x1b5e20, chip: 0x1c4a25, die: 0x2e8b2e },
}
const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647

// ---------- pin (gull-wing lead), built once, shared by every chip ----------
const PIN = { w: 0.2, t: 0.05, shoulderLen: 0.2, slopeLen: 0.22, footLen: 0.34, shoulderY: 0.17, footY: 0.04 }
function makePinGeometry() {
  const { w, t, shoulderLen: a, slopeLen: b, footLen: c, shoulderY, footY } = PIN
  const dy = shoulderY - footY
  const shoulder = new THREE.BoxGeometry(a, t, w).translate(a / 2, shoulderY, 0)
  const slope = new THREE.BoxGeometry(Math.hypot(b, dy), t, w)
    .rotateZ(-Math.atan2(dy, b))
    .translate(a + b / 2, (shoulderY + footY) / 2, 0)
  const foot = new THREE.BoxGeometry(c, t, w).translate(a + b + c / 2, footY, 0)
  const merged = mergeGeometries([shoulder, slope, foot])
  shoulder.dispose(); slope.dispose(); foot.dispose()
  return merged
}
const SIDE_ROT = [0, Math.PI, -Math.PI / 2, Math.PI / 2]

// ---------- small procedural textures ----------
function makeDieTexture(r) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  g.fillStyle = '#262626'
  g.fillRect(0, 0, 256, 256)
  g.strokeStyle = 'rgba(255,255,255,.22)'
  g.lineWidth = 1
  for (let i = 0; i <= 256; i += 16) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke()
    g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke()
  }
  for (let i = 0; i < 24; i++) {
    const w = 20 + r() * 64
    const h = 20 + r() * 64
    const x = 14 + r() * (228 - w)
    const y = 14 + r() * (228 - h)
    g.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.3})`
    g.fillRect(x, y, w, h)
    g.strokeStyle = 'rgba(255,255,255,.75)'
    g.strokeRect(x, y, w, h)
  }
  g.strokeStyle = '#fff'
  g.lineWidth = 4
  g.strokeRect(4, 4, 248, 248)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function makeHaloTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.35, 'rgba(255,255,255,.35)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

// ---------- the scene ----------
function setup(el, isHomeRef) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
  } catch {
    return null // no WebGL: the CSS background stays
  }

  const cleanups = []
  const run = () => {
    while (cleanups.length) {
      try { cleanups.pop()() } catch { /* ignore */ }
    }
  }
  const own = (o) => { cleanups.push(() => o.dispose && o.dispose()); return o }

  try {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.innerWidth < 768
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    el.appendChild(renderer.domElement)
    cleanups.push(() => {
      renderer.dispose()
      renderer.domElement.parentElement?.removeChild(renderer.domElement)
    })

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.028)
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 220)

    // Soft reflections for the metal and glass parts (generated in code, no file needed).
    const pmrem = new THREE.PMREMGenerator(renderer)
    const roomEnv = new RoomEnvironment(renderer)
    const envRT = pmrem.fromScene(roomEnv, 0.04)
    scene.environment = envRT.texture
    roomEnv.dispose?.()
    pmrem.dispose()
    cleanups.push(() => envRT.dispose())

    scene.add(new THREE.AmbientLight(0xffffff, 0.9))
    const sun = new THREE.DirectionalLight(0xffffff, 2)
    sun.position.set(-6, 12, 8)
    scene.add(sun)
    const glow = new THREE.PointLight(0x6baa1c, 90, 38, 2)
    scene.add(glow)

    // ----- board + grid -----
    const boardMat = own(new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.15, transparent: true, opacity: 0.55, envMapIntensity: 0.15 }))
    const board = new THREE.Mesh(own(new THREE.PlaneGeometry(200, 220)), boardMat)
    board.rotation.x = -Math.PI / 2
    board.position.z = -60
    scene.add(board)
    const grid = new THREE.GridHelper(200, 100, 0xffffff, 0xffffff)
    grid.position.set(0, 0.02, -50)
    grid.material.transparent = true
    grid.material.opacity = 0.3
    own(grid.geometry); own(grid.material)
    scene.add(grid)

    // ----- shared materials -----
    const traceMat = own(new THREE.MeshStandardMaterial({ metalness: 0.7, roughness: 0.3, emissiveIntensity: 0.9, envMapIntensity: 0.4 }))
    const glowMat = own(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }))
    const holeMat = own(new THREE.MeshBasicMaterial({ color: 0x06120a }))
    const packetMat = own(new THREE.MeshBasicMaterial({ toneMapped: false }))
    const haloMat = own(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }))
    const chipMat = own(new THREE.MeshPhysicalMaterial({ roughness: 0.4, metalness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.35, envMapIntensity: 0.6 }))
    const pinMat = own(new THREE.MeshStandardMaterial({ color: 0xdfeedd, metalness: 0.9, roughness: 0.3, envMapIntensity: 0.9 }))
    const dieTex = own(makeDieTexture(rng(11)))
    const dieMat = own(new THREE.MeshStandardMaterial({ map: dieTex, emissiveMap: dieTex, roughness: 0.35, metalness: 0.2, emissiveIntensity: 0.8 }))

    // ----- background layout: chips + traces -----
    const r = rng(7)
    const layout = planLayout(r, {
      count: mobile ? 12 : 26,
      area: { x: 34, z0: 14, z1: -98 },
      keepOut: { x: 4.5, z: 0, r: 8 }, // leave room for the hero chip
    })
    const dummy = new THREE.Object3D()
    const instanced = (geo, mat, count) => {
      const m = new THREE.InstancedMesh(geo, mat, Math.max(1, count))
      m.frustumCulled = false
      scene.add(m)
      cleanups.push(() => { scene.remove(m); m.dispose() })
      return m
    }

    // chip bodies + dies (3 geometries cached by pin count)
    const BODY_H = 0.36
    const bodyGeos = new Map()
    const dieGeos = new Map()
    for (const c of layout.chips) {
      if (!bodyGeos.has(c.n)) {
        bodyGeos.set(c.n, own(new RoundedBoxGeometry(c.w, BODY_H, c.w, 3, 0.12)))
        dieGeos.set(c.n, own(new THREE.BoxGeometry(c.w * 0.5, 0.03, c.w * 0.5)))
      }
      const body = new THREE.Mesh(bodyGeos.get(c.n), chipMat)
      body.position.set(c.x, BODY_H / 2 + 0.02, c.z)
      const die = new THREE.Mesh(dieGeos.get(c.n), dieMat)
      die.position.set(c.x, BODY_H + 0.035, c.z)
      scene.add(body, die)
    }

    // all background pins in one draw call
    const pinGeo = own(makePinGeometry())
    const totalPins = layout.chips.reduce((s, c) => s + 4 * c.n, 0)
    const pins = instanced(pinGeo, pinMat, totalPins)
    let pi = 0
    for (const c of layout.chips) {
      for (let s = 0; s < 4; s++) {
        for (let i = 0; i < c.n; i++) {
          const lat = (i - (c.n - 1) / 2) * PITCH
          dummy.position.set(
            c.x + NORMALS[s][0] * (c.w / 2 - 0.05) + TANGENTS[s][0] * lat,
            0,
            c.z + NORMALS[s][1] * (c.w / 2 - 0.05) + TANGENTS[s][1] * lat
          )
          dummy.rotation.set(0, SIDE_ROT[s], 0)
          dummy.scale.set(1, 1, 1)
          dummy.updateMatrix()
          pins.setMatrixAt(pi++, dummy.matrix)
        }
      }
    }

    // traces: thin raised strips, one per segment, plus joints so corners are solid
    const TY = 0.055
    const segs = []
    const joints = []
    const vias = []
    layout.lanes.forEach((pl) => {
      for (let i = 0; i < pl.length - 1; i++) segs.push([pl[i], pl[i + 1]])
      pl.forEach((p, i) => {
        joints.push(p)
        if (i === 0 || i === pl.length - 1) vias.push({ p, s: 1 })
        else if (r() < 0.5) vias.push({ p, s: 0.8 })
      })
    })
    const stripGeo = own(new THREE.BoxGeometry(1, 0.05, 0.16))
    const stripGlowGeo = own(new THREE.BoxGeometry(1, 0.01, 0.6))
    const jointGeo = own(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 10))
    const jointGlowGeo = own(new THREE.CylinderGeometry(0.3, 0.3, 0.01, 14))
    const strips = instanced(stripGeo, traceMat, segs.length)
    const stripGlow = instanced(stripGlowGeo, glowMat, segs.length)
    const jointMesh = instanced(jointGeo, traceMat, joints.length)
    const jointGlow = instanced(jointGlowGeo, glowMat, joints.length)
    segs.forEach(([a, b], i) => {
      const dx = b[0] - a[0]
      const dz = b[1] - a[1]
      const len = Math.hypot(dx, dz)
      dummy.position.set((a[0] + b[0]) / 2, TY, (a[1] + b[1]) / 2)
      dummy.rotation.set(0, Math.atan2(-dz, dx), 0)
      dummy.scale.set(len, 1, 1)
      dummy.updateMatrix()
      strips.setMatrixAt(i, dummy.matrix)
      dummy.position.y = 0.03
      dummy.updateMatrix()
      stripGlow.setMatrixAt(i, dummy.matrix)
    })
    joints.forEach((p, i) => {
      dummy.position.set(p[0], TY, p[1])
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      jointMesh.setMatrixAt(i, dummy.matrix)
      dummy.position.y = 0.03
      dummy.updateMatrix()
      jointGlow.setMatrixAt(i, dummy.matrix)
    })

    // via rings: the solder pad at each trace end, and some at the bends
    const viaGeo = own(new THREE.TorusGeometry(0.13, 0.04, 6, 18).rotateX(Math.PI / 2))
    const holeGeo = own(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 12))
    const viaRings = instanced(viaGeo, traceMat, vias.length)
    const viaHoles = instanced(holeGeo, holeMat, vias.length)
    vias.forEach((v, i) => {
      dummy.position.set(v.p[0], 0.065, v.p[1])
      dummy.rotation.set(0, 0, 0)
      dummy.scale.setScalar(v.s)
      dummy.updateMatrix()
      viaRings.setMatrixAt(i, dummy.matrix)
      dummy.position.y = 0.045
      dummy.updateMatrix()
      viaHoles.setMatrixAt(i, dummy.matrix)
    })

    // data packets: one per lane (two on long lanes), running along the traces
    const packets = []
    layout.lanes.forEach((pl) => {
      const pts = pl.map((p) => new THREE.Vector3(p[0], 0.13, p[1]))
      const cum = [0]
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]))
      const total = cum[cum.length - 1]
      const n = total > 14 ? 2 : 1
      for (let k = 0; k < n; k++) {
        packets.push({ pts, cum, total, t: (r() + k / n) % 1, v: 2.5 + r() * 4, dir: r() < 0.5 ? 1 : -1 })
      }
    })
    const packetCore = instanced(own(new THREE.SphereGeometry(0.13, 10, 10)), packetMat, packets.length)
    const packetHalo = instanced(own(new THREE.SphereGeometry(0.34, 10, 10)), haloMat, packets.length)
    const tmp = new THREE.Vector3()
    const pointAt = (pk, d) => {
      let i = 1
      while (i < pk.cum.length - 1 && pk.cum[i] < d) i++
      const seg = pk.cum[i] - pk.cum[i - 1] || 1
      return tmp.lerpVectors(pk.pts[i - 1], pk.pts[i], (d - pk.cum[i - 1]) / seg)
    }
    const placePackets = (dt) => {
      packets.forEach((pk, i) => {
        pk.t = (pk.t + (dt * pk.v) / pk.total) % 1
        const p = pointAt(pk, (pk.dir > 0 ? pk.t : 1 - pk.t) * pk.total)
        dummy.position.copy(p)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        packetCore.setMatrixAt(i, dummy.matrix)
        packetHalo.setMatrixAt(i, dummy.matrix)
      })
      packetCore.instanceMatrix.needsUpdate = true
      packetHalo.instanceMatrix.needsUpdate = true
    }

    // ----- hero chip -----
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())
    const logoCanvas = document.createElement('canvas')
    logoCanvas.width = logoCanvas.height = 512
    const lg = logoCanvas.getContext('2d')
    lg.fillStyle = '#fff'
    lg.beginPath(); lg.arc(256, 256, 256, 0, Math.PI * 2); lg.fill()
    const logoTex = own(new THREE.CanvasTexture(logoCanvas))
    logoTex.colorSpace = THREE.SRGBColorSpace
    logoTex.anisotropy = maxAniso

    let disposed = false
    cleanups.push(() => { disposed = true })
    const img = new Image()
    img.onload = () => {
      if (disposed) return
      // Cut the white circle out of the square logo so the green corners never show.
      const w = img.naturalWidth
      const h = img.naturalHeight
      const rad = Math.min(w * 0.44, h * 0.5)
      lg.clearRect(0, 0, 512, 512)
      lg.save()
      lg.beginPath(); lg.arc(256, 256, 256, 0, Math.PI * 2); lg.clip()
      lg.drawImage(img, w / 2 - rad, h / 2 - rad, rad * 2, rad * 2, 0, 0, 512, 512)
      lg.restore()
      logoTex.needsUpdate = true
      if (reduce) frame()
    }
    img.src = logo

    const hero = new THREE.Group()
    const heroGlowMats = []
    const glowStd = (extra = {}) => {
      const m = own(new THREE.MeshStandardMaterial({ color: 0x0a1a0e, roughness: 0.4, metalness: 0.3, ...extra }))
      heroGlowMats.push(m)
      return m
    }

    const heroBodyMat = own(new THREE.MeshPhysicalMaterial({ color: 0x0b140d, roughness: 0.32, metalness: 0.35, clearcoat: 0.9, clearcoatRoughness: 0.25, envMapIntensity: 0.7 }))
    const spreaderMat = own(new THREE.MeshStandardMaterial({ color: 0xc4d1c0, roughness: 0.32, metalness: 0.95, envMapIntensity: 1.1 }))
    const wellMat = own(new THREE.MeshStandardMaterial({ color: 0x040a06, roughness: 0.6, metalness: 0.2, envMapIntensity: 0.3 }))
    const ringMat = glowStd({ emissiveIntensity: 1.5 })
    const ringThinMat = glowStd({ emissiveIntensity: 0.9 })
    const spokeMat = glowStd({ emissiveIntensity: 1.2 })
    const dotMat = glowStd({ emissiveIntensity: 1.6 })
    const discMat = own(new THREE.MeshPhysicalMaterial({ map: logoTex, emissiveMap: logoTex, emissive: 0xffffff, emissiveIntensity: 0.28, roughness: 0.25, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1 }))
    const domeMat = own(new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.6, depthWrite: false }))

    const HW = 5.2
    const add = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(own(geo), mat)
      m.position.set(x, y, z)
      hero.add(m)
      return m
    }
    add(new RoundedBoxGeometry(HW, 0.5, HW, 5, 0.2), heroBodyMat, 0, 0, 0)
    add(new RoundedBoxGeometry(4.2, 0.12, 4.2, 4, 0.08), spreaderMat, 0, 0.31, 0)
    add(new THREE.RingGeometry(1.5, 2.0, 64).rotateX(-Math.PI / 2), wellMat, 0, 0.376, 0)
    add(new THREE.TorusGeometry(1.58, 0.045, 8, 72).rotateX(Math.PI / 2), ringMat, 0, 0.39, 0)
    add(new THREE.TorusGeometry(2.0, 0.025, 8, 72).rotateX(Math.PI / 2), ringThinMat, 0, 0.385, 0)
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4
      const spoke = add(new THREE.BoxGeometry(0.38, 0.02, 0.05), spokeMat, Math.cos(a) * 1.79, 0.384, Math.sin(a) * 1.79)
      spoke.rotation.y = -a
    }
    add(new THREE.CircleGeometry(1.5, 72).rotateX(-Math.PI / 2), discMat, 0, 0.388, 0)
    const dome = add(new THREE.SphereGeometry(1.5, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeMat, 0, 0.388, 0)
    dome.scale.y = 0.1
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      add(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 14), dotMat, sx * 1.85, 0.38, sz * 1.85)
    }
    add(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 16), dotMat, -2.3, 0.255, -2.3) // pin-1 marker

    // hero pins: individual meshes so each can light up in sequence
    const heroPinMats = []
    const HP = 0.55
    const HPS = 1.25
    for (let s = 0; s < 4; s++) {
      for (let i = 0; i < 8; i++) {
        const lat = (i - 3.5) * HP
        const mat = own(pinMat.clone())
        mat.emissive = new THREE.Color(0x9bd83a)
        heroPinMats.push(mat)
        const pin = new THREE.Mesh(pinGeo, mat)
        pin.scale.setScalar(HPS)
        pin.position.set(
          NORMALS[s][0] * (HW / 2 - 0.06) + TANGENTS[s][0] * lat,
          -0.25,
          NORMALS[s][1] * (HW / 2 - 0.06) + TANGENTS[s][1] * lat
        )
        pin.rotation.y = SIDE_ROT[s]
        hero.add(pin)
      }
    }

    // soft halo behind the chip (cheap bloom)
    const haloTex = own(makeHaloTexture())
    const heroHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0.5 }))
    own(heroHalo.material)
    heroHalo.scale.setScalar(11)
    heroHalo.position.y = -0.5
    hero.add(heroHalo)
    scene.add(hero)

    // ----- theme -----
    const apply = () => {
      const dark = document.documentElement.classList.contains('dark')
      const p = PAL[dark ? 'dark' : 'light']
      scene.fog.color.setHex(p.fog)
      boardMat.color.setHex(p.board)
      grid.material.color.setHex(p.grid)
      traceMat.color.setHex(p.trace); traceMat.emissive.setHex(p.trace)
      glowMat.color.setHex(p.trace); glowMat.opacity = dark ? 0.12 : 0.1
      chipMat.color.setHex(p.chip)
      dieMat.color.setHex(p.die); dieMat.emissive.setHex(p.die)
      packetMat.color.setHex(p.die); haloMat.color.setHex(p.die)
      heroGlowMats.forEach((m) => m.emissive.setHex(p.die))
      heroPinMats.forEach((m) => m.emissive.setHex(p.die))
      heroHalo.material.color.setHex(p.die)
      heroHalo.material.opacity = dark ? 0.5 : 0.22
    }

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      const wide = camera.aspect > 1.2
      hero.position.set(wide ? 4.5 : 1.2, 2, 0)
    }

    let mx = 0, my = 0, cx = 0, cy = 0, sm = 0, last = performance.now() / 1000, raf = 0
    const onMove = (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5 }

    function frame() {
      const now = performance.now() / 1000
      const dt = reduce ? 0 : Math.min(0.05, now - last)
      last = now
      const h = document.documentElement
      sm += (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) - sm) * (reduce ? 1 : 0.06)
      cx += (mx - cx) * 0.05
      cy += (my - cy) * 0.05
      camera.position.set(cx * 3, 6.5 - sm * 1.5 - cy * 1.2, 14 - sm * 85)
      camera.lookAt(cx * 1.5, 0.5, camera.position.z - 16)
      glow.position.set(camera.position.x, 3, camera.position.z - 8)

      placePackets(dt)
      dieMat.emissiveIntensity = 0.75 + Math.sin(now * 2.5) * 0.25

      const wide = camera.aspect > 1.2
      const heroScale = isHomeRef.current ? Math.max(0, 1 - sm * 6) * (wide ? 1 : 0.65) : 0
      hero.visible = heroScale > 0.02
      if (hero.visible) {
        hero.scale.setScalar(heroScale)
        hero.rotation.set(0.5 + cy * 0.3, cx * 0.9 + Math.sin(now * 0.4) * 0.25, 0)
        hero.position.y = 2 + Math.sin(now * 0.9) * 0.15
        ringMat.emissiveIntensity = 1.4 + Math.sin(now * 2.2) * 0.4
        heroPinMats.forEach((m, i) => {
          m.emissiveIntensity = 0.08 + 1.4 * Math.pow(Math.max(0, Math.sin(now * 3.2 - i * 0.35)), 4)
        })
      }

      renderer.render(scene, camera)
      if (!reduce) raf = requestAnimationFrame(frame)
    }
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduce) raf = requestAnimationFrame(frame)
    }

    apply(); resize(); frame()
    const mo = new MutationObserver(() => { apply(); if (reduce) frame() })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)
    document.addEventListener('visibilitychange', onVis)
    if (reduce) window.addEventListener('scroll', frame, { passive: true })
    cleanups.push(() => {
      cancelAnimationFrame(raf)
      mo.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', frame)
      document.removeEventListener('visibilitychange', onVis)
    })
    return run
  } catch (err) {
    console.error('Scene3D failed, using the CSS background instead:', err)
    run()
    return null
  }
}

export default function Scene3D() {
  const mount = useRef(null)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isHomeRef = useRef(isHome)
  isHomeRef.current = isHome

  useEffect(() => {
    if (!mount.current) return undefined
    const cleanup = setup(mount.current, isHomeRef)
    return () => { if (cleanup) cleanup() }
  }, [])

  return <div ref={mount} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" />
}
