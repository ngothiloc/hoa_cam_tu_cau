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
let db;
const dbReady = new Promise((resolve) => {
  try {
    const req = indexedDB.open("blue-hour-memories", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("photos");
    req.onsuccess = () => {
      db = req.result;
      resolve(db);
    };
    req.onerror = () => resolve(null);
  } catch {
    resolve(null);
  }
});
const getStored = async (id) => {
  await dbReady;
  if (!db) return null;
  return new Promise((resolve) => {
    const r = db.transaction("photos").objectStore("photos").get(id);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => resolve(null);
  });
};
const saveStored = async (id, data) => {
  await dbReady;
  if (!db) throw Error("storage");
  return new Promise((resolve, reject) => {
    const tx = db.transaction("photos", "readwrite");
    tx.objectStore("photos").put(data, id);
    tx.oncomplete = resolve;
    tx.onerror = reject;
    tx.onabort = reject;
  });
};
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
$("#replace-photo").onclick = () => $("#upload").click();
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePhoto();
});
stage.renderer.domElement.addEventListener("dblclick", closePhoto);
$("#upload").onchange = async (e) => {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file || selected < 0) return;
  const id = selected;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    toast("Hãy chọn ảnh JPG, PNG hoặc WebP.");
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    toast("Hãy chọn ảnh nhỏ hơn 20 MB.");
    return;
  }
  $("#replace-photo").disabled = true;
  let url;
  try {
    url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement("canvas");
    const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
    c.width = Math.max(1, Math.round(img.width * scale));
    c.height = Math.max(1, Math.round(img.height * scale));
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    const data = c.toDataURL("image/jpeg", 0.88);
    const texture = await photoTexture(data);
    stage.photoMaterials[id].map?.dispose();
    stage.photoMaterials[id].map = texture;
    stage.photoMaterials[id].needsUpdate = true;
    memories[id].src = data;
    memories[id].custom = true;
    if (selected === id) $("#photo-preview").src = data;
    try {
      await saveStored(id, data);
      toast("Đã đặt ảnh của bạn vào bó hoa ♡");
    } catch {
      toast("Ảnh đã thay; trình duyệt không cho phép lưu lâu dài.");
    }
  } catch {
    toast("Không đọc được ảnh này. Hãy thử một ảnh khác.");
  } finally {
    if (url) URL.revokeObjectURL(url);
    $("#replace-photo").disabled = false;
  }
};

await Promise.all(
  memories.map(async (m, i) => {
    const stored = await getStored(i);
    if (stored) {
      m.src = stored;
      m.custom = true;
    }
    try {
      stage.photoMaterials[i].map = await photoTexture(m.src);
      stage.photoMaterials[i].needsUpdate = true;
    } catch {
      toast("Một ảnh chưa tải được. Bạn có thể thay bằng ảnh của mình.");
    }
  }),
);
stage.start();
$("#loading").hidden = true;
$("#hint").classList.add("visible");
setTimeout(() => $("#hint").classList.remove("visible"), 6500);
