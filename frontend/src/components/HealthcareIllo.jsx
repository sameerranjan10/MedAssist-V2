/**
 * components/HealthcareIllo.jsx
 * Interactive pseudo-3D healthcare illustration using Zdog.
 * Doctor & Nurse styled in Robin Davey's "Nippu" mechanical vector style.
 * Includes looping crank-rotations, bobbing, walking leg-cycles, and floating elements.
 */
import { useEffect, useRef } from 'react'
import Zdog from 'zdog'

const TAU = Zdog.TAU

export default function HealthcareIllo({ width = 420, height = 420, className = '' }) {
  const canvasRef = useRef(null)
  const illoRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Scene Setup
    const illo = new Zdog.Illustration({
      element: canvas,
      zoom: 1.1,
      dragRotate: false,
      rotate: { x: -0.15, y: -0.4 },
    })
    illoRef.current = illo

    // Colors
    const C = {
      skin: '#FFCCAA',
      skinDark: '#E8B090',
      coatWhite: '#F8FAFC',
      coatShadow: '#E2E8F0',
      scrubTeal: '#14B8A6',
      scrubDark: '#0D9488',
      hair1: '#2D1B10',
      hair2: '#FBBF24',
      steth: '#475569',
      stethHead: '#64748B',
      heartRed: '#F43F5E',
      heartGlow: '#FB7185',
      crossWhite: '#FFFFFF',
      crossBg: '#EF4444',
      pillBlue: '#3B82F6',
      pillWhite: '#F8FAFC',
      capsuleGreen: '#10B981',
      clipBlue: '#3B82F6',
      clipBoard: '#F5E6C8',
      dnaBlue: '#06B6D4',
      dnaPurple: '#8B5CF6',
      shoeBrown: '#451A03',
      shoeBlack: '#0F172A',
      pants: '#1E293B',
      pantsNurse: '#0F766E',
    }

    // ═══════════════════════════
    // DOCTOR (Left)
    // ═══════════════════════════
    const doctor = new Zdog.Anchor({ addTo: illo, translate: { x: -65, y: 10 } })

    // Doctor Head Anchor
    const doctorHead = new Zdog.Anchor({
      addTo: doctor,
      translate: { y: -90 },
    })

    // Head Sphere
    new Zdog.Shape({
      addTo: doctorHead,
      stroke: 52,
      color: C.skin,
    })

    // Nose (Stylized)
    new Zdog.Shape({
      addTo: doctorHead,
      stroke: 10,
      color: '#E8B090',
      translate: { z: 24, y: 4 },
    })

    // Spectacles frame (Davey Retro style)
    ;[-9, 9].forEach((x) => {
      new Zdog.Ellipse({
        addTo: doctorHead,
        diameter: 14,
        stroke: 3,
        color: C.shoeBlack,
        translate: { x, y: -2, z: 25 },
      })
    })
    // Spectacles bridge
    new Zdog.Shape({
      addTo: doctorHead,
      path: [{ x: -2, y: -2 }, { x: 2, y: -2 }],
      stroke: 2.5,
      color: C.shoeBlack,
      translate: { z: 25 },
    })

    // Hair
    new Zdog.Shape({
      addTo: doctorHead,
      path: [
        { x: -22, y: -28 },
        { arc: [{ x: -28, y: -38 }, { x: -10, y: -40 }] },
        { arc: [{ x: 10, y: -42 }, { x: 28, y: -36 }] },
        { arc: [{ x: 32, y: -28 }, { x: 26, y: -18 }] },
        { arc: [{ x: 22, y: -14 }, { x: 18, y: -18 }] },
        { arc: [{ x: 0, y: -24 }, { x: -18, y: -18 }] },
        { arc: [{ x: -24, y: -16 }, { x: -22, y: -28 }] },
      ],
      closed: true,
      fill: true,
      stroke: 4,
      color: C.hair1,
    })

    // Eyes
    ;[-9, 9].forEach((x) => {
      new Zdog.Shape({
        addTo: doctorHead,
        stroke: 4,
        color: '#0F172A',
        translate: { x, y: -2, z: 25 },
      })
    })

    // Smile
    new Zdog.Ellipse({
      addTo: doctorHead,
      diameter: 10,
      quarters: 2,
      translate: { y: 8, z: 24 },
      rotate: { z: TAU / 4 },
      stroke: 2.5,
      color: '#CC8866',
      closed: false,
    })

    // Doctor Body
    new Zdog.RoundedRect({
      addTo: doctor,
      width: 50,
      height: 68,
      cornerRadius: 14,
      translate: { y: -30 },
      stroke: 18,
      fill: true,
      color: C.coatWhite,
    })

    // Lapel / coat center line
    new Zdog.Shape({
      addTo: doctor,
      path: [{ x: 0, y: -58 }, { x: 0, y: -5 }],
      stroke: 2,
      color: C.coatShadow,
    })

    // Coat Collars
    new Zdog.Shape({
      addTo: doctor,
      path: [{ x: -5, y: -58 }, { x: -13, y: -46 }],
      stroke: 3.5,
      color: '#FFFFFF',
      closed: false,
    })
    new Zdog.Shape({
      addTo: doctor,
      path: [{ x: 5, y: -58 }, { x: 13, y: -46 }],
      stroke: 3.5,
      color: '#FFFFFF',
      closed: false,
    })

    // Coat pockets
    ;[-14, 14].forEach((x) => {
      new Zdog.RoundedRect({
        addTo: doctor,
        width: 16,
        height: 10,
        cornerRadius: 3,
        translate: { x, y: -12, z: 8 },
        stroke: 2,
        fill: true,
        color: C.coatShadow,
      })
    })

    // Stethoscope
    new Zdog.Ellipse({
      addTo: doctor,
      diameter: 24,
      quarters: 2,
      translate: { y: -60, z: 10 },
      rotate: { z: TAU / 4 },
      stroke: 3.5,
      color: C.steth,
      closed: false,
    })
    new Zdog.Shape({
      addTo: doctor,
      stroke: 10,
      color: C.stethHead,
      translate: { x: 0, y: -48, z: 14 },
    })

    // Doctor Left Arm Anchor (for waving/pumping animation)
    const doctorLeftArm = new Zdog.Anchor({
      addTo: doctor,
      translate: { x: -38, y: -52 },
    })
    new Zdog.Shape({
      addTo: doctorLeftArm,
      path: [{ y: 0 }, { y: 30 }],
      stroke: 16,
      color: C.coatWhite,
    })
    new Zdog.Shape({
      addTo: doctorLeftArm,
      stroke: 14,
      color: C.skin,
      translate: { y: 30 },
    })

    // Doctor Right Arm Anchor (crank rotation!)
    const doctorRightArm = new Zdog.Anchor({
      addTo: doctor,
      translate: { x: 38, y: -52 },
    })
    new Zdog.Shape({
      addTo: doctorRightArm,
      path: [{ y: 0 }, { y: 30 }],
      stroke: 16,
      color: C.coatWhite,
    })
    new Zdog.Shape({
      addTo: doctorRightArm,
      stroke: 14,
      color: C.skin,
      translate: { y: 30 },
    })

    // Clipboard (attached to Doctor's Right Arm, stays upright)
    const clipboard = new Zdog.Anchor({
      addTo: doctorRightArm,
      translate: { y: 30, z: 10 },
    })
    new Zdog.RoundedRect({
      addTo: clipboard,
      width: 20,
      height: 26,
      cornerRadius: 3,
      stroke: 3,
      fill: true,
      color: C.clipBoard,
    })
    new Zdog.RoundedRect({
      addTo: clipboard,
      width: 10,
      height: 6,
      cornerRadius: 2,
      translate: { y: -14 },
      stroke: 2,
      fill: true,
      color: C.clipBlue,
    })
    ;[-4, 0, 4, 8].forEach((y) => {
      new Zdog.Shape({
        addTo: clipboard,
        path: [{ x: -6, y }, { x: 6, y }],
        stroke: 1.5,
        color: '#AABBCC',
      })
    })

    // Doctor Legs
    const doctorLeftLeg = new Zdog.Anchor({
      addTo: doctor,
      translate: { x: -10, y: 4 },
    })
    new Zdog.Shape({
      addTo: doctorLeftLeg,
      path: [{ y: 0 }, { y: 30 }],
      stroke: 14,
      color: C.pants,
    })
    new Zdog.RoundedRect({
      addTo: doctorLeftLeg,
      width: 16,
      height: 8,
      cornerRadius: 4,
      translate: { y: 34, z: 4 },
      stroke: 4,
      fill: true,
      color: C.shoeBrown,
    })

    const doctorRightLeg = new Zdog.Anchor({
      addTo: doctor,
      translate: { x: 10, y: 4 },
    })
    new Zdog.Shape({
      addTo: doctorRightLeg,
      path: [{ y: 0 }, { y: 30 }],
      stroke: 14,
      color: C.pants,
    })
    new Zdog.RoundedRect({
      addTo: doctorRightLeg,
      width: 16,
      height: 8,
      cornerRadius: 4,
      translate: { y: 34, z: 4 },
      stroke: 4,
      fill: true,
      color: C.shoeBrown,
    })

    // ═══════════════════════════
    // NURSE (Right)
    // ═══════════════════════════
    const nurse = new Zdog.Anchor({ addTo: illo, translate: { x: 65, y: 10 } })

    // Nurse Head Anchor
    const nurseHead = new Zdog.Anchor({
      addTo: nurse,
      translate: { y: -88 },
    })

    new Zdog.Shape({
      addTo: nurseHead,
      stroke: 48,
      color: C.skin,
    })

    // Nose
    new Zdog.Shape({
      addTo: nurseHead,
      stroke: 9,
      color: '#E8B090',
      translate: { z: 22, y: 4 },
    })

    // Hair
    new Zdog.Shape({
      addTo: nurseHead,
      path: [
        { x: -24, y: -28 },
        { arc: [{ x: -28, y: -38 }, { x: -8, y: -40 }] },
        { arc: [{ x: 8, y: -42 }, { x: 24, y: -36 }] },
        { arc: [{ x: 30, y: -28 }, { x: 28, y: -10 }] },
        { arc: [{ x: 26, y: 8 }, { x: 22, y: 12 }] },
        { line: { x: 18, y: 12 } },
        { arc: [{ x: 20, y: -2 }, { x: 18, y: -12 }] },
        { arc: [{ x: 5, y: -24 }, { x: -5, y: -24 }] },
        { arc: [{ x: -18, y: -12 }, { x: -18, y: 12 }] },
        { line: { x: -22, y: 12 } },
        { arc: [{ x: -26, y: 8 }, { x: -28, y: -10 }] },
        { arc: [{ x: -30, y: -22 }, { x: -24, y: -28 }] },
      ],
      closed: true,
      fill: true,
      stroke: 4,
      color: C.hair2,
    })

    // Bouncing Ponytail / Hair Bun (Davey style)
    const nurseBun = new Zdog.Shape({
      addTo: nurseHead,
      stroke: 20,
      color: C.hair2,
      translate: { y: -6, z: -20 },
    })

    // Eyes
    ;[-7, 7].forEach((x) => {
      new Zdog.Shape({
        addTo: nurseHead,
        stroke: 4.5,
        color: '#0F172A',
        translate: { x, y: -2, z: 22 },
      })
    })

    // Smile
    new Zdog.Ellipse({
      addTo: nurseHead,
      diameter: 9,
      quarters: 2,
      translate: { y: 8, z: 22 },
      rotate: { z: TAU / 4 },
      stroke: 2.5,
      color: '#CC8866',
      closed: false,
    })

    // Cap
    new Zdog.RoundedRect({
      addTo: nurseHead,
      width: 22,
      height: 14,
      cornerRadius: 4,
      translate: { y: -28, z: 6 },
      rotate: { x: -0.3 },
      stroke: 3,
      fill: true,
      color: C.crossWhite,
    })
    new Zdog.Shape({
      addTo: nurseHead,
      path: [{ x: -4, y: 0 }, { x: 4, y: 0 }],
      translate: { y: -29, z: 10 },
      rotate: { x: -0.3 },
      stroke: 2.5,
      color: C.heartRed,
    })
    new Zdog.Shape({
      addTo: nurseHead,
      path: [{ x: 0, y: -4 }, { x: 0, y: 4 }],
      translate: { y: -29, z: 10 },
      rotate: { x: -0.3 },
      stroke: 2.5,
      color: C.heartRed,
    })

    // Nurse Body
    new Zdog.RoundedRect({
      addTo: nurse,
      width: 46,
      height: 62,
      cornerRadius: 14,
      translate: { y: -30 },
      stroke: 16,
      fill: true,
      color: C.scrubTeal,
    })

    // V-neck
    new Zdog.Shape({
      addTo: nurse,
      path: [
        { x: -8, y: -58 },
        { x: 0, y: -48 },
        { x: 8, y: -58 },
      ],
      translate: { z: 8 },
      stroke: 2.5,
      color: C.scrubDark,
      closed: false,
    })

    // Nurse Left Arm Anchor (rotation!)
    const nurseLeftArm = new Zdog.Anchor({
      addTo: nurse,
      translate: { x: -35, y: -50 },
    })
    new Zdog.Shape({
      addTo: nurseLeftArm,
      path: [{ y: 0 }, { y: 28 }],
      stroke: 14,
      color: C.scrubTeal,
    })
    new Zdog.Shape({
      addTo: nurseLeftArm,
      stroke: 12,
      color: C.skin,
      translate: { y: 28 },
    })

    // Nurse Right Arm Anchor (waving!)
    const nurseRightArm = new Zdog.Anchor({
      addTo: nurse,
      translate: { x: 35, y: -50 },
    })
    new Zdog.Shape({
      addTo: nurseRightArm,
      path: [{ y: 0 }, { y: 28 }],
      stroke: 14,
      color: C.scrubTeal,
    })
    new Zdog.Shape({
      addTo: nurseRightArm,
      stroke: 12,
      color: C.skin,
      translate: { y: 28 },
    })

    // Nurse Legs
    const nurseLeftLeg = new Zdog.Anchor({
      addTo: nurse,
      translate: { x: -9, y: 4 },
    })
    new Zdog.Shape({
      addTo: nurseLeftLeg,
      path: [{ y: 0 }, { y: 28 }],
      stroke: 13,
      color: C.pantsNurse,
    })
    new Zdog.Shape({
      addTo: nurseLeftLeg,
      stroke: 14,
      color: C.crossWhite,
      translate: { y: 32, z: 4 },
    })

    const nurseRightLeg = new Zdog.Anchor({
      addTo: nurse,
      translate: { x: 9, y: 4 },
    })
    new Zdog.Shape({
      addTo: nurseRightLeg,
      path: [{ y: 0 }, { y: 28 }],
      stroke: 13,
      color: C.pantsNurse,
    })
    new Zdog.Shape({
      addTo: nurseRightLeg,
      stroke: 14,
      color: C.crossWhite,
      translate: { y: 32, z: 4 },
    })

    // ═══════════════════════════
    // FLOATING MEDICAL ELEMENTS
    // ═══════════════════════════

    // ─── Heart ───
    const heartAnchor = new Zdog.Anchor({
      addTo: illo,
      translate: { x: 0, y: -120, z: 20 },
    })
    new Zdog.Shape({
      addTo: heartAnchor,
      stroke: 18,
      color: C.heartRed,
      translate: { x: -6, y: -4 },
    })
    new Zdog.Shape({
      addTo: heartAnchor,
      stroke: 18,
      color: C.heartGlow,
      translate: { x: 6, y: -4 },
    })
    new Zdog.Shape({
      addTo: heartAnchor,
      path: [
        { x: -12, y: -2 },
        { x: 0, y: 12 },
        { x: 12, y: -2 },
      ],
      stroke: 4,
      fill: true,
      color: C.heartRed,
    })

    // ─── Medical Cross ───
    const crossAnchor = new Zdog.Anchor({
      addTo: illo,
      translate: { x: -110, y: -50, z: -20 },
    })
    new Zdog.Shape({
      addTo: crossAnchor,
      stroke: 32,
      color: C.crossBg,
    })
    new Zdog.Shape({
      addTo: crossAnchor,
      path: [{ x: -6, y: 0 }, { x: 6, y: 0 }],
      stroke: 5,
      color: C.crossWhite,
    })
    new Zdog.Shape({
      addTo: crossAnchor,
      path: [{ x: 0, y: -6 }, { x: 0, y: 6 }],
      stroke: 5,
      color: C.crossWhite,
    })

    // ─── Pill ───
    const pillAnchor = new Zdog.Anchor({
      addTo: illo,
      translate: { x: 110, y: -60, z: -10 },
      rotate: { z: 0.5 },
    })
    new Zdog.Shape({
      addTo: pillAnchor,
      path: [{ y: -8 }, { y: 0 }],
      stroke: 14,
      color: C.pillBlue,
    })
    new Zdog.Shape({
      addTo: pillAnchor,
      path: [{ y: 0 }, { y: 8 }],
      stroke: 14,
      color: C.pillWhite,
    })

    // ─── Second pill ───
    const pill2 = new Zdog.Anchor({
      addTo: illo,
      translate: { x: 95, y: 55, z: 15 },
      rotate: { z: -0.8 },
    })
    new Zdog.Shape({
      addTo: pill2,
      path: [{ y: -6 }, { y: 0 }],
      stroke: 10,
      color: C.capsuleGreen,
    })
    new Zdog.Shape({
      addTo: pill2,
      path: [{ y: 0 }, { y: 6 }],
      stroke: 10,
      color: C.pillWhite,
    })

    // ─── DNA Helix dots ───
    const dnaAnchor = new Zdog.Anchor({
      addTo: illo,
      translate: { x: -105, y: 45, z: 10 },
    })
    ;[
      { x: -6, y: -12, c: C.dnaBlue },
      { x: 6, y: -6, c: C.dnaPurple },
      { x: -6, y: 0, c: C.dnaBlue },
      { x: 6, y: 6, c: C.dnaPurple },
      { x: -6, y: 12, c: C.dnaBlue },
    ].forEach(({ x, y, c }) => {
      new Zdog.Shape({
        addTo: dnaAnchor,
        stroke: 7,
        color: c,
        translate: { x, y },
      })
    })
    ;[-6, 0, 6].forEach((y) => {
      new Zdog.Shape({
        addTo: dnaAnchor,
        path: [{ x: -6, y }, { x: 6, y: y + 6 }],
        stroke: 1.5,
        color: '#8899CC',
      })
    })

    // ─── ECG Heartbeat line ───
    const ecgAnchor = new Zdog.Anchor({
      addTo: illo,
      translate: { x: 0, y: 65, z: 30 },
    })
    new Zdog.Shape({
      addTo: ecgAnchor,
      path: [
        { x: -40, y: 0 },
        { x: -20, y: 0 },
        { x: -14, y: -12 },
        { x: -8, y: 14 },
        { x: -2, y: -8 },
        { x: 4, y: 0 },
        { x: 40, y: 0 },
      ],
      stroke: 2.5,
      color: C.heartRed,
      closed: false,
    })

    // ─── Platform / Ground (Rotating medical scanner disc) ───
    const platform = new Zdog.Ellipse({
      addTo: illo,
      diameter: 200,
      translate: { y: 55 },
      rotate: { x: TAU / 4 },
      stroke: 6,
      fill: true,
      color: '#E2E8F0',
      backface: '#CBD5E1',
    })

    // Concentric ring 1
    new Zdog.Ellipse({
      addTo: platform,
      diameter: 170,
      stroke: 3,
      color: '#CBD5E1',
    })
    // Concentric ring 2 (inner cyan glow ring)
    new Zdog.Ellipse({
      addTo: platform,
      diameter: 140,
      stroke: 2,
      color: '#22D3EE',
    })

    // Add markings on the platform for a mechanical/gear feel
    ;[0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => {
      new Zdog.Shape({
        addTo: platform,
        path: [{ y: 90 }, { y: 100 }],
        rotate: { z: (TAU / 8) * i },
        stroke: 4,
        color: '#94A3B8',
      })
    })

    // ─── Central Medical Console Machine ───
    const consoleStand = new Zdog.Cylinder({
      addTo: illo,
      diameter: 20,
      length: 24,
      translate: { x: 0, y: 35, z: 0 },
      rotate: { x: TAU / 4 },
      color: '#334155', // slate-700
      backface: '#1E293B', // slate-800
    })

    const consoleScreen = new Zdog.RoundedRect({
      addTo: consoleStand,
      width: 32,
      height: 20,
      cornerRadius: 4,
      translate: { z: 12, y: 0 },
      stroke: 4,
      fill: true,
      color: '#0F172A',
    })

    // Green pulse line on screen
    new Zdog.Shape({
      addTo: consoleScreen,
      path: [
        { x: -10, y: 0 },
        { x: -5, y: 0 },
        { x: -2, y: -5 },
        { x: 1, y: 5 },
        { x: 4, y: 0 },
        { x: 10, y: 0 },
      ],
      stroke: 2,
      color: '#10B981', // emerald-500
      closed: false,
    })

    // ═══════════════════════════
    // ANIMATION LOOP (Robin Davey / Nippu Style)
    // ═══════════════════════════
    let ticker = 0

    function animate() {
      ticker += 0.035

      // 1. Bobbing bodies out of phase (gives organic/mechanical bounce)
      doctor.translate.y = 10 + Math.sin(ticker * 1.5) * 5
      nurse.translate.y = 10 + Math.cos(ticker * 1.5) * 5

      // 2. Rotating heads (looking around slightly)
      doctorHead.rotate.y = Math.sin(ticker) * 0.15
      doctorHead.rotate.x = -0.15 + Math.cos(ticker * 0.5) * 0.05
      
      nurseHead.rotate.y = Math.cos(ticker) * 0.15
      nurseHead.rotate.x = -0.15 + Math.sin(ticker * 0.5) * 0.05

      // 3. Nurse hair bun bounce
      nurseBun.translate.y = -6 + Math.sin(ticker * 2) * 2

      // 4. Doctor arm cycles (crank-turning clipboard)
      doctorRightArm.rotate.z = ticker * 1.5
      clipboard.rotate.z = -ticker * 1.5 - 0.15  // counter-rotate to stay upright
      
      doctorLeftArm.rotate.z = 0.3 + Math.sin(ticker * 2) * 0.4
      doctorLeftArm.rotate.x = Math.cos(ticker) * 0.2

      // 5. Nurse arm cycles (crank-turning & waving)
      nurseLeftArm.rotate.z = -0.3 + Math.cos(ticker * 2) * 0.4
      nurseLeftArm.rotate.x = Math.sin(ticker) * 0.2
      
      nurseRightArm.rotate.z = -ticker * 1.5

      // 6. Leg pedaling/swinging (mechanical walk cycle)
      doctorLeftLeg.rotate.x = Math.sin(ticker * 1.5) * 0.4
      doctorRightLeg.rotate.x = -Math.sin(ticker * 1.5) * 0.4

      nurseLeftLeg.rotate.x = -Math.sin(ticker * 1.5) * 0.4
      nurseRightLeg.rotate.x = Math.sin(ticker * 1.5) * 0.4

      // 7. Platform rotations
      platform.rotate.z = -ticker * 0.1

      // 8. Console screen scale heartbeat pulse
      consoleScreen.scale = 1 + Math.sin(ticker * 3.5) * 0.06

      // 9. Floating elements orbits & heart pulse
      heartAnchor.scale = 1 + Math.sin(ticker * 3.5) * 0.12
      heartAnchor.translate.y = -125 + Math.sin(ticker * 1.5) * 8
      heartAnchor.rotate.y += 0.015

      crossAnchor.rotate.z += 0.03
      crossAnchor.translate.y = -50 + Math.sin(ticker * 1.2 + 1) * 5

      // Orbiting pills in 3D space
      pillAnchor.translate.x = Math.cos(ticker * 0.8) * 125
      pillAnchor.translate.z = Math.sin(ticker * 0.8) * 60
      pillAnchor.translate.y = -60 + Math.sin(ticker * 1.5) * 8
      pillAnchor.rotate.x += 0.03
      pillAnchor.rotate.y += 0.01

      pill2.translate.x = Math.cos(ticker * 0.8 + Math.PI) * 115
      pill2.translate.z = Math.sin(ticker * 0.8 + Math.PI) * 50
      pill2.translate.y = 45 + Math.sin(ticker * 1.3 + 2) * 6
      pill2.rotate.y += 0.04

      dnaAnchor.rotate.y += 0.02
      dnaAnchor.translate.y = 45 + Math.sin(ticker * 1.1 + 1.5) * 6

      ecgAnchor.translate.y = 65 + Math.sin(ticker * 0.9) * 4
      ecgAnchor.rotate.y = Math.sin(ticker * 0.5) * 0.1

      illo.updateRenderGraph()
      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="display-block cursor-move mx-auto mb-5"
        style={{ touchAction: 'none' }}
      />
    </div>
  )
}
