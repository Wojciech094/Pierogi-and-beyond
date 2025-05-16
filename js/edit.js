const params = new URLSearchParams(window.location.search);
const postId = params.get("id");
const token = `Bearer ${localStorage.getItem("token")}`;
const username = JSON.parse(localStorage.getItem("user"))?.name;
const apiUrl = `https://v2.api.noroff.dev/blog/posts/${username}/${postId}`;

const titleInput = document.getElementById("title");
const bodyInput = document.getElementById("body");
const mediaUrlInput = document.getElementById("media-url");
const mediaAltInput = document.getElementById("media-alt");
const tagsInput = document.getElementById("tags");
const message = document.getElementById("form-message");
const deleteBtn = document.getElementById("delete-post");
const form = document.getElementById("edit-post-form");

//  text  edit
function convertHTMLToText(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.innerText.trim();
}

// text save
function convertTextToHTML(text) {
  return text
    .trim()
    .split("\n\n")
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

//  not login
if (!localStorage.getItem("token")) {
  window.location.href = "../account/login.html";
}

//    post down
async function loadPostForEdit() {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Post not found");

    const { data } = await res.json();

    titleInput.value = data.title || "";
    bodyInput.value = convertHTMLToText(data.body || "");
    mediaUrlInput.value = data.media?.url || "";
    mediaAltInput.value = data.media?.alt || "";
    tagsInput.value = data.tags.join(", ");

    // checkboxy 
    data.tags.forEach((tag) => {
      const checkbox = document.querySelector(
        `input[name="post-tags"][value="${tag}"]`
      );
      if (checkbox) checkbox.checked = true;
    });
  } catch (err) {
    message.textContent = " Failed to load post.";
    console.error("Load post error:", err);
  }
}

// save change
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 
  const manualTags = tagsInput.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const checkedBoxes = document.querySelectorAll(
    'input[name="post-tags"]:checked'
  );
  const checkboxTags = Array.from(checkedBoxes).map((cb) => cb.value);

  let tags = [...manualTags, ...checkboxTags];
  if (tags.length === 0) tags = ["general"];

  const updatedPost = {
    title: titleInput.value.trim(),
    body: convertTextToHTML(bodyInput.value.trim()),
    tags: tags.map((t) => t.toLowerCase()),
  };

  if (mediaUrlInput.value.trim()) {
    updatedPost.media = {
      url: mediaUrlInput.value.trim(),
      alt: mediaAltInput.value.trim() || "Updated image",
    };
  }

  try {
    const res = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(updatedPost),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.errors?.[0]?.message || "Update failed");
    }

    message.textContent = " Post updated successfully!";
  } catch (err) {
    message.textContent = ` Error: ${err.message}`;
    console.error("Update error:", err);
  }
});

// delete post
deleteBtn.addEventListener("click", async () => {
  const confirmDelete = confirm("Are you sure you want to delete this post?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(apiUrl, {
      method: "DELETE",
      headers: { Authorization: token },
    });

    if (!res.ok) throw new Error("Delete failed");

    alert(" Post deleted.");
    window.location.href = "./index.html";
  } catch (err) {
    message.textContent = " Failed to delete post.";
    console.error("Delete error:", err);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const mediaUrlInput = document.getElementById("media-url");
  const previewWrapper = document.getElementById("image-preview");
  const previewImg = document.getElementById("preview-img");

  if (mediaUrlInput && previewWrapper && previewImg) {
    mediaUrlInput.addEventListener("input", () => {
      const url = mediaUrlInput.value.trim();
      if (url) {
        previewImg.src = url;
        previewWrapper.style.display = "block";
      } else {
        previewWrapper.style.display = "none";
        previewImg.src = "";
      }
    });
  }
});

loadPostForEdit();
