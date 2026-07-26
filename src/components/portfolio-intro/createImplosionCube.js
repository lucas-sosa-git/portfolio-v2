import {
  BoxGeometry,
  CanvasTexture,
  Color,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import vertexShader from "./implosionCube.vert.glsl?raw";
import fragmentShader from "./implosionCube.frag.glsl?raw";

function createLogoTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, "#f13a46");
  gradient.addColorStop(1, "#8e1026");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);
  context.fillStyle = "#fffaf7";
  context.font = "800 220px Rubik, Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("LS", 256, 273);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function createImplosionCube(canvas, initialParams) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(new Color("#000000"), 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 20);
  camera.position.z = 5.2;

  const texture = createLogoTexture();
  const geometry = new BoxGeometry(1.6, 1.6, 1.6, 12, 12, 12);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uCollapse: { value: 0 },
      uConcavity: { value: initialParams.concavity },
      uCornerResistance: { value: initialParams.cornerResistance },
      uFinalScale: { value: initialParams.finalScale },
      uNoiseMax: { value: Math.min(initialParams.noise, 0.1) },
      uAsymmetry: { value: initialParams.asymmetry },
      uDebugMode: { value: 0 },
      uHeat: { value: 0 },
      uOpacity: { value: 1 },
      uLogoTexture: { value: texture },
    },
    transparent: true,
    depthWrite: true,
    extensions: { derivatives: true },
  });
  const mesh = new Mesh(geometry, material);
  mesh.rotation.set(-0.12, 0.18, -0.035);
  scene.add(mesh);

  let measuredWidth = 0;
  let measuredHeight = 0;
  const resize = () => {
    const width = Math.max(canvas.clientWidth, 1);
    const height = Math.max(canvas.clientHeight, 1);
    if (width === measuredWidth && height === measuredHeight) return;
    measuredWidth = width;
    measuredHeight = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  return {
    render({
      time,
      collapse,
      opacity,
      heat,
      pulse,
      params = initialParams,
    }) {
      material.uniforms.uTime.value = time;
      material.uniforms.uCollapse.value = collapse;
      material.uniforms.uOpacity.value = opacity;
      material.uniforms.uHeat.value = heat;
      material.uniforms.uConcavity.value = params.concavity;
      material.uniforms.uCornerResistance.value = params.cornerResistance;
      material.uniforms.uFinalScale.value = params.finalScale;
      material.uniforms.uNoiseMax.value = Math.min(params.noise, 0.1);
      material.uniforms.uAsymmetry.value = params.asymmetry;
      mesh.scale.setScalar(1 + pulse * 0.004);
      renderer.render(scene, camera);
    },
    dispose() {
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    },
  };
}
