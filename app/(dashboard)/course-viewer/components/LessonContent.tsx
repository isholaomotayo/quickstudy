"use client";

import { forwardRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LessonContentProps {
  content: string;
  className?: string;
}

const LessonContent = forwardRef<HTMLDivElement, LessonContentProps>(
  ({ content, className }, ref) => {
    useEffect(() => {
      // Process iframes and videos after content is rendered
      const container = ref as React.RefObject<HTMLDivElement>;
      if (!container?.current) return;

      const iframes = container.current.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        // Set iframe attributes
        iframe.setAttribute("frameBorder", "0");
        iframe.style.border = "0";
        iframe.style.width = "100%";
        iframe.style.minHeight = "400px";
        iframe.style.height = "auto";
        iframe.style.maxWidth = "100%";

        // Wrap iframe in responsive container if not already wrapped
        if (!iframe.parentElement?.classList.contains("video-wrapper")) {
          const wrapper = document.createElement("div");
          wrapper.className = "video-wrapper";
          wrapper.style.position = "relative";
          wrapper.style.width = "100%";
          wrapper.style.paddingBottom = "56.25%"; // 16:9 aspect ratio
          wrapper.style.height = "0";
          wrapper.style.marginBottom = "20px";
          wrapper.style.borderRadius = "8px";
          wrapper.style.overflow = "hidden";

          iframe.parentElement?.insertBefore(wrapper, iframe);
          wrapper.appendChild(iframe);

          // Style the iframe inside the wrapper
          iframe.style.position = "absolute";
          iframe.style.top = "0";
          iframe.style.left = "0";
          iframe.style.width = "100%";
          iframe.style.height = "100%";
        }
      });

      // Process images
      const images = container.current.querySelectorAll("img");
      images.forEach((img) => {
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.borderRadius = "8px";
        img.style.margin = "16px 0";
      });

      // Process tables
      const tables = container.current.querySelectorAll("table");
      tables.forEach((table) => {
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.margin = "16px 0";
        table.style.borderRadius = "8px";
        table.style.overflow = "hidden";
        table.style.border = "1px solid #e5e7eb";
      });

      // Process table cells
      const cells = container.current.querySelectorAll("td, th");
      cells.forEach((cell) => {
        const htmlElement = cell as HTMLElement;
        htmlElement.style.padding = "12px";
        htmlElement.style.border = "1px solid #e5e7eb";
        htmlElement.style.textAlign = "left";
      });

      // Process code blocks
      const codeBlocks = container.current.querySelectorAll("pre");
      codeBlocks.forEach((pre) => {
        pre.style.backgroundColor = "#f8fafc";
        pre.style.border = "1px solid #e2e8f0";
        pre.style.borderRadius = "8px";
        pre.style.padding = "16px";
        pre.style.overflow = "auto";
        pre.style.margin = "16px 0";
      });

      // Process inline code
      const inlineCode =
        container.current.querySelectorAll("code:not(pre code)");
      inlineCode.forEach((code) => {
        const htmlElement = code as HTMLElement;
        htmlElement.style.backgroundColor = "#f1f5f9";
        htmlElement.style.padding = "2px 6px";
        htmlElement.style.borderRadius = "4px";
        htmlElement.style.fontSize = "0.875em";
        htmlElement.style.fontFamily = "monospace";
      });
    }, [content, ref]);

    return (
      <div
        ref={ref}
        className={cn(
          "prose prose-gray max-w-none select-text",
          "prose-headings:text-gray-900 prose-headings:font-semibold",
          "prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-6",
          "prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-4",
          "prose-h3:text-lg prose-h3:font-medium prose-h3:mb-3",
          "prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4",
          "prose-ul:text-gray-700 prose-ol:text-gray-700",
          "prose-li:mb-2",
          "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600",
          "prose-strong:text-gray-900 prose-strong:font-semibold",
          "prose-em:text-gray-800 prose-em:italic",
          "prose-a:text-blue-600 prose-a:no-underline prose-a:font-medium hover:prose-a:text-blue-800",
          "prose-hr:border-gray-200 prose-hr:my-8",
          className
        )}
        style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
);

LessonContent.displayName = "LessonContent";

export default LessonContent;
