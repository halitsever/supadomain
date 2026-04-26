export function useTheme() {
  const isDark = useState("theme-dark", () => false);

  onMounted(() => {
    const stored = localStorage.getItem("sd-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : prefersDark;
    isDark.value = dark;
    document.documentElement.classList.toggle("dark", dark);
  });

  function toggle() {
    isDark.value = !isDark.value;
    document.documentElement.classList.toggle("dark", isDark.value);
    localStorage.setItem("sd-theme", isDark.value ? "dark" : "light");
  }

  return { isDark, toggle };
}
