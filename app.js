const searchInput = document.querySelector("#contentSearch");
const contentCards = [...document.querySelectorAll(".content-card, .care-card")];
const postFilters = [...document.querySelectorAll("[data-filter]")];
const careFilters = [...document.querySelectorAll("[data-care-filter]")];

let postCategory = "all";
let careCategory = "all";

function filterContent() {
  const query = (searchInput?.value || "").trim().toLocaleLowerCase();
  contentCards.forEach(card => {
    const category = card.dataset.category;
    const kind = card.dataset.kind;
    const categoryMatch = kind === "post"
      ? (postCategory === "all" || category === postCategory)
      : (careCategory === "all" || category === careCategory);
    const queryMatch = !query || (card.dataset.search + " " + card.innerText).toLocaleLowerCase().includes(query);
    card.hidden = !(categoryMatch && queryMatch);
  });
}

searchInput?.addEventListener("input", filterContent);
searchInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    const firstVisible = contentCards.find(card => !card.hidden);
    firstVisible?.scrollIntoView({behavior:"smooth", block:"center"});
  }
});

postFilters.forEach(button => button.addEventListener("click", () => {
  postCategory = button.dataset.filter;
  postFilters.forEach(item => item.classList.toggle("active", item === button));
  filterContent();
}));
careFilters.forEach(button => button.addEventListener("click", () => {
  careCategory = button.dataset.careFilter;
  careFilters.forEach(item => item.classList.toggle("active", item === button));
  filterContent();
}));

const toast = document.querySelector("#toast");
let toastTimer;
document.querySelectorAll("[data-copy]").forEach(button => button.addEventListener("click", async () => {
  const text = button.dataset.copy || "";
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    copied = document.execCommand("copy");
    helper.remove();
  }
  toast.textContent = copied ? "已複製，可以貼到社群或訊息中囉！" : "複製未成功，請手動選取文字。";
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}));

const menuButton = document.querySelector(".menu-toggle");
menuButton?.addEventListener("click", () => {
  const nav = document.querySelector("#mainNav");
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  nav?.classList.toggle("mobile-open", !expanded);
});
document.querySelectorAll("#mainNav a").forEach(link => link.addEventListener("click", () => {
  document.querySelector("#mainNav")?.classList.remove("mobile-open");
  menuButton?.setAttribute("aria-expanded", "false");
}));