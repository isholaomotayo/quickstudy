import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";
import Button from "react-bootstrap/Button";

const FullModal = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleShow = () => {
    setIsOpen(true);
  };

  const content =
    typeof props.children === "function"
      ? props.children(handleClose)
      : props.children;

  // Create title with preModalTitle if provided
  const modalTitle = props.preModalTitle
    ? `${props.preModalTitle} ${props.modalTitle || "Title"}`
    : props.modalTitle || "Title";

  useImperativeHandle(ref, () => ({
    close: handleClose,
    open: handleShow,
    isOpen: isOpen,
  }));

  const getModalSize = () => {
    switch (props.modalSize) {
      case "xl":
        return { width: "95%", height: "90%" };
      case "lg":
        return { width: "80%", height: "80%" };
      case "md":
        return { width: "60%", height: "70%" };
      case "sm":
        return { width: "40%", height: "auto" };
      default:
        return { width: "60%", height: "70%" };
    }
  };

  return (
    <>
      {props.useLink ? (
        <a onClick={handleShow} className="modal-link">
          {props.openBtnTitle}
        </a>
      ) : props.customTrigger ? (
        <span onClick={handleShow} style={{ display: "inline-block" }}>
          {props.customTrigger}
        </span>
      ) : (
        <Button
          variant={props.openBtnVariant || "default"}
          onClick={handleShow}
          className={`btn-${props.openBtnSize || "sm"} modal-btn mt-1 ${
            props.openBtnTitle && props.openBtnTitle.length > 1
              ? ""
              : "px-1 py-0"
          }`}
        >
          {props.openBtnIconClass ? (
            <>
              <i className={`${props.openBtnIconClass} modal-open-icon`} />{" "}
            </>
          ) : (
            ""
          )}
          {props.openBtnTitle || ""}
        </Button>
      )}

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 bg-black/50 z-[9998]"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 9998,
            }}
          />
          <Dialog.Content
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              zIndex: 9999,
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              ...getModalSize(),
            }}
            onEscapeKeyDown={handleClose}
            onInteractOutside={
              props.backdrop === "static" ? undefined : handleClose
            }
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <Dialog.Title
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                {modalTitle}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  onClick={handleClose}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                    opacity: 0.7,
                    transition: "opacity 0.2s",
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              </Dialog.Close>
            </div>
            <div style={{ padding: "24px" }}>{content}</div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <style jsx global>{`
        .modal-btn {
        }
        i.modal-open-icon {
        }
        .modal-link {
          border-bottom: 1px dotted;
          cursor: pointer;
        }

        /* Radix UI Dialog Styles */
        [data-radix-dialog-overlay] {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 9998;
        }

        [data-radix-dialog-content] {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          z-index: 9999;
          max-width: 90vw;
          max-height: 90vh;
          overflow: auto;
        }

        [data-radix-dialog-title] {
          margin: 0;
          font-weight: 600;
          font-size: 1.125rem;
          line-height: 1.75rem;
          color: #111827;
        }

        [data-radix-dialog-close] {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        [data-radix-dialog-close]:hover {
          opacity: 1;
        }
      `}</style>
    </>
  );
});

export default FullModal;
