import * as THREE from "three";
import { createStage } from "./stage.js";
const $ = (s) => document.querySelector(s);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const memories = [
  {
    title: "LALALA",
    description: "Xinh gái cầu túi dựa vào cầu chụp ảnh với hoàng hôn.",
    src: "assets/IMG_0173.JPG",
  },
  {
    title: "Hello",
    description: "Xinh gái đứng cạnh cầu nhiều móc khoá tay gãi đầu.",
    src: "assets/IMG_0311.JPG",
  },
  {
    title: "Xinh gái",
    description: "Gái xinh ngồi ghế chụp ảnh.",
    src: "assets/IMG_7830.JPG",
  },
  {
    title: "Oanh iuu iuu iuuu",
    description: "Gái xinh đứng cạnh cầu móc khoá và toà tháp :v.",
    src: "assets/IMG_3110.JPG",
  },
];
let toastTimer;
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("#toast").hidden = true), 3500);
}

let stage;
try {
  stage = createStage($("#scene"), reduced);
} catch (error) {
  $("#loading").textContent =
    "Không khởi tạo được đồ họa 3D. Hãy bật tăng tốc đồ họa hoặc thử trình duyệt khác.";
  throw error;
}
const loader = new THREE.TextureLoader();
function photoTexture(src) {
  return new Promise((resolve, reject) =>
    loader.load(
      src,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(
          8,
          stage.renderer.capabilities.getMaxAnisotropy(),
        );
        const ratio = t.image.width / t.image.height,
          target = 0.665 / 0.755;
        if (ratio > target) {
          t.repeat.x = target / ratio;
          t.offset.x = (1 - t.repeat.x) / 2;
        } else {
          t.repeat.y = ratio / target;
          t.offset.y = (1 - t.repeat.y) / 2;
        }
        resolve(t);
      },
      undefined,
      reject,
    ),
  );
}
let selected = -1;
function focusPhoto(i) {
  selected = i;
  stage.focus(i);
  const m = memories[i];
  $("#photo-number").textContent = `KỶ NIỆM 0${i + 1} / 04`;
  $("#photo-count").textContent = `0${i + 1} / 04`;
  $("#photo-preview").src = m.src;
  $("#photo-preview").alt = m.title;
  $("#photo-title").textContent = m.title;
  $("#photo-description").textContent = m.description;
  $("#photo-panel").hidden = false;
  document.body.classList.add("photo-open");
  $("#close-photo").focus({ preventScroll: true });
}
function closePhoto() {
  selected = -1;
  $("#photo-panel").hidden = true;
  document.body.classList.remove("photo-open");
  stage.reset();
  $("#scene").focus({ preventScroll: true });
}
stage.onPhoto = focusPhoto;
$("#close-photo").onclick = closePhoto;
$("#previous").onclick = () => focusPhoto((selected + 3) % 4);
$("#next").onclick = () => focusPhoto((selected + 1) % 4);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePhoto();
});
stage.renderer.domElement.addEventListener("dblclick", closePhoto);
await Promise.all(
  memories.map(async (m, i) => {
    try {
      stage.photoMaterials[i].map = await photoTexture(m.src);
      stage.photoMaterials[i].needsUpdate = true;
    } catch {
      toast("Một ảnh chưa tải được. Vui lòng tải lại trang.");
    }
  }),
);
stage.start();
$("#loading").hidden = true;
$("#hint").classList.add("visible");
setTimeout(() => $("#hint").classList.remove("visible"), 6500);
