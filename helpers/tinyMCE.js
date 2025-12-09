// export const loadEditorScript = () => {
//     const script = document.createElement("script")
//     script.async = true
//     script.src = "/tinymce/js/tinymce/tinymce.min.js"
//     document.head.appendChild(script)

//     return script
// }

export const editorInit = (height = 500, readonly = false) => {
  return {
    height,
    readonly,
    plugins: [
      "paste",
      "print",
      "preview",
      "searchreplace",
      "autolink",
      "visualblocks",
      "visualchars",
      "image",
      "link",
      "media",
      "template",
      "codesample",
      "charmap ",
      "hr ",
      "anchor ",
      "insertdatetime",
      "advlist",
      "lists",
      "wordcount",
      "spellchecker ",
      "imagetools ",
      "help",
    ],
    toolbar:
      "bold italic strikethrough forecolor backcolor  | \
            link image media  | alignleft aligncenter alignright alignjustify  | \
            numlist bullist outdent indent | removeformat | codesample code | formatselect",
    branding: false,
    content_style: readonly ? "body { color: #aaa; }" : undefined,
    imagetools_cors_hosts: ["*", "*.emergingpastetforms.com"],
    document_base_url:
      "https://api.cloudinary.com/v1_1/emergingplatforms/upload/",
    paste_as_text: false,
    convert_urls: false,
    file_picker_types: "file image media",
    automatic_uploads: true,
    images_upload_base_path:
      "https://api.cloudinary.com/v1_1/emergingplatforms/upload",
    images_upload_url:
      "https://api.cloudinary.com/v1_1/emergingplatforms/upload",
    /* and here's our custom image picker*/
    file_picker_callback: function (cb, value, meta) {
      var input = document.createElement("input");
      input.setAttribute("type", "file");
      // input.setAttribute("accept", "image/*");
      input.setAttribute("accept", "image/* ,	application/pdf");
      input.onchange = function () {
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function () {
          var id = "blobid" + new Date().getTime();
          var blobCache = tinymce.activeEditor.editorUpload.blobCache;
          var base64 = reader.result.split(",")[1];
          var blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          //console.log(blobInfo.name());
          let fname = blobInfo.name() + file.name;
          /* call the callback and populate the Title field with the file name */
          if (meta.filetype === "file" || "image") {
            function success(d) {
              //console.log('success' + d)
              cb(d, {
                text: file.name,
              });
            }
            function failure() {
              // Error handling for file upload failure
            }
            var xhr, formData;
            xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.open(
              "POST",
              "https://api.cloudinary.com/v1_1/emergingplatforms/upload"
            );
            xhr.onload = function () {
              var json;
              if (xhr.status != 200) {
                failure("HTTP Error: " + xhr.status);
                return;
              }
              json = JSON.parse(xhr.responseText);
              if (!json || typeof json.secure_url != "string") {
                failure("Invalid JSON: " + xhr.responseText);
                return;
              }
              success(json.secure_url);
            };
            formData = new FormData();
            formData.append("upload_preset", "ilearn");
            formData.append("file", blobInfo.blob(), fname);
            xhr.send(formData);
          }
          // if (meta.filetype === 'image') {
          //   cb(blobInfo.blobUri(), {
          //     alt: file.name
          //   })
          // }
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
    images_upload_handler: function (blobInfo, success, failure) {
      var xhr, formData;
      xhr = new XMLHttpRequest();
      xhr.withCredentials = false;
      xhr.open(
        "POST",
        "https://api.cloudinary.com/v1_1/emergingplatforms/upload"
      );
      xhr.onload = function () {
        var json;
        if (xhr.status != 200) {
          failure("HTTP Error: " + xhr.status);
          return;
        }
        json = JSON.parse(xhr.responseText);
        if (!json || typeof json.secure_url != "string") {
          failure("Invalid JSON: " + xhr.responseText);
          return;
        }
        success(json.secure_url);
      };
      formData = new FormData();
      formData.append("upload_preset", "ilearn");
      formData.append("tags", "CourseMaterials");
      formData.append("file", blobInfo.blob(), blobInfo.filename());
      xhr.send(formData);
    },
  };
};
