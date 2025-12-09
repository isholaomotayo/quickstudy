// Color definitions for dark and light themes
const darkColors = {
  background: {
    main: "#1a1a1a",
    dark: "#0d1117",
    light: "#21262d",
    lightest: "#30363d",
  },
  text: {
    main: "#f0f6fc",
    light: "#8b949e",
  },
  primary: {
    main: "#58a6ff",
    light: "#79c0ff",
  },
  secondary: {
    light: "#e1e4e8",
  },
  info: {
    main: "#58a6ff",
    light: "#1f6feb",
  },
  warning: {
    main: "#d29922",
    light: "#e3b341",
    lightest: "#f78166",
  },
  error: {
    main: "#f85149",
    light: "#f85149",
  },
  success: {
    main: "#3fb950",
    light: "#56d364",
    lightest: "#238636",
  },
  purple: {
    main: "#bc8cff",
    light: "#d2a8ff",
  },
};

const lightColors = {
  background: {
    main: "#ffffff",
    light: "#f6f8fa",
    lightest: "#f1f3f4",
  },
  text: {
    main: "#24292f",
    light: "#656d76",
  },
  primary: {
    main: "#0969da",
    light: "#1f6feb",
  },
  secondary: {
    light: "#d0d7de",
  },
  info: {
    main: "#0969da",
    light: "#1f6feb",
  },
  warning: {
    main: "#9a6700",
    light: "#d29922",
    lightest: "#f78166",
  },
  error: {
    main: "#cf222e",
    light: "#f85149",
  },
  success: {
    main: "#116329",
    light: "#3fb950",
    lightest: "#238636",
  },
  purple: {
    main: "#8250df",
    light: "#a371f7",
  },
};

export function generateDarkModeStyles(isDarkMode: boolean) {
  return `
    code:not([class*='language-']) {
      background-color: ${isDarkMode ? "#1f2328" : "#f5f6f7"};
      color: #fff;
      padding: 0.5rem;
      display: inline;
      white-space: normal;
      border-radius: 0.3rem ;
      margin-bottom: 0.2rem;
      font-family: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace ;
      font-size: 1.4rem;
    }

  body{
      background-color: ${
        isDarkMode ? darkColors.background.dark : lightColors.background.light
      };
      color: ${isDarkMode ? darkColors.text.light : lightColors.text.main};
      font-size: 5px;
  }
      

    td {
      background-color: ${
        isDarkMode ? darkColors.background.main : lightColors.background.main
      };
    }
 

     [style*='color:rgb(136, 204, 20);'] {
      color: ${isDarkMode ? darkColors.primary.main : "rgb(136, 204, 20);"} ;
    }
     [style*='color:rgb(14, 16, 26);'],
     [style*='color:rgb(0, 0, 0);'],
     [style*='color:rgb(67, 67, 67);'] {
      color: ${isDarkMode ? "white" : "rgb(67, 67, 67)"} ;
    }
     p,
     h1,
     h2,
     h3,
     h4,
     h5,
     h6,
     ul,
     li {
      color: ${isDarkMode ? darkColors.text.light : lightColors.text.main} ;
    }

  `;
}

export function getEditorModalStyles(isDarkModeMode: boolean) {
  const colors = isDarkModeMode ? darkColors : lightColors;

  const styleString = `
    .editor-modal .prism-code-editor {
      caret-color: ${isDarkModeMode ? colors.text.main : "#000"};
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
      --editor__bg: ${colors.background.main};
      --widget__border: ${isDarkModeMode ? colors.text.light : "#bfbfbf"};
      --widget__bg: ${
        isDarkModeMode ? colors.background.lightest : colors.secondary.light
      };
      --widget__color: ${isDarkModeMode ? colors.text.light : "#444"};
      --widget__color-active: ${isDarkModeMode ? colors.text.main : "#000"};
      --widget__color-options: ${isDarkModeMode ? colors.text.light : "#666"};
      --widget__bg-input: ${colors.background.main};
      --widget__bg-hover: ${isDarkModeMode ? colors.text.light : "#b8b8b84f"};
      --widget__bg-active: ${isDarkModeMode ? colors.info.light : "#c2dff2"};
      --widget__focus-ring: ${isDarkModeMode ? colors.info.main : "#0077f0"};
      --search__bg-find: ${
        isDarkModeMode ? colors.warning.lightest : "#ea5c0054"
      };
      --widget__bg-error: ${isDarkModeMode ? colors.error.light : "#f2dede"};
      --widget__error-ring: ${isDarkModeMode ? colors.error.main : "#be1100"};
      --editor__bg-highlight: ${
        isDarkModeMode ? colors.background.lightest : "#eae8e6"
      };
      --editor__bg-selection-match: ${
        isDarkModeMode ? colors.info.light : "#b6d5fc80"
      };
      --editor__line-number: ${isDarkModeMode ? colors.text.light : "#9d897b"};
      --editor__bg-scrollbar: 24, 7%, 35%;
      --editor__bg-fold: ${isDarkModeMode ? colors.text.light : "#424242"};
      --bg-guide-indent: ${isDarkModeMode ? colors.text.light : "#4b413a33"};
      --pce-ac-icon-class: ${isDarkModeMode ? colors.warning.main : "#d67e00"};
      --pce-ac-icon-enum: ${isDarkModeMode ? colors.warning.main : "#d67e00"};
      --pce-ac-icon-function: ${
        isDarkModeMode ? colors.purple.main : "#652d90"
      };
      --pce-ac-icon-interface: ${isDarkModeMode ? colors.info.main : "#007acc"};
      --pce-ac-icon-variable: ${isDarkModeMode ? colors.info.main : "#007acc"};
      --pce-ac-match: ${isDarkModeMode ? colors.info.main : "#0066bf"};
      --pce-tabstop: ${isDarkModeMode ? colors.info.light : "#0a326433"};
      --pce-invisibles: ${isDarkModeMode ? colors.text.light : "#3333"};
      color-scheme: ${isDarkModeMode ? "dark" : "light"};
      color: ${colors.text.main};
    }

    .editor-modal .prism-code-editor textarea::selection {
      background: ${isDarkModeMode ? colors.info.light : "#b6d5fc"};
      color: transparent;
    }

    .editor-modal .pce-matches .match {
      --search__bg-find: ${isDarkModeMode ? colors.error.light : "#c7ada9"};
    }

    .editor-modal .active-line {
      --editor__line-number: ${isDarkModeMode ? colors.text.main : "#4d3a2e"};
    }

    .editor-modal .guide-indents .active {
      --bg-guide-indent: ${isDarkModeMode ? colors.text.main : "#38322f66"};
    }

    .editor-modal [class*=language-] {
      color: ${colors.text.main};
    }

    .editor-modal .token.comment,
    .editor-modal .token.prolog,
    .editor-modal .token.doctype,
    .editor-modal .token.cdata {
      color: ${isDarkModeMode ? colors.text.light : "#708090"};
    }

    .editor-modal .token.punctuation,
    .editor-modal .token.attr-equals {
      color: ${isDarkModeMode ? colors.text.light : "#999"};
    }

    .editor-modal .token.namespace {
      opacity: .7;
    }

    .editor-modal .token.property,
    .editor-modal .token.tag,
    .editor-modal .token.boolean,
    .editor-modal .token.number,
    .editor-modal .token.constant,
    .editor-modal .token.symbol,
    .editor-modal .token.deleted {
      color: ${isDarkModeMode ? colors.purple.main : "#905"};
    }

    .editor-modal .token.selector,
    .editor-modal .token.attr-name,
    .editor-modal .token.string,
    .editor-modal .token.char,
    .editor-modal .token.builtin,
    .editor-modal .token.inserted {
      color: ${isDarkModeMode ? colors.success.main : "#690"};
    }

    .editor-modal .token.operator,
    .editor-modal .token.entity,
    .editor-modal .token.url,
    .editor-modal .language-css .token.string,
    .editor-modal .style .token.string {
      color: ${isDarkModeMode ? colors.warning.main : "#9a6e3a"};
    }

    .editor-modal .token.atrule,
    .editor-modal .token.attr-value,
    .editor-modal .token.keyword {
      color: ${isDarkModeMode ? colors.info.main : "#07a"};
    }

    .editor-modal .token.function,
    .editor-modal .token.class-name {
      color: ${isDarkModeMode ? colors.error.main : "#dd4a68"};
    }

    .editor-modal .token.regex,
    .editor-modal .language-regex,
    .editor-modal .token.important,
    .editor-modal .token.variable {
      color: ${isDarkModeMode ? colors.warning.main : "#e90"};
    }

    .editor-modal .token.important,
    .editor-modal .token.bold {
      font-weight: 700;
    }

    .editor-modal .token.italic {
      font-style: italic;
    }

    .editor-modal .token.bracket-level-0,
    .editor-modal .token.bracket-level-3,
    .editor-modal .token.bracket-level-6,
    .editor-modal .token.bracket-level-9 {
      color: ${isDarkModeMode ? colors.info.main : "#0431fa"};
    }

    .editor-modal .token.bracket-level-1,
    .editor-modal .token.bracket-level-4,
    .editor-modal .token.bracket-level-7,
    .editor-modal .token.bracket-level-10 {
      color: ${isDarkModeMode ? colors.success.main : "#319331"};
    }

    .editor-modal .token.bracket-level-2,
    .editor-modal .token.bracket-level-5,
    .editor-modal .token.bracket-level-8,
    .editor-modal .token.bracket-level-11 {
      color: ${isDarkModeMode ? colors.warning.main : "#7b3814"};
    }

    .editor-modal .token.bracket-error {
      color: ${isDarkModeMode ? colors.error.main : "#ff1212cc"};
    }

    .editor-modal .token.markup-bracket {
      color: inherit;
    }

    .editor-modal .active-bracket {
      box-shadow: inset 0 0 0 1px ${
        isDarkModeMode ? colors.text.light : "#b9b9b9"
      }, inset 0 0 0 9in ${
    isDarkModeMode ? colors.success.lightest : "#0064001a"
  };
    }

    .editor-modal .active-tagname,
    .editor-modal .word-matches span {
      background: ${isDarkModeMode ? colors.text.light : "#57575740"};
    }
  `;

  return styleString;
}

export const getStyles = (isDarkMode: boolean) => {
  const colors = isDarkMode ? darkColors : lightColors;

  return {
    modal: `
      position: fixed;
      top: 10%;
      left: 15%;
      width: 70%;
      height: 60%;
      background: ${isDarkMode ? colors.background.main : "#ffffff"};
      border: 1px solid ${isDarkMode ? "rgba(128, 128, 128, 0.3)" : "#e0e0e0"};
      z-index: 10000;
      padding: 1rem;
      font-size: 1.2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      overflow: auto;
      display: flex;
      flex-direction: column;
      color: ${colors.text.main};
    `,
    toolbar: `
      width: 100%;
      padding: 0.5rem;
      display: flex;
      flex-direction: row-reverse;
      flex-start: end;
      gap: 0.5rem;

    `,
    header: `
      width: 100%;
      padding: 0.5rem;
      background: ${
        isDarkMode ? colors.background.lightest : colors.background.light
      };
      border: 1px solid ${isDarkMode ? "rgba(128, 128, 128, 0.3)" : "#e0e0e0"};
      border-radius: 4px 4px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1px;
      color: ${colors.text.main};
    `,
    editorContainer: `
      width: 100%;
      display: grid;
      font-size: 1rem;
      height: 77%;
      border: 1px solid ${isDarkMode ? "rgba(128, 128, 128, 0.3)" : "#e0e0e0"};
      border-radius: 0 0 4px 4px;
      margin-bottom: 1rem;
      background: ${isDarkMode ? colors.background.main : "transparent"};
      color: ${colors.text.main};
    `,
    buttonContainer: `
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    `,
    button: {
      base: `
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        display: inline-flex;
        max-width: 100%;
        cursor: pointer;
        font-size: 1rem;
        font-family: Ubuntu;
        gap: 0.6rem;
        height: 2rem;
        transition: 0.2s ease-in-out;
        text-decoration: none;
        padding: 0.9rem 1rem;
        pointer-events: initial;
        border-width: 0.1rem;
        border-style: solid;
      `,
      primary: `
        background-color: ${
          isDarkMode ? colors.primary.main : "rgb(163, 234, 42)"
        };
        color: ${isDarkMode ? colors.background.main : "rgb(21, 28, 43)"};
        border-color: ${isDarkMode ? colors.primary.main : "rgb(163, 234, 42)"};
      `,
      secondary: `
        background-color: transparent;
        border-color: ${
          isDarkMode ? "rgba(128, 128, 128, 0.3)" : colors.secondary.light
        };
        color: ${isDarkMode ? colors.text.main : "rgb(21, 28, 43)"};
      `,
    },
  };
};
