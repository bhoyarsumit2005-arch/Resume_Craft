import { Trash2 } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

interface Props {
  open: boolean;
  title?: string;
  itemName?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationModal({ open, title = "Delete resume?", itemName, loading, onCancel, onConfirm }: Props) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-red-50 grid place-items-center text-red-600">
          <Trash2 size={18} />
        </div>
        <p className="text-sm text-gray-600">
          {itemName ? (
            <>
              <span className="font-semibold text-gray-900">“{itemName}”</span> will be permanently deleted. This action cannot be undone.
            </>
          ) : (
            "This action cannot be undone."
          )}
        </p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
