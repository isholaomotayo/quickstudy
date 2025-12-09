"use client";

import dynamic from "next/dynamic";
import { PerformanceDemo } from "@/components/ui/performance-demo";
// Dynamically import the editor to prevent SSR issues
const RichTextEditor = dynamic(
  () =>
    import("@/components/ui/tinyEditor/editor").then((mod) => ({
      default: mod.RichTextEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        Loading editor...
      </div>
    ),
  }
);

export default function TestEditorPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Lexical Playground Editor
            </h1>
            <p className="text-gray-600">
              A complete implementation of the Lexical playground with all
              features
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm"></div>
          <RichTextEditor content="" onChange={() => {}} />
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">
              ✨ Playground Features
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div className="space-y-2">
                <div>
                  • <strong>Rich Text Formatting:</strong> Bold, Italic,
                  Underline, Strikethrough
                </div>
                <div>
                  • <strong>Headings:</strong> H1, H2, H3, H4, H5, H6 support
                </div>
                <div>
                  • <strong>Lists:</strong> Bulleted, Numbered, and Check lists
                </div>
                <div>
                  • <strong>Code:</strong> Inline code and code blocks with
                  syntax highlighting
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  • <strong>Tables:</strong> Full table support with editing
                </div>
                <div>
                  • <strong>Links:</strong> Auto-detection and manual link
                  creation
                </div>
                <div>
                  • <strong>Quotes:</strong> Block quote formatting
                </div>
                <div>
                  • <strong>Markdown:</strong> Markdown shortcuts for quick
                  formatting
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PerformanceDemo />
    </>
  );
}
