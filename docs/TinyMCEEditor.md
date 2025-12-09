# TinyMCEEditor Component

A rich text editor component built with TinyMCE that combines the rich features from the `/tinyeditor` folder with Cloudinary upload functionality.

## Features

- **Rich Text Editing**: Full-featured WYSIWYG editor with formatting tools
- **Cloudinary Integration**: Automatic image, video, and file uploads to Cloudinary
- **Dark Mode Support**: Automatic theme switching based on system preference
- **Custom Plugins**: Enhanced code editor and markdown support
- **Multiple Modes**: Full editor, minimal editor, and readonly modes
- **Responsive Design**: Works well on different screen sizes

## Props

```typescript
interface TinyMCEEditorProps {
  value: string; // Current content (HTML)
  onChange: (content: string) => void; // Callback when content changes
  height?: number; // Editor height in pixels (default: 500)
  placeholder?: string; // Placeholder text
  className?: string; // Additional CSS classes
  minimal?: boolean; // Use minimal toolbar (default: false)
  readonly?: boolean; // Read-only mode (default: false)
  onImageUpload?: (
    // Custom image upload handler
    files: File[],
    insertImage: (
      base64: string,
      callback: (images: HTMLImageElement[]) => void
    ) => void
  ) => void;
  onMediaDelete?: (images: HTMLImageElement[]) => void; // Media deletion callback
}
```

## Usage

### Basic Usage

```tsx
import TinyMCEEditor from "@/components/ui/TinyMCEEditor";

function MyComponent() {
  const [content, setContent] = useState("<p>Hello World!</p>");

  return (
    <TinyMCEEditor
      value={content}
      onChange={setContent}
      height={400}
      placeholder="Start typing..."
    />
  );
}
```

### Minimal Editor

```tsx
<TinyMCEEditor
  value={content}
  onChange={setContent}
  minimal={true}
  height={200}
/>
```

### Readonly Mode

```tsx
<TinyMCEEditor
  value={content}
  onChange={() => {}}
  readonly={true}
  height={300}
/>
```

### Custom Image Upload

```tsx
<TinyMCEEditor
  value={content}
  onChange={setContent}
  onImageUpload={(files, insertImage) => {
    // Custom upload logic
    const file = files[0];
    // Upload to your server
    // Then call insertImage with the URL
    insertImage(imageUrl, (images) => {
      console.log("Images inserted:", images);
    });
  }}
/>
```

## Features

### Toolbar Options

**Full Editor:**

- Text formatting (bold, italic, underline, strikethrough)
- Text alignment (left, center, right, justify)
- Lists (bulleted, numbered)
- Links, images, media, tables
- Code blocks with syntax highlighting
- Markdown support
- Search and replace
- Fullscreen mode

**Minimal Editor:**

- Basic formatting (bold, italic, underline)
- Lists (bulleted, numbered)
- Text alignment (left, center)
- Links, images, media

### Cloudinary Integration

The editor automatically uploads images, videos, and files to Cloudinary using the following configuration:

- **Cloud Name**: `emergingplatforms`
- **Upload Preset**: `ilearn`
- **Tags**: `CourseMaterials`

### Custom Plugins

1. **Enhanced Code Editor**: Adds a code button to insert syntax-highlighted code blocks
2. **Markdown Support**: Toggle between HTML and Markdown modes

### Dark Mode

The editor automatically adapts to the system theme preference using `next-themes`. Dark mode includes:

- Dark toolbar and interface
- Dark content area
- Syntax highlighting for code blocks
- Proper contrast for all elements

## File Structure

```
components/ui/
├── TinyMCEEditor.tsx              # Main component
├── tinymce-config.ts              # Editor configuration
├── hooks/
│   └── use-editor-setup.ts        # Editor lifecycle hooks
└── plugins/
    ├── enhanced-code-editor.plugin.ts  # Code editor plugin
    └── thm-markdown.plugin.ts          # Markdown plugin
```

## Dependencies

- `tinymce`: The core TinyMCE editor
- `next-themes`: For dark mode support
- `react`: React framework

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (responsive design)

## Notes

- The editor is client-side only and won't render on the server
- Images and files are automatically uploaded to Cloudinary
- The editor supports both light and dark themes
- Custom plugins can be extended for additional functionality
