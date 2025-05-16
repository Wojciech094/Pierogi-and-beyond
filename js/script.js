
const username = "VooDoo";
const token = `Bearer ${localStorage.getItem("token")}`;
const apiUrl = `https://v2.api.noroff.dev/blog/posts/${username}`;
const user = JSON.parse(localStorage.getItem("user"));
const isAdmin = user?.isAdmin;

// DOM
const postsContainer = document.getElementById("posts-container");
const form = document.getElementById("create-post-form");
const message = document.getElementById("form-message");
const adminSection = document.getElementById("admin-tools");
const toggleContainer = document.getElementById("admin-toggle-container");
const toggleButton = document.getElementById("toggle-admin-tools");
const togglePostsToolsBtn = document.getElementById("toggle-posts-tools");

//            create post btn"
if (isAdmin && adminSection) {
  adminSection.style.display = "block";

  const createBtn = document.createElement("a");
  createBtn.href = "create.html";
  createBtn.className = "btn-main";
  createBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Create New Post`;
  adminSection.prepend(createBtn);
}

//  btn 

document.addEventListener("click", async (e) => {
  const postId = e.target.dataset.id;
  if (!postId) return;

  // delete
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

  // edit
  if (e.target.classList.contains("edit-btn")) {
    window.location.href = `edit.html?id=${postId}`;
    return;
  }
});

// admin post
async function getPosts() {
  try {
    const response = await fetch(apiUrl);
    const result = await response.json();
    const posts = result.data;

    postsContainer.innerHTML = "";

    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");

      postElement.innerHTML = `
        <h2>${post.title}</h2>
        <img src="${post.media?.url || "https://via.placeholder.com/300"}" 
             alt="${
               post.media?.alt || "Post image"
             }" width="300" height="200" loading="lazy" />
        <p>${getPostPreview(post.body)}</p>
        <small>Tags: ${post.tags.join(", ")}</small><br/>
        ${
          isAdmin || user?.name === post.author.name
            ? `<button class="edit-btn" data-id="${post.id}"><i class="fa-solid fa-pencil"></i> Edit</button>
               <button class="delete-btn" data-id="${post.id}"><i class="fa-solid fa-trash"></i> Delete</button>`
            : ""
        }
        <hr/>
      `;
      postsContainer.appendChild(postElement);
    });
  } catch (err) {
    console.error("Carousel load failed:", err);
  }
}

//     most visited post"
async function loadCarouselPosts() {
  const carouselTrack = document.querySelector(".carousel-track");
  const indicatorsContainer = document.querySelector(".carousel-indicators");
  if (!carouselTrack || !indicatorsContainer) return;

  try {
    const res = await fetch(`${apiUrl}?_tag=carousel`);
    const { data: posts } = await res.json();

    carouselTrack.innerHTML = "";
    indicatorsContainer.innerHTML = "";

    posts.forEach((post) => {
      const card = document.createElement("div");
      card.classList.add("visited-card");

      card.innerHTML = `
        <img src="${
          post.media?.url || "https://via.placeholder.com/300"
        }" alt="${
        post.media?.alt || post.title
      }" width="400" height="300" loading="lazy" />
        <div class="visited-card-content">
          <h3 class="card-title">${post.title}</h3>
        </div>
      `;

      card.onclick = () => {
        window.location.href = `single-post.html?id=${post.id}`;
      };

      carouselTrack.appendChild(card);
    });

    setupCarousel(posts.length);
  } catch (err) {
    console.error("Carousel load failed:", err);
  }
}

//          post text short
function getPostPreview(html, maxLength = 150) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

//     caro
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

// load newest posts"
async function loadNewestPosts() {
  const newestSection = document.getElementById("newest-posts-section");
  if (!newestSection) return;

  try {
    const res = await fetch(apiUrl);
    const result = await res.json();
    const posts = result.data;

    newestSection.innerHTML = "";

    posts
      .filter((post) => !post.tags.includes("carousel"))
      .forEach((post) => {
        const card = document.createElement("div");
        card.classList.add("newest-post");

        const tagHTML = post.tags
          .map((tag) => {
            const safeClass = tag.toLowerCase().replace(/\s+/g, "-");
            return `<span class="tag tag-${safeClass}">${tag}</span>`;
          })
          .join(" ");

        card.innerHTML = `
          <img src="${
            post.media?.url || "https://via.placeholder.com/400"
          }" alt="${
          post.media?.alt || post.title
        }" width="600" height="400" loading="lazy" />
          <div class="post-body">
            <div class="tags">${tagHTML}</div>
            <h3>${post.title}</h3>
            <p class="author">By ${post.author?.name || "Unknown"}</p>
            <p>${getPostPreview(post.body)}</p>
            <a class="read-btn" href="single-post.html?id=${
              post.id
            }">Go to article</a>
          </div>
        `;

        newestSection.appendChild(card);
      });
  } catch (err) {
    console.error("Newest posts load failed:", err);

    if (newestSection) {
      newestSection.innerHTML = `<p style="color:red;">Failed to load newest posts. Please try again later.</p>`;
    }
  }
}

loadCarouselPosts();
loadNewestPosts();
checkUserStatus?.();
