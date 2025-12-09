// Removed unused React import
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/models/dom";
// Import plugins
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/lists";
import "tinymce/plugins/preview";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/code";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/media";
import "tinymce/plugins/table";
import "tinymce/plugins/template";

import {
  parseHtmlToMarkdown,
  renderMarkdownToHtml,
} from "./plugins/markdown-utils";

export const defaultPlugins = [
  "advlist",
  "autolink",
  "link",
  "image",
  "lists",
  "preview",
  "searchreplace",
  "wordcount",
  "code",
  "fullscreen",
  "media",
  "table",
  "prism_code_editor",
  "thmarkdown",
];

export const extraPlugins = ["template"];

const TINYMCE_VERSION = "6.7.0";
const CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/tinymce/${TINYMCE_VERSION}`;

export const darkThemeUrls = {
  skin: `${CDN_BASE}/skins/ui/oxide-dark/skin.min.css`,
  content: `${CDN_BASE}/skins/ui/oxide-dark/content.min.css`,
};

export const lightThemeUrls = {
  skin: `${CDN_BASE}/skins/ui/oxide/skin.min.css`,
  content: `${CDN_BASE}/skins/ui/oxide/content.min.css`,
};

const injectStyle = async (url: string, label: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${label}`);

  const cssText = await response.text();

  const style = document.createElement("style");
  style.dataset.mceTheme = "";
  style.dataset.mceStyleLabel = label;
  style.textContent = cssText;
  document.head.append(style);
};

export const loadEditorTheme = async () => {
  // Clean up existing styles
  for (const style of document.querySelectorAll("style[data-mce-theme]"))
    style.remove();

  const themeUrls = lightThemeUrls;

  try {
    await Promise.all([
      injectStyle(themeUrls.skin, "skin"),
      injectStyle(themeUrls.content, "content"),
    ]);

    // tinymce adds a margin of 10 to body, we need to remove it
    if (!document.querySelector("style[data-mce-body-margin-reset]")) {
      const style = document.createElement("style");
      style.dataset.mceBodyMarginReset = "";
      style.textContent = "body { margin: 0 !important; }";
      document.head.append(style);
    }
  } catch (error) {
    console.error("Error loading theme styles:", error);
    throw error;
  }
};

const defaultToolbar =
  "thmarkdown prism_code_editor  template undo redo | styles format   | bold italic underline  |  alignleft aligncenter   bullist numlist | link image media table ";

const commonMarkdownConfig = {
  renderer: renderMarkdownToHtml,
  parser: parseHtmlToMarkdown,
  fontSize: 14,
  language: "markdown",
};

const commonEditorConfig = {
  deprecation_warnings: false,
  branding: false,
  promotion: false,
  relative_urls: false,
  remove_script_host: false,
  convert_urls: false,
  images_file_types: "jpeg,jpg,jpe,jfi,jif,jfif,png,gif,bmp,webp,svg",
  table_default_styles: {},
  table_default_attributes: {},
  // Configure TinyMCE z-index to be above modals
  base_z_index: 10000,
};

export const getEditorConfig = () => {
  return {
    min_height: 500,
    menubar: "edit view insert format tools table",
    plugins: [...defaultPlugins, ...extraPlugins].join(" "),
    toolbar:
      defaultToolbar +
      "|searchreplace | preview fullscreen | removeformat  wordcount",
    toolbar_mode: "wrap" as const,
    skin: false,
    content_css: false,

    content_style: `
    @import url("https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css");
    html {
       font-size: 10px;
    } 
    body { 
      font-family: 'Ubuntu', sans-serif; 
      font-size: 1.6rem;
    }   

    `,
    image_uploadtab: true,
    ...commonEditorConfig,
    thmarkdown: { ...commonMarkdownConfig, isDark: false },
    prism_code_editor: { isDark: false },
  };
};
export const getInlineEditorConfig = () => ({
  plugins: defaultPlugins.join(" "),
  toolbar: defaultToolbar,
  inline: true,
  menubar: false,
  toolbar_mode: "wrap" as const,
  ...commonEditorConfig,
  thmarkdown: { ...commonMarkdownConfig, isDark: false },
  prism_code_editor: { isDark: false },
});

export const getMinimalEditorConfig = () => {
  return {
    menubar: false,
    branding: false,
    promotion: false,
    min_height: 200,
    plugins: ["lists"],
    toolbar:
      " bullist numlist format  | bold italic underline  |  alignleft aligncenter   ",
    skin: false,
    content_css: false,
    content_style: `
    html {
       font-size: 10px;
    } 
    @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap');
    body { 
      font-family: 'Ubuntu', sans-serif; 
      font-size: 1.6rem;
  
  }  
    `,
  };
};
