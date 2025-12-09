"use client";

import React, { useState } from "react";
import TinyMCEEditor from "./TinyMCEEditor";

export default function TinyMCEEditorExample() {
  const [content, setContent] = useState(
    "<p>Hello, this is the TinyMCE Editor!</p>"
  );
  const [minimalContent, setMinimalContent] = useState(
    "<p>Minimal editor example</p>"
  );

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Rich Text Editor</h2>
        <TinyMCEEditor
          value={content}
          onChange={setContent}
          height={400}
          placeholder="Start typing your content..."
          className="border rounded-lg"
        />
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">HTML Output:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
            {content}
          </pre>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Minimal Editor</h2>
        <TinyMCEEditor
          value={minimalContent}
          onChange={setMinimalContent}
          minimal={true}
          height={200}
          placeholder="Minimal editor..."
          className="border rounded-lg"
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Readonly Editor</h2>
        <TinyMCEEditor
          value="<p>This content is read-only and cannot be edited.</p>"
          onChange={() => {}}
          readonly={true}
          height={150}
          className="border rounded-lg"
        />
      </div>
    </div>
  );
}
