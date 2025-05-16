const postContainer = document.getElementById("post-content");
const bannerImg = document.getElementById("post-banner-img");
const breadcrumbs = document.getElementById("post-breadcrumbs");
const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const apiUrl = `https://v2.api.noroff.dev/blog/posts/VooDoo/${postId}`;

postContainer.innerHTML = `<p><i class='fa-solid fa-hourglass-start'></i> Loading post...</p>`;

async function loadPost() {
  if (!postId) {
    postContainer.innerHTML = "<p>No post ID provided in the URL.</p>";
    return;
  }

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Post not found");

    const { data: post } = await res.json();
    document.title = post.title || "Blog Post";

    if (bannerImg) {
      bannerImg.src = post.media?.url || "https://via.placeholder.com/1200x500";
      bannerImg.alt = post.media?.alt || `Image for ${post.title}`;
    }

    if (breadcrumbs) {
      breadcrumbs.innerHTML = `
        <a href="index.html">Main page</a> &gt;
        <span>${post.title}</span>
      `;
    }

    const recipeTag = post.tags.find((tag) => tag.startsWith("recipe-"));
    const recipe = recipeTag ? recipeTag.replace("recipe-", "") : "";

    postContainer.innerHTML = `
      <article class="post-page" role="article">
        <h1>${post.title}</h1>
        <div class="post-author">
          <img src="${
            post.author.avatar?.url || "https://via.placeholder.com/40"
          }" alt="${
      post.author.avatar?.alt || "Author avatar"
    }" class="avatar" />
          <p>By <strong>${
            post.author.name || "Unknown author"
          }</strong> • ${new Date(post.created).toLocaleDateString("en-GB")}</p>
        </div>
        <div class="post-body-text">
          ${post.body || "<p>No content available.</p>"}
        </div>
        ${
          recipe
            ? `<div class="post-recipe"><h2>Recipe</h2><p>${recipe}</p></div>`
            : ""
        }
        <div class="post-footer">
          <span><i class="fa-regular fa-comment"></i> ${Math.floor(
            Math.random() * 100
          )} comments</span>
          <span><i class="fa-solid fa-star"></i> ${(
            Math.random() * 2 +
            3
          ).toFixed(1)}</span>
          <span><i class="fa-solid fa-share"></i> <button class="copy-link" aria-label="Copy link"><i class="fa-solid fa-link"></i> Copy Link</button></span>
        </div>
      </article>
    `;

    displayComments(postId);
    handleDeleteComment(postId);
  } catch (err) {
    console.error("Error loading post:", err);
    postContainer.innerHTML =
      "<p style='color:red;'>Failed to load this post. Please try again later.</p>";
  }
}

loadPost();

document.addEventListener("click", (e) => {
  const copyBtn = e.target.closest(".copy-link");
  if (copyBtn) {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      copyBtn.innerHTML = '<i class="fa-solid fa-link"></i> Link Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fa-solid fa-link"></i> Copy Link';
      }, 2000);
    });
  }
});

document
  .getElementById("comment-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("comment-name").value.trim();
    const content = document.getElementById("comment-content").value.trim();

    if (!name || !content || !postId) return;

    const comment = {
      id: Date.now(),
      name,
      content,
      date: new Date().toISOString(),
    };

    const comments = JSON.parse(localStorage.getItem("comments") || "{}");
    if (!comments[postId]) comments[postId] = [];
    comments[postId].push(comment);
    localStorage.setItem("comments", JSON.stringify(comments));

    this.reset();
    displayComments(postId);
  });

function displayComments(postId) {
  const commentsList = document.getElementById("comments-list");
  commentsList.innerHTML = "";

  const comments =
    JSON.parse(localStorage.getItem("comments") || "{}")[postId] || [];

  comments.forEach((comment) => {
    const div = document.createElement("div");
    div.classList.add("comment");

    div.innerHTML = `
      <button class="delete-comment" data-id="${comment.id}">Delete</button>
      <p><strong>${comment.name}</strong> (${new Date(
      comment.date
    ).toLocaleDateString()}):</p>
      <p>${comment.content}</p>
    `;

    commentsList.appendChild(div);
  });
}

function handleDeleteComment(postId) {
  const commentsList = document.getElementById("comments-list");

  commentsList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-comment")) {
      const commentId = e.target.dataset.id;
      const allComments = JSON.parse(localStorage.getItem("comments") || "{}");

      if (!allComments[postId]) return;

      const confirmDelete = confirm(
        "Are you sure you want to delete this comment?"
      );
      if (!confirmDelete) return;

      allComments[postId] = allComments[postId].filter(
        (c) => c.id != commentId
      );
      localStorage.setItem("comments", JSON.stringify(allComments));
      displayComments(postId);
    }
  });
}
