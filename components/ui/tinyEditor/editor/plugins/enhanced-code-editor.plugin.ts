/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */
// @ts-nocheck
import tinymce from 'tinymce';
import { getStyles } from '../dark-mode-styles';
import { BaseEditor, EditorModal } from './editor.shared';

(() => {
  tinymce.PluginManager.add('prism_code_editor', (editor) => {
    function handleEditorCreation() {
      const content = editor.getContent({ format: 'html' });
      const config = editor.getParam('prism_code_editor');
      let codeEditor = null;

      const isDark = config.isDark;
      const modal = new EditorModal('HTML Editor', isDark);
      const editorContainer = modal.createContainer('prism-editor');
      modal.modal.appendChild(editorContainer);
      modal.mount();

      const styles = getStyles(isDark);
      function initializeEditor() {
        return new Promise((resolve, reject) => {
          try {
            codeEditor = new BaseEditor('prism-editor', content, 'html', isDark);
            codeEditor.initialize().then(() => resolve(codeEditor));
          } catch (err) {
            reject(err);
          }
        });
      }

      function cleanup() {
        if (codeEditor) {
          codeEditor.destroy();
        }
        modal.destroy();
      }

      initializeEditor()
        .then((codeEditorInstance) => {
          const styles = getStyles(isDark);
          const toolbar = document.createElement('div');
          toolbar.style.cssText = styles.toolbar;
          modal.modal.insertBefore(toolbar, editorContainer);

          const beautifyButton = modal.createButton('{ } Beautify', 'primary', () => {
            codeEditorInstance.formatCurrentCode().catch(console.error);
          });
          toolbar.appendChild(beautifyButton);

          const saveButton = modal.createButton('Save changes', 'primary', () => {
            editor.setContent(codeEditorInstance.getValue());
            editor.undoManager.add();
            editor.nodeChanged();
            cleanup();
          });

          const cancelButton = modal.createButton('Discard changes', 'secondary', cleanup);

          const buttonContainer = document.createElement('div');
          buttonContainer.style.cssText = styles.buttonContainer;
          buttonContainer.appendChild(cancelButton);
          buttonContainer.appendChild(saveButton);
          modal.modal.appendChild(buttonContainer);

          modal.addEscapeHandler();
          editor.on('remove', cleanup);
        })
        .catch((error) => {
          console.error('Error creating editor:', error);
          cleanup();
        });
    }

    editor.ui.registry.addIcon(
      'custom-html-icon',
      `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M9.29289 1.29289C9.48043 1.10536 9.73478 1 10 1H18C19.6569 1 21 2.34315 21 4V9C21 9.55228 20.5523 10 20 10C19.4477 10 19 9.55228 19 9V4C19 3.44772 18.5523 3 18 3H11V8C11 8.55228 10.5523 9 10 9H5V20C5 20.5523 5.44772 21 6 21H9C9.55228 21 10 21.4477 10 22C10 22.5523 9.55228 23 9 23H6C4.34315 23 3 21.6569 3 20V8C3 7.73478 3.10536 7.48043 3.29289 7.29289L9.29289 1.29289ZM6.41421 7H9V4.41421L6.41421 7ZM18.7071 12.2929L22.7071 16.2929C23.0976 16.6834 23.0976 17.3166 22.7071 17.7071L18.7071 21.7071C18.3166 22.0976 17.6834 22.0976 17.2929 21.7071C16.9024 21.3166 16.9024 20.6834 17.2929 20.2929L20.5858 17L17.2929 13.7071C16.9024 13.3166 16.9024 12.6834 17.2929 12.2929C17.6834 11.9024 18.3166 11.9024 18.7071 12.2929ZM14.7071 13.7071C15.0976 13.3166 15.0976 12.6834 14.7071 12.2929C14.3166 11.9024 13.6834 11.9024 13.2929 12.2929L9.29289 16.2929C8.90237 16.6834 8.90237 17.3166 9.29289 17.7071L13.2929 21.7071C13.6834 22.0976 14.3166 22.0976 14.7071 21.7071C15.0976 21.3166 15.0976 20.6834 14.7071 20.2929L11.4142 17L14.7071 13.7071Z" ></path> </g></svg>`,
    );

    editor.ui.registry.addButton('prism_code_editor', {
      icon: 'custom-html-icon',
      tooltip: 'HTML Code Editor',
      onAction: () => handleEditorCreation(),
    });

    editor.ui.registry.addMenuItem('prism_code_editor', {
      text: 'Edit Code',
      icon: 'code-sample',
      onAction: () => handleEditorCreation(),
    });

    return {
      getMetadata: () => ({
        name: 'Prism Code Editor Plugin',
        description: 'A custom plugin to edit HTML code with Prism.js',
      }),
    };
  });
})();
