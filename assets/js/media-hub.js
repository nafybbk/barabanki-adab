// ============================================================
// MEDIA HUB — Cloudinary uploads (adab-gallery folder) + social
// link parsing (YouTube / Instagram / Facebook).
//
// Cloudinary config SITE_DATA.cloudinary se aati hai (data.js),
// jisko admin panel override kar sakta hai. Har upload:
//   1. pehle browser mein compress hota hai (images),
//   2. phir "adab-gallery" folder + tag ke saath upload hota hai.
// Public gallery page Cloudinary ki tag-list JSON se sab images
// har device par dikhati hai (koi backend nahi chahiye).
// ============================================================

const MediaHub = (() => {
  const FOLDER = "adab-gallery";
  const TAG = "adab-gallery";

  // Videos is se badi hain to Cloudinary par nahi — YouTube link policy.
  const MAX_VIDEO_MB = 40;

  function config() {
    const c = (typeof SITE_DATA !== "undefined" && SITE_DATA.cloudinary) || {};
    return { cloudName: (c.cloudName || "").trim(), uploadPreset: (c.uploadPreset || "").trim() };
  }
  function isConfigured() {
    const c = config();
    return !!(c.cloudName && c.uploadPreset);
  }

  // ---- Image compression (canvas, browser mein hi) ----
  const MAX_DIM = 1600;        // lambi side max pixels
  const JPEG_QUALITY = 0.82;
  const SKIP_BELOW = 200 * 1024; // already chhoti file — waise hi bhej do

  async function compressImage(file) {
    if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
    if (file.size < SKIP_BELOW) return file;
    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap) return file;
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", JPEG_QUALITY));
    bitmap.close && bitmap.close();
    if (!blob || blob.size >= file.size) return file; // compression se fayda nahi hua
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  }

  function resourceTypeFor(file) {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "raw"; // PDF / documents
  }

  // ---- Upload (XHR taake progress mile) ----
  async function upload(file, { caption = "", onProgress } = {}) {
    const { cloudName, uploadPreset } = config();
    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary abhi set nahi hua — Admin Panel > Gallery & Media mein cloud name aur upload preset daalein.");
    }
    const rtype = resourceTypeFor(file);
    if (rtype === "video" && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      throw new Error(`Video ${MAX_VIDEO_MB}MB se badi hai. Reels/badi videos YouTube par upload kar ke link paste karein (Gallery & Media > Video Links).`);
    }
    const toSend = rtype === "image" ? await compressImage(file) : file;

    const fd = new FormData();
    fd.append("file", toSend);
    fd.append("upload_preset", uploadPreset);
    fd.append("folder", FOLDER);
    fd.append("tags", TAG);
    if (caption) fd.append("context", "caption=" + caption.replace(/[=|]/g, " "));

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${rtype}/upload`);
      xhr.upload.onprogress = (e) => {
        if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total);
      };
      xhr.onload = () => {
        let res = {};
        try { res = JSON.parse(xhr.responseText); } catch {}
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ ...res, originalSize: file.size, sentSize: toSend.size, resourceType: rtype });
        } else {
          reject(new Error((res.error && res.error.message) || `Upload fail ho gaya (HTTP ${xhr.status})`));
        }
      };
      xhr.onerror = () => reject(new Error("Network error — internet connection check karein."));
      xhr.send(fd);
    });
  }

  // ---- Gallery listing (Cloudinary tag list JSON — public, backend-free) ----
  // Cloudinary Settings > Security mein "Resource list" ko ALLOWED rakhna
  // zaroori hai, warna ye 401 dega.
  async function listGallery(resourceType = "image") {
    const { cloudName } = config();
    if (!cloudName) return null;
    const res = await fetch(`https://res.cloudinary.com/${cloudName}/${resourceType}/list/${TAG}.json?t=${Math.floor(Date.now() / 60000)}`);
    if (!res.ok) throw new Error("list-unavailable");
    const data = await res.json();
    return data.resources || [];
  }

  // Delivery URLs — f_auto,q_auto se Cloudinary khud best format/compression deta hai.
  function imgUrl(publicId, { w = 900, version, format = "" } = {}) {
    const { cloudName } = config();
    const v = version ? `v${version}/` : "";
    const ext = format ? "." + format : "";
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${w},c_limit/${v}${publicId}${ext}`;
  }
  function thumbUrl(publicId, opts = {}) {
    return imgUrl(publicId, { w: opts.w || 420, version: opts.version });
  }
  function rawUrl(publicId, version) {
    const { cloudName } = config();
    const v = version ? `v${version}/` : "";
    return `https://res.cloudinary.com/${cloudName}/raw/upload/${v}${publicId}`;
  }

  // ---- Social links: saaf-saaf policy ----
  //  YouTube    -> inline lite-embed (thumbnail, click par video chalti hai)
  //  Instagram  -> click par official /embed/ iframe + bahar ka link
  //  Facebook   -> click par plugins iframe + bahar ka link
  //  Reels      -> Cloudinary par NAHIN; YouTube (Shorts) par daal kar link yahan
  function parseSocialLink(url) {
    url = (url || "").trim();
    let m;
    if ((m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*?v=|shorts\/|embed\/|live\/))([\w-]{6,})/))) {
      return {
        platform: "youtube", label: "YouTube", id: m[1], url,
        embed: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1`,
        thumb: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`,
      };
    }
    if ((m = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([\w-]+)/))) {
      return {
        platform: "instagram", label: "Instagram", id: m[1], url,
        embed: `https://www.instagram.com/p/${m[1]}/embed/`,
      };
    }
    if (/facebook\.com|fb\.watch/.test(url)) {
      const isVideo = /\/videos?\/|fb\.watch|\/watch\//.test(url);
      const plugin = isVideo ? "video.php" : "post.php";
      return {
        platform: "facebook", label: "Facebook", url,
        embed: `https://www.facebook.com/plugins/${plugin}?href=${encodeURIComponent(url)}&width=500&show_text=true`,
      };
    }
    if (url) return { platform: "link", label: "Link", url };
    return null;
  }

  function fmtSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MB";
    return Math.round(bytes / 1024) + " KB";
  }

  return {
    FOLDER, TAG, MAX_VIDEO_MB,
    config, isConfigured, compressImage, upload,
    listGallery, imgUrl, thumbUrl, rawUrl,
    parseSocialLink, fmtSize,
  };
})();
