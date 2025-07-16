import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useDeleteUserMutation from "../hooks/use-delete-user-mutation";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { IErrorResponse } from "@/types/response";
import { Loader2Icon } from "lucide-react";

interface DeleteUserConfirmModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  id: number | null;
}
const DeleteUserConfirmModal = ({
  isOpen,
  id,
  setOpen,
}: DeleteUserConfirmModalProps) => {
  const mutation = useDeleteUserMutation();

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this account?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. It will permanently delete the user
            account and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={() => {
              mutation.mutate(id || 0, {
                onSuccess: () => {
                  setOpen(false);
                  toast.success("User deleted successfully!");
                },
                onError: (error) => {
                  const errorResponse = error as AxiosError<IErrorResponse>;
                  toast.error(
                    `Error deleting user: ${
                      errorResponse.response?.data.error || "Unknown error"
                    }`
                  );
                },
              });
            }}
          >
            {mutation.isPending ? (
              <>
                <Loader2Icon className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserConfirmModal;
