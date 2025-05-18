const usersToFetch = ["VooDoo", "Testuser123"];
const username = "VooDoo";

const token = `Bearer ${localStorage.getItem("token")}`;
const user = JSON.parse(localStorage.getItem("user"));
const isAdmin = user?.isAdmin;

const apiUrl = `https://v2.api.noroff.dev/blog/posts/${username}`;

const postsContainer = document.getElementById("posts-container");
const adminSection = document.getElementById("admin-tools");

if (token && adminSection) {
  adminSection.style.display = "block";

  const createBtn = document.createElement("a");
  createBtn.href = "create.html";
  createBtn.className = "btn-main";
  createBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Create New Post`;
  adminSection.append(createBtn);
}

// edit-delete
document.addEventListener("click", async (e) => {
  const postId = e.target.dataset.id;
  if (!postId) return;

  if (e.target.classList.contains("delete-btn")) {
    const confirmDelete = confirm("Are you sure?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${apiUrl}/${postId}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error("Failed to delete post");
      alert("Post deleted");
      getPosts();
      loadCarouselPosts();
      loadNewestPosts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  if (e.target.classList.contains("edit-btn")) {
    window.location.href = `edit.html?id=${postId}`;
  }
});

// admin posts
async function getPosts() {
  try {
    const response = await fetch(apiUrl);
    const result = await response.json();
    const posts = result.data;

    postsContainer.innerHTML = "";

    posts.forEach((post) => {
      const isOwner = post.author?.name === user?.name;

      const postElement = document.createElement("div");
      postElement.classList.add("post");

      postElement.innerHTML = `
        <h2>${post.title}</h2>
        <p>${getPostPreview(post.body)}</p>
        <p>By: ${post.author.name}</p>
        ${
          isAdmin || isOwner
            ? `<button class="edit-btn" data-id="${post.id}">Edit</button>
               <button class="delete-btn" data-id="${post.id}">Delete</button>`
            : ""
        }
        <hr/>
      `;

      postsContainer.appendChild(postElement);
    });
  } catch (err) {
    console.error("getPosts failed:", err);
  }
}

// caro
async function loadCarouselPosts() {
  const carouselTrack = document.querySelector(".carousel-track");
  const indicatorsContainer = document.querySelector(".carousel-indicators");
  if (!carouselTrack || !indicatorsContainer) return;

  try {
    let allCarouselPosts = [];

    for (const username of usersToFetch) {
      const res = await fetch(
        `https://v2.api.noroff.dev/blog/posts/${username}?_tag=carousel`
      );
      if (!res.ok) continue;
      const { data } = await res.json();
      allCarouselPosts.push(...data);
    }

    carouselTrack.innerHTML = "";
    indicatorsContainer.innerHTML = "";

    allCarouselPosts.forEach((post) => {
      const card = document.createElement("div");
      card.classList.add("visited-card");

      card.innerHTML = `
        <img src="${post.media?.url || "https://via.placeholder.com/300"}"
             alt="${post.media?.alt || post.title}" />
        <div class="visited-card-content">
          <h3 class="card-title">${post.title}</h3>
        </div>
      `;

      card.onclick = () => {
        window.location.href = `single-post.html?id=${post.id}`;
      };

      carouselTrack.appendChild(card);
    });

    setupCarousel(allCarouselPosts.length);
  } catch (err) {
    console.error("Carousel load failed:", err);
  }
}

// ¨text post
function getPostPreview(html, maxLength = 150) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

//    caro
function setupCarousel(totalCards) {
  const track = document.querySelector(".carousel-track");
  const cards = document.querySelectorAll(".visited-card");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const indicatorsContainer = document.querySelector(".carousel-indicators");

  const cardsPerPage = 3;
  const totalPages = Math.ceil(totalCards / cardsPerPage);
  let currentPage = 0;

  function scrollToPage(page) {
    const cardWidth = cards[0].offsetWidth + 20;
    const scrollAmount = cardWidth * cardsPerPage * page;
    track.scrollTo({ left: scrollAmount, behavior: "smooth" });
    currentPage = page;
    updateDots(currentPage);
  }

  function updateDots(index) {
    const dots = document.querySelectorAll(".carousel-indicators .indicator");
    dots.forEach((dot) => dot.classList.remove("active"));
    if (dots[index]) dots[index].classList.add("active");
  }

  indicatorsContainer.innerHTML = "";
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement("button");
    dot.classList.add("indicator");
    if (i === 0) dot.classList.add("active");
    dot.dataset.page = i;
    dot.addEventListener("click", () => scrollToPage(i));
    indicatorsContainer.appendChild(dot);
  }

  prevBtn.onclick = () => {
    if (currentPage > 0) scrollToPage(currentPage - 1);
  };

  nextBtn.onclick = () => {
    if (currentPage < totalPages - 1) scrollToPage(currentPage + 1);
  };
}

//               new posts
let allNewestPosts = [];
let currentPostIndex = 0;
const postsPerPage = 5;

async function loadNewestPosts() {
  const newestSection = document.getElementById("newest-posts-section");
  const showMoreBtn = document.getElementById("show-more-btn");
  if (!newestSection || !showMoreBtn) return;

  try {
    let allPosts = [];

    for (const username of usersToFetch) {
      const res = await fetch(
        `https://v2.api.noroff.dev/blog/posts/${username}`
      );
      if (!res.ok) continue;
      const { data } = await res.json();
      allPosts.push(...data);
    }

    allNewestPosts = allPosts
      .filter((post) => !post.tags.includes("carousel"))
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    currentPostIndex = 0;
    newestSection.innerHTML = "";

    renderMorePosts();

    if (allNewestPosts.length > postsPerPage) {
      showMoreBtn.style.display = "block";
    } else {
      showMoreBtn.style.display = "none";
    }
  } catch (err) {
    console.error("Newest posts load failed:", err);
    newestSection.innerHTML = `<p style="color:red;">Failed to load newest posts.</p>`;
  }
}
function renderMorePosts() {
  const newestSection = document.getElementById("newest-posts-section");
  const end = currentPostIndex + postsPerPage;
  const postsToRender = allNewestPosts.slice(currentPostIndex, end);

  postsToRender.forEach((post) => {
    const card = document.createElement("div");
    card.classList.add("newest-post");

    const tagHTML = post.tags
      .map((tag) => {
        const safeClass = tag.toLowerCase().replace(/\s+/g, "-");
        return `<span class="tag tag-${safeClass}">${tag}</span>`;
      })
      .join(" ");

    card.innerHTML = `
      <img src="${post.media?.url || "https://via.placeholder.com/400"}"
           alt="${post.media?.alt || post.title}" />
      <div class="post-body">
        <div class="tags">${tagHTML}</div>
        <h3>${post.title}</h3>
        <p class="author">By ${post.author?.name || "Unknown"}</p>
        <p>${getPostPreview(post.body || "")}</p>
        <a class="read-btn" href="single-post.html?id=${post.id}">
          Go to article
        </a>
      </div>
    `;

    newestSection.appendChild(card);
  });

  currentPostIndex += postsPerPage;

  const showMoreBtn = document.getElementById("show-more-btn");
  if (currentPostIndex >= allNewestPosts.length) {
    showMoreBtn.style.display = "none";
  }
}
document
  .getElementById("show-more-btn")
  .addEventListener("click", renderMorePosts);

loadCarouselPosts();
loadNewestPosts();
checkUserStatus?.();
