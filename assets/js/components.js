// ============================================================
// COMPONENTS — small, composable HTML-returning functions.
// Pages import data.js + components.js + chrome.js and assemble.
// ============================================================

const Components = {
  navLink(href, label, active, key) {
    const isActive = active === key;
    return `<a href="${href}"${isActive ? ' class="nav-active"' : ""}>${label}</a>`;
  },

  bookCard(book) {
    return `
    <a href="../books/reader.html?id=${book.id}" class="book-card">
      <div class="book-cover">
        <img src="${book.cover}" alt="${book.title} cover" loading="lazy"
             onerror="this.parentElement.classList.add('book-cover--fallback'); this.remove();">
        <div class="book-cover-spine"></div>
      </div>
      <div class="book-meta">
        <div class="book-title-ur">${book.titleUrdu}</div>
        <div class="book-title-en">${book.title} · ${book.year}</div>
      </div>
    </a>`;
  },

  poemCard(poem) {
    return `
    <article class="poem-card">
      <div class="poem-card-head">
        <span class="pill">${poem.book}</span>
        <span class="muted" style="font-size:13px;">${poem.title}</span>
      </div>
      <p class="poem-text urdu">${poem.textUrdu.replace(/\n/g, "<br>")}</p>
      <p class="poem-text-latin muted">${poem.text.replace(/\n/g, "<br>")}</p>
    </article>`;
  },

  poetCard(poet) {
    return `
    <div class="card">
      <div class="h-urdu" style="font-size:26px; margin-bottom:6px;">${poet.nameUrdu}</div>
      <div style="font-family: var(--font-ui); color: var(--maroon); font-weight:600; margin-bottom:4px;">
        ${poet.name} <span class="muted" style="font-weight:400;">· ${poet.years}</span>
      </div>
      <p class="muted" style="font-size:14px;">${poet.intro}</p>
    </div>`;
  },

  dargahCard(d) {
    return `
    <div class="card">
      <h3 style="font-size:20px; margin-bottom:6px;">${d.name}</h3>
      <div class="pill" style="margin-bottom:10px;">${d.distance}</div>
      <p class="muted" style="font-size:14px;">${d.note}</p>
    </div>`;
  },

  simpleListCard(title, items, renderItem) {
    return `
    <div class="card">
      <h3 style="font-size:18px; margin-bottom:14px; color: var(--maroon);">${title}</h3>
      <ul class="clean-list">
        ${items.map(renderItem).join("")}
      </ul>
    </div>`;
  },

  emergencyRow(item) {
    return `<li><span>${item.label}</span><strong>${item.number}</strong></li>`;
  },

  plainRow(item, sub) {
    return `<li><span>${item.name}</span>${sub && item[sub] ? `<span class="muted">${item[sub]}</span>` : ""}</li>`;
  },

  shagirdPost(post) {
    const bodyHTML = {
      text: `<p class="post-text">${post.content}</p>`,
      image: `<img src="${post.content}" class="post-image" alt="Shagird ki tasveer" loading="lazy">`,
      link: `<a href="${post.content}" target="_blank" rel="noopener" class="post-link">🔗 ${post.content}</a>`,
      reel: `<div class="post-link">🎬 <a href="${post.content}" target="_blank" rel="noopener">Reel dekhein</a></div>`,
    }[post.type] || `<p class="post-text">${post.content}</p>`;

    return `
    <article class="shagird-post">
      <div class="post-head">
        <div class="post-avatar">${post.name.charAt(0)}</div>
        <div>
          <div class="post-name">${post.name}</div>
          <div class="post-time muted">${new Date(post.time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
        </div>
      </div>
      ${bodyHTML}
    </article>`;
  },
};
