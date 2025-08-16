// project/src/components/DiceRoller.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * New implementation using @drdreo/dice-box-threejs (ThreeJS + cannon-es).
 * - No wasm, no theme JSONs, no public asset copying required.
 * - White dice, centered toss, big size.
 * - Forced outcomes (matches your game.ts dice values exactly).
 *
 * Keep your existing usage:
 *   <DiceRoller dice={[d1,d2,d3]} isRolling={rolling} />
 */

type FaceVal = 1 | 2 | 3 | 4 | 5 | 6;

interface Props {
  dice: [number, number, number];
  isRolling: boolean;
  durationMs?: number; // kept for compatibility (unused here)
}

const DiceRoller: React.FC<Props> = ({ dice, isRolling }) => {
  // clamp faces 1..6
  const faces = useMemo(
    () =>
      dice.map((n) => Math.max(1, Math.min(6, Math.round(n)))) as [
        FaceVal,
        FaceVal,
        FaceVal
      ],
    [dice]
  );

  // Bigger tray + dice (responsive)
  const { heightPx, baseScale, strength } = useMemo(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1080;
    return {
      heightPx: w <= 420 ? 360 : w <= 768 ? 420 : 480,
      baseScale: w <= 420 ? 120 : w <= 768 ? 135 : 150, // size of dice
      strength: 1.35, // toss strength
    };
  }, []);

  const containerIdRef = useRef<string>(
    `dice3js-${Math.random().toString(36).slice(2)}`
  );
  const boxRef = useRef<any>(null);
  const readyRef = useRef(false);
  const prevRollingRef = useRef(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Init dice box (ThreeJS)
  useEffect(() => {
    let destroyed = false;

    (async () => {
      setInitError(null);

      let DiceBoxCtor: any = null;
      try {
        const mod: any = await import("@drdreo/dice-box-threejs");
        // package exports default class DiceBox
        DiceBoxCtor = mod?.default ?? mod?.DiceBox ?? null;
      } catch (e) {
        setInitError("Failed to import @drdreo/dice-box-threejs");
        console.error(e);
        return;
      }
      if (typeof DiceBoxCtor !== "function") {
        setInitError("DiceBox export is not a constructor");
        return;
      }

      // Config per package README (no external assets needed)
      const Box = new DiceBoxCtor(`#${containerIdRef.current}`, {
        // visuals
        theme_colorset: "white",   // white dice preset
        theme_material: "plastic", // crisp look
        theme_surface: "green-felt",
        shadows: true,
        light_intensity: 0.8,

        // physics / size
        baseScale,    // dice size
        strength,     // toss power
        gravity_multiplier: 420,

        // quality & sfx
        framerate: 1 / 60,
        sounds: false,

        // center-ish spawn/throw is handled internally; this lib centers well by default
        onRollComplete: () => {}, // we don't need it — you already know the values
      });

      boxRef.current = Box;

      try {
        await Box.init();
        if (destroyed) return;
        readyRef.current = true;
      } catch (e) {
        setInitError("Failed to initialize ThreeJS dice box.");
        console.error(e);
      }
    })();

    return () => {
      destroyed = true;
      try {
        boxRef.current?.destroy?.();
      } catch {}
      readyRef.current = false;
      boxRef.current = null;
    };
  }, [baseScale, strength]);

  // Roll when isRolling toggles to true
  useEffect(() => {
    const was = prevRollingRef.current;
    prevRollingRef.current = isRolling;

    if (!readyRef.current || !isRolling || was) return;
    const Box = boxRef.current;
    if (!Box?.roll) return;

    const [a, b, c] = faces;

    // Clear any existing dice from scene
    try {
      Box.clear?.();
    } catch {}

    // This lib supports predetermined results in notation:
    //   "3d6@a,b,c"  (exact faces)
    const notation = `3d6@${a},${b},${c}`;

    // Slight delay helps visuals if you push new values quickly
    setTimeout(() => {
      Box.roll(notation).catch((e: any) => console.error("roll error:", e));
    }, 50);
  }, [isRolling, faces]);

  return (
    <div
      style={{
        width: "100%",
        height: heightPx,
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        background:
          "radial-gradient(120% 120% at 50% 0%, #0b0f1a 0%, #0a0d16 60%, #080b12 100%)",
      }}
    >
      <div id={containerIdRef.current} style={{ position: "absolute", inset: 0 }} />
      {initError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f87171",
            fontSize: 12,
            textAlign: "center",
            padding: 12,
            pointerEvents: "none",
          }}
        >
          {initError}
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
