// ================================================================
//  📰 MEDIUM RSS AUTO-LOADER
// ================================================================

const MEDIUM_USERNAME = "rownokjamanrahul";
const API_KEY = "4syjehomecpp65wtzipk15w220nxixo8n6jukkud";
const RSS_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent("https://medium.com/feed/@" + MEDIUM_USERNAME)}&api_key=${API_KEY}&count=20`;

// ── SVG icons ─────────────────────────────────────────────────
const HEART_SVG = `<svg style="enable-background:new 0 0 24 24;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M22.2,4.1c2.7,2.7,2.4,6.9-0.4,9.5l-8.4,7.9c-0.8,0.7-2.1,0.7-2.9,0l-8.4-7.9c-2.7-2.6-3-6.8-0.4-9.5C4.6,1.4,9.2,1.3,12,4C14.8,1.3,19.4,1.4,22.2,4.1z"/></g></svg>`;
const EYE_SVG  = `<svg height="512px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g><path d="M447.1,256.2C401.8,204,339.2,144,256,144c-33.6,0-64.4,9.5-96.9,29.8C131.7,191,103.6,215.2,65,255l-1,1l6.7,6.9C125.8,319.3,173.4,368,256,368c36.5,0,71.9-11.9,108.2-36.4c30.9-20.9,57.2-47.4,78.3-68.8l5.5-5.5L447.1,256.2zM256,336c-44.1,0-80-35.9-80-80c0-44.1,35.9-80,80-80c44.1,0,80,35.9,80,80C336,300.1,300.1,336,256,336z"/><path d="M250.4,226.8c0-6.9,2-13.4,5.5-18.8c-26.5,0-47.9,21.6-47.9,48.2c0,26.6,21.5,48.1,47.9,48.1s48-21.5,48-48.1v0c-5.4,3.5-11.9,5.5-18.8,5.5C266,261.6,250.4,246,250.4,226.8z"/></g></svg>`;

// ── Helpers ───────────────────────────────────────────────────
function calcReadTime(content) {
    const words = (content || '').replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
    return Math.ceil(words / 200) + " min to read";
}

function getThumbnail(item) {
    // rss2json এর thumbnail field
    if (item.thumbnail && item.thumbnail.startsWith('http')) return item.thumbnail;
    // content এর ভেতর থেকে প্রথম img
    const src = (item.content || item.description || '').match(/<img[^>]+src=["']([^"']+)["']/);
    if (src) return src[1];
    // enclosure field (podcast/media)
    if (item.enclosure && item.enclosure.link) return item.enclosure.link;
    return '../blogs/m.png';
}

function getPublication(item) {
    if (item.categories && item.categories.length > 0) return item.categories[0];
    return 'None';
}

// ── Build one card ────────────────────────────────────────────
function buildCard(item) {
    const title    = item.title || 'Untitled';
    const url      = item.link  || '#';
    const readTime = calcReadTime(item.content || item.description || '');
    const pub      = getPublication(item);
    const thumb    = getThumbnail(item);
    const likes    = Math.floor(Math.random() * 150) + 50;
    const views    = Math.floor(Math.random() * 400) + 100;

    return `
        <div class="post-card box" onclick="window.open('${url}','_blank')" style="cursor:pointer;">
            <div class="avatar"><img src="../blogs/m.png" alt="medium"></div>
            <a class="title" href="${url}" target="_blank" onclick="event.stopPropagation()">${title}</a>
            <div class="seting">
                <div class="datetime"> ${readTime}</div>
                <div class="datetime1"> Publication : ${pub}</div>
            </div>
            <div class="image-preview">
                <img src="${thumb}" alt="${title}"
                     onerror="this.src='../blogs/m.png';this.style.objectFit='contain';this.style.padding='30px'">
            </div>
            <div class="comment-like">
                <span>${HEART_SVG} ${likes}</span>
                <span class="like">${EYE_SVG} ${views}</span>
                <span>More</span>
            </div>
        </div>`;
}

// ── Main loader ───────────────────────────────────────────────
async function loadMediumBlogs() {
    const container = document.getElementById('blog-container');
    const loadingEl = document.getElementById('blog-loading');
    const errorEl   = document.getElementById('blog-error');

    // safety check — এই elements না থাকলে কিছু করব না
    if (!container || !loadingEl || !errorEl) {
        console.error('❌ blog-container / blog-loading / blog-error div পাওয়া যায়নি');
        return;
    }

    try {
        console.log('⏳ Fetching Medium blogs...');
        const res  = await fetch(RSS_URL);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log('📦 API response:', data.status, 'items:', data.items?.length);

        if (data.status !== 'ok') throw new Error('API status: ' + data.status);
        if (!data.items || data.items.length === 0) throw new Error('কোনো blog পাওয়া যায়নি');

        // Cards inject করো
        loadingEl.style.display = 'none';
        container.innerHTML = data.items.map(buildCard).join('');

        // Fade-in animation
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { e.target.style.opacity = e.isIntersecting ? 1 : 0; });
        }, { root: null, threshold: 0 });
        container.querySelectorAll('.box').forEach(b => { b.style.opacity = 0; obs.observe(b); });

        console.log('✅ Loaded ' + data.items.length + ' blogs from Medium');

    } catch (err) {
        console.error('❌ Failed:', err.message);
        loadingEl.style.display = 'none';
        errorEl.style.display   = 'block';
        // error message এ কারণ দেখাও
        errorEl.innerHTML = `⚠️ Could not load blogs (${err.message}). <a href="https://medium.com/@${MEDIUM_USERNAME}" target="_blank" style="color:#9DB2BF;">Visit Medium directly →</a>`;
    }
}

loadMediumBlogs();

// ── Counter animation ─────────────────────────────────────────
const boxes = document.querySelectorAll('.box');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            document.querySelectorAll('.num').forEach((el) => {
                let start = 0;
                const end = parseInt(el.getAttribute('data-val'));
                if (!end) return;
                const dur = Math.floor(4000 / end);
                const counter = setInterval(() => {
                    start++;
                    el.textContent = start;
                    if (start === end) clearInterval(counter);
                }, dur);
            });
        } else {
            entry.target.style.opacity = 0;
        }
    });
}, { root: null, threshold: 0 });
boxes.forEach(b => observer.observe(b));
