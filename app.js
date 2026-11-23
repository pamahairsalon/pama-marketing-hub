const search = document.querySelector("#search");
const cards = [...document.querySelectorAll(".card")];
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const empty = document.querySelector("#empty");
let selected = "全部";

function updateCards() {
  const query = (search?.value || "").trim().toLowerCase();
  let count = 0;
  cards.forEach(card => {
    const categoryMatch = selected === "全部" || card.dataset.cat === selected;
    const textMatch = !query || (card.dataset.terms + " " + card.innerText).toLowerCase().includes(query);
    card.hidden = !(categoryMatch && textMatch);
    if (!card.hidden) count++;
  });
  if (empty) empty.hidden = count > 0;
}
search?.addEventListener("input", updateCards);
search?.addEventListener("keydown", e => { if (e.key === "Enter") document.querySelector("#library")?.scrollIntoView({behavior:"smooth"}); });
filterButtons.forEach(button => button.addEventListener("click", () => {
  selected = button.dataset.filter;
  filterButtons.forEach(item => item.classList.toggle("active", item === button));
  updateCards();
}));

const toast = document.querySelector("#toast");
let toastTimer;
document.querySelectorAll("[data-copy]").forEach(button => button.addEventListener("click", async () => {
  const content = button.dataset.copy || "";
  let ok = false;
  try { await navigator.clipboard.writeText(content); ok = true; }
  catch {
    const field = document.createElement("textarea");
    field.value = content; document.body.appendChild(field); field.select();
    ok = document.execCommand("copy"); field.remove();
  }
  toast.textContent = ok ? "文案已複製，可以貼到社群平台囉！" : "複製未成功，請手動選取文字。";
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}));

const menuButton = document.querySelector(".menu");
menuButton?.addEventListener("click", () => {
  const nav = document.querySelector(".nav");
  const opened = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!opened));
  nav.classList.toggle("mobile-open", !opened);
});