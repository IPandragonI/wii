"use client";

import { useEffect, useRef, useState } from "react";

import { MiiAvatar } from "@/components/ui/MiiAvatar";
import { prefersReducedMotion } from "@/lib/screen-transition";

/**
 * A 3D Mii-style character who waves hello when the About channel opens.
 *
 * Model: "character-male-e" from Kenney's Mini Characters 1 (CC0, public domain; see
 * public/models/mii/LICENSE-Kenney.txt). It ships with an `idle` clip and a simple 7-joint rig
 * (root, legs, torso, arms, head) but no wave, so the wave is driven on the real `arm-right`
 * bone: the arm rises, swings three times, and lowers, while the idle clip keeps the body alive.
 * The rig has no elbow or wrist, so the whole raised arm swings, much like a Mii's.
 *
 * three.js is imported dynamically, so it is only downloaded on this channel. The scene
 * renders only while visible, is disposed (WebGL context included) on unmount, and falls
 * back to the illustrated Mii if WebGL is unavailable or the model fails to load.
 */

const MODEL_URL = "/models/mii/character-male-e.glb";
const WAVE_SECONDS = 2.8;
const WAVE_EVERY_SECONDS = 9;
/**
 * Radians around the arm joint's local Z axis, measured from the idle pose (arm down):
 * 1.3 is up and out, 1.9 is beside the head, and beyond ~2.1 the arm crosses behind the head.
 * The wave swings between those first two.
 */
const ARM_RAISE = 1.65;
const ARM_SWING = 0.3;

type Status = "loading" | "ready" | "fallback";

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const smooth = (value: number) => {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
};

/** Arm raise (0..1) and swing (-1..1) at `t` seconds into a wave. */
export function wavePose(t: number): { raise: number; swing: number } {
  if (t < 0 || t > WAVE_SECONDS) return { raise: 0, swing: 0 };
  const raise = Math.min(smooth(t / 0.45), smooth((WAVE_SECONDS - t) / 0.45));
  const swing = t > 0.45 && t < WAVE_SECONDS - 0.45 ? Math.sin(((t - 0.45) / 0.63) * Math.PI * 2) : 0;
  return { raise, swing };
}

export function MiiStage({ label }: { label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let disposed = false;
    let cleanup = () => {};

    const start = async () => {
      if (!webglAvailable()) throw new Error("WebGL unavailable");
      const [THREE, { GLTFLoader }] = await Promise.all([import("three"), import("three/addons/loaders/GLTFLoader.js")]);
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xffffff, 0xc5d0da, 2.3));
      const key = new THREE.DirectionalLight(0xffffff, 1.5);
      key.position.set(2.5, 4, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xcfeeff, 0.8);
      rim.position.set(-3, 2, -3);
      scene.add(rim);
      const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 50);

      const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
      if (disposed) {
        renderer.dispose();
        return;
      }
      const character = gltf.scene;
      character.rotation.y = 0.32; // turned slightly toward the text on the right
      scene.add(character);

      // Idle on the whole body, except the right arm, which the wave drives.
      const mixer = new THREE.AnimationMixer(character);
      const idle = gltf.animations.find((clip) => clip.name === "idle");
      if (idle) {
        const body = idle.clone();
        body.tracks = body.tracks.filter((track) => !track.name.startsWith("arm-right."));
        mixer.clipAction(body).play();
      }
      mixer.update(0);
      const arm = character.getObjectByName("arm-right");
      // The arm's rest pose is the idle clip's first keyframe (arm down), not the bind pose (T-pose).
      const armTrack = idle?.tracks.find((track) => track.name === "arm-right.quaternion");
      const rest = armTrack ? new THREE.Quaternion().fromArray(armTrack.values, 0) : arm?.quaternion.clone();
      if (arm && rest) arm.quaternion.copy(rest);
      const zAxis = new THREE.Vector3(0, 0, 1);
      const turn = new THREE.Quaternion();

      // Frame the character, leaving headroom for the raised arm.
      const box = new THREE.Box3().setFromObject(character);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const frame = () => {
        const { clientWidth: width, clientHeight: height } = container;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const distance = Math.max((size.y * 1.45) / 2 / tan, (size.y * 1.15) / 2 / (tan * camera.aspect));
        camera.position.set(0, center.y + size.y * 0.12, center.z + distance);
        camera.lookAt(0, center.y + size.y * 0.1, center.z);
        camera.updateProjectionMatrix();
      };

      // A soft round shadow under the feet (cheaper than shadow maps).
      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = shadowCanvas.height = 64;
      const context = shadowCanvas.getContext("2d");
      if (context) {
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, "rgba(40,50,60,0.32)");
        gradient.addColorStop(0.55, "rgba(40,50,60,0.12)");
        gradient.addColorStop(1, "rgba(40,50,60,0)");
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
      }
      const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(size.x * 1.15, size.x * 1.15),
        new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }),
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = box.min.y + 0.001;
      scene.add(shadow);

      const pose = (raise: number, swing: number) => {
        if (!arm || !rest) return;
        turn.setFromAxisAngle(zAxis, -raise * (ARM_RAISE + ARM_SWING * swing));
        arm.quaternion.copy(rest).multiply(turn);
      };

      const reduced = prefersReducedMotion();
      let frameId = 0;
      let visible = true;
      let last = performance.now();
      let elapsed = 0;
      let waveStart = 0.35; // first wave right after the channel opens

      const render = () => renderer.render(scene, camera);
      const tick = (now: number) => {
        frameId = 0;
        const delta = Math.min(0.1, (now - last) / 1000);
        last = now;
        elapsed += delta;
        mixer.update(delta);
        if (elapsed - waveStart > WAVE_EVERY_SECONDS) waveStart = elapsed;
        const { raise, swing } = wavePose(elapsed - waveStart);
        pose(raise, swing);
        render();
        schedule();
      };
      const schedule = () => {
        if (!reduced && visible && !document.hidden && !frameId) {
          last = performance.now();
          frameId = requestAnimationFrame(tick);
        }
      };

      const resizeObserver = new ResizeObserver(() => {
        frame();
        render();
      });
      resizeObserver.observe(container);
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        schedule();
      });
      visibilityObserver.observe(container);
      const onVisibility = () => schedule();
      document.addEventListener("visibilitychange", onVisibility);
      const greet = () => {
        if (reduced) return;
        if (elapsed - waveStart > WAVE_SECONDS) waveStart = elapsed;
      };
      container.addEventListener("pointerenter", greet);
      container.addEventListener("pointerdown", greet);

      frame();
      if (reduced) pose(1, 0); // a still, friendly raised hand
      render();
      setStatus("ready");
      schedule();

      cleanup = () => {
        cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        container.removeEventListener("pointerenter", greet);
        container.removeEventListener("pointerdown", greet);
        mixer.stopAllAction();
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            for (const material of [object.material].flat()) {
              for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
              material.dispose();
            }
          }
        });
        shadowTexture.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
      };
    };

    start().catch(() => {
      if (!disposed) setStatus("fallback");
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full select-none">
      {status !== "fallback" && (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={label}
          className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${status === "ready" ? "opacity-100" : "opacity-0"}`}
        />
      )}
      {status === "loading" && (
        <span aria-hidden="true" className="absolute bottom-[8%] left-1/2 h-4 w-28 -translate-x-1/2 animate-pulse rounded-[50%] bg-black/10 motion-reduce:animate-none" />
      )}
      {status === "fallback" && <MiiAvatar label={label} className="absolute inset-0 m-auto h-full max-h-full w-auto" />}
    </div>
  );
}
