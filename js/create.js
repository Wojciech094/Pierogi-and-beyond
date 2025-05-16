const token = `Bearer ${localStorage.getItem("token")}`;
const username = JSON.parse(localStorage.getItem("user"))?.name;
const apiUrl = `https://v2.api.noroff.dev/blog/posts/${username}`;
const form = document.getElementById("create-post-form");
const message = document.getElementById("form-message");

// 
function convertTextToHTML(text) {
  return text
    .trim()
    .split("\n\n") 
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const rawBody = document.getElementById("body").value.trim();
  const body = convertTextToHTML(rawBody); 
  const mediaUrl = document.getElementById("media-url").value.trim();
  const mediaAlt = document.getElementById("media-alt").value.trim();
  const recipe = document.getElementById("recipe")?.value.trim();

  // checkbox
  const isCarouselChecked = document.querySelector(
    'input[name="post-tags"][value="carousel"]'
  )?.checked;

  const checkedBoxes = document.querySelectorAll(
    'input[name="post-tags"]:checked'
  );
  const checkboxTags = Array.from(checkedBoxes)
    .map((cb) => cb.value)
    .filter((val) => val !== "carousel");

  const manualTags = document
    .getElementById("tags")
    .value.trim()
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  let tags = [...manualTags, ...checkboxTags];
  if (isCarouselChecked) tags.push("carousel");
  if (tags.length === 0) tags = ["general"];

  // 
  const fullBody = recipe
    ? `${body}<br><br><strong>Recipe:</strong><br>${recipe}`
    : body;

  const newPost = {
    title,
    body: fullBody,
    tags,
  };

  if (mediaUrl) {
    newPost.media = {
      url: mediaUrl,
      alt: mediaAlt || "Post image",
    };
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(newPost),
    });

    const result = await res.json();
    if (!res.ok)
      throw new Error(result.errors?.[0]?.message || "Failed to create post");

    message.textContent = "Post created successfully!";
    form.reset();
  } catch (err) {
    console.error("Error creating post:", err.message);
    message.textContent = ` Error: ${err.message}`;
  }
});
const mediaUrlInput = document.getElementById("media-url");
const previewWrapper = document.getElementById("image-preview");
const previewImg = document.getElementById("preview-img");

mediaUrlInput?.addEventListener("input", () => {
  const url = mediaUrlInput.value.trim();
  if (url) {
    previewImg.src = url;
    previewWrapper.style.display = "block";
  } else {
    previewWrapper.style.display = "none";
    previewImg.src = "";
  }
});