const token = `Bearer ${localStorage.getItem("token")}`;
const user = JSON.parse(localStorage.getItem("user"));
const username = user?.name;
const apiUrl = `https://v2.api.noroff.dev/blog/posts/${username}`;
const container = document.getElementById("my-posts-container");

if (!token || !user) {
  window.location.href = "../account/login.html";
}

async function loadMyPosts() {
  try {
    const res = await fetch(apiUrl);
    const result = await res.json();
    const posts = result.data;

    container.innerHTML = "";

    posts.forEach((post) => {
      const div = document.createElement("div");
      div.classList.add("newest-post"); 

      div.innerHTML = `
          <img src="${
            post.media?.url || "https://placehold.co/600x400"
          }" alt="${post.media?.alt || post.title}" />
          <div class="post-body">
            <div class="tags">
              ${post.tags
                .map(
                  (tag) =>
                    `<span class="tag tag-${tag
                      .toLowerCase()
                      .replace(/\s+/g, "-")}">${tag}</span>`
                )
                .join(" ")}
            </div>
            <h3>${post.title}</h3>
            <p class="author">By ${post.author?.name || "Unknown"}</p>
            <p>${getPreview(post.body)}</p>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button class="edit-btn" data-id="${post.id}">
                <i class="fa-solid fa-pencil"></i> Edit
              </button>
              <button class="delete-btn" data-id="${post.id}">
                <i class="fa-solid fa-trash"></i> Delete
              </button>
            </div>
          </div>
        `;

      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading posts", err);
    container.innerHTML = "<p>Could not load your posts.</p>";
  }
}

function getPreview(html, maxLength = 150) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const text = temp.textContent || temp.innerText || "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}


document.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("edit-btn")) {
    window.location.href = `edit.html?id=${id}`;
    return;
  }

  if (e.target.classList.contains("delete-btn")) {
    if (!confirm("Delete this post?")) return;

    try {
      const res = await fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error("Delete failed");
      alert("Deleted!");
      loadMyPosts();
    } catch (err) {
      alert("Delete error");
    }
  }
});

loadMyPosts();
