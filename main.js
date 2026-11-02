import { messages, resolveLanguage } from "./content.js";

const preferenceKey = "cox.site.language";
const agents = {
  codex: { name: "Codex", mark: "C_" },
  claude: { name: "Claude", mark: "✳" },
  cursor: { name: "Cursor", mark: "↗" },
};
let preference;
try {
  preference = localStorage.getItem(preferenceKey);
} catch {
  preference = null;
}
let language = resolveLanguage(preference, navigator.languages ?? [navigator.language]);
let selectedAgent = "codex";
let toastTimeout;

function updateAgent() {
  const agent = agents[selectedAgent];
  for (const element of document.querySelectorAll("[data-agent-name]")) {
    element.textContent = agent.name;
  }
  document.querySelector("[data-agent-avatar]").textContent = agent.mark;
  document.querySelector("[data-agent-message]").textContent =
    messages[language][`demo.${selectedAgent}`];
  for (const button of document.querySelectorAll("[data-provider]")) {
    button.setAttribute("aria-pressed", String(button.dataset.provider === selectedAgent));
  }
}

function applyLanguage() {
  const copy = messages[language];
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = copy["page.title"];
  document.querySelector('meta[name="description"]').content = copy["page.description"];
  document.querySelector('meta[property="og:title"]').content = copy["page.title"];
  document.querySelector('meta[property="og:description"]').content = copy["page.description"];
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = copy[element.dataset.i18n];
  }
  for (const element of document.querySelectorAll("[data-i18n-aria]")) {
    element.setAttribute("aria-label", copy[element.dataset.i18nAria]);
  }
  const toggle = document.querySelector("[data-language-toggle]");
  toggle.textContent = language === "zh" ? "EN ↗" : "中文 ↗";
  toggle.setAttribute("aria-label", language === "zh" ? "Switch to English" : "切换为简体中文");
  updateAgent();
}

document.querySelector("[data-language-toggle]").addEventListener("click", () => {
  language = language === "zh" ? "en" : "zh";
  applyLanguage();
  try {
    localStorage.setItem(preferenceKey, language);
  } catch {
    return;
  }
});

for (const button of document.querySelectorAll("[data-provider]")) {
  button.addEventListener("click", () => {
    if (!Object.hasOwn(agents, button.dataset.provider)) return;
    selectedAgent = button.dataset.provider;
    updateAgent();
  });
}

for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    const toast = document.querySelector("[data-toast]");
    let key = "copy.success";
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
    } catch {
      key = "copy.failure";
    }
    clearTimeout(toastTimeout);
    toast.textContent = messages[language][key];
    toast.classList.add("visible");
    toastTimeout = setTimeout(() => toast.classList.remove("visible"), 3500);
  });
}

applyLanguage();
