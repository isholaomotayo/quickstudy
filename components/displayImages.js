import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React, { Component, Fragment } from "react";

class Gallery extends Component {
  state = {
    images: this.props.images || [
      {
        src: "https://img.icons8.com/plasticine/2x/document.png",
        link: "https://img.icons8.com/plasticine/2x/document.png",
      },
      {
        src: "https://img.icons8.com/plasticine/2x/document.png",
        link: "https://res.cloudinary.com/emergingplatforms/image/upload/v1579298977/dummy_okaw4k.pdf",
      },
    ],
    selectedImage: null,
    isOpen: false,
  };

  openPopupbox = (content) => {
    this.setState({ selectedImage: content, isOpen: true });
  };

  closePopupbox = () => {
    this.setState({ isOpen: false, selectedImage: null });
  };

  render() {
    return (
      <Fragment>
        <div style={{ width: "200px" }} />
        {this.state.images.map(({ src, link, name = "" }, j) => (
          <div
            key={j}
            style={{
              float: "left",
              marginRight: "10px",
              boxSizing: "border-box",
              overflow: "hidden",
              position: "relative",
            }}
            onClick={() =>
              this.openPopupbox(
                <div style={{ height: "700px", minWidth: "800px" }} key={link}>
                  <embed src={link} />
                </div>
              )
            }
            key={link + j}
          >
            <img
              alt={src}
              src={src}
              style={{
                cursor: "pointer",
                minHeight: "100px",
                width: "100px",
              }}
            />
            <br />
            <strong>{name}</strong>
          </div>
        ))}

        <Dialog.Root open={this.state.isOpen} onOpenChange={this.closePopupbox}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998]" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[9999] w-[90%] h-[90%] max-w-none max-h-none overflow-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  Image Viewer
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    onClick={this.closePopupbox}
                    className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </button>
                </Dialog.Close>
              </div>
              <div className="p-6">{this.state.selectedImage}</div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <style jsx>{`
          embed {
            width: 100%;
            height: 100%;
          }
        `}</style>
      </Fragment>
    );
  }
}

export default Gallery;
