import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IUserCreateRequest,
  IUserEditRequest,
  TUser,
  userCreateFormSchema,
  userEditFormSchema,
} from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import useCreateUserMutation from "../hooks/use-create-user-mutation";
import useEditUserMutation from "../hooks/use-edit-user-mutation";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { IErrorResponse } from "@/types/response";
import { Loader2Icon } from "lucide-react";

interface FormUserModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  data: TUser | null;
  mode: "create" | "edit";
}

const FormUserModal = ({ mode, data, isOpen, setOpen }: FormUserModalProps) => {
  const form = useForm<IUserCreateRequest | IUserEditRequest>({
    resolver: zodResolver(
      mode === "create" ? userCreateFormSchema : userEditFormSchema
    ),
    defaultValues: {
      email: data?.email || "",
      password: "", // Password should not be pre-filled for security reasons
      role: data?.role || "user",
    },
  });

  const createMutation = useCreateUserMutation();
  const editMutation = useEditUserMutation();

  const handleSubmit = useCallback(
    async (values: IUserCreateRequest | IUserEditRequest) => {
      if (mode === "create") {
        createMutation.mutate(values as IUserCreateRequest, {
          onSuccess: () => {
            toast.success("User created successfully!");
            setOpen(false);
            form.reset({
              email: "",
              password: "",
              role: "user",
            }); // Reset form after successful creation
          },
          onError: (error) => {
            const errorRes = error as AxiosError<IErrorResponse>;
            toast.error(
              `Error creating user: ${
                errorRes.response?.data.error || error.message
              }`
            );
          },
        });
      } else {
        if (!data) {
          toast.error("No user data available for editing.");
          return;
        }
        editMutation.mutate(
          {
            id: data.id,
            data: {
              email: values.email,
              password: values.password || undefined, // Password is optional in edit mode
              role: values.role,
            },
          },
          {
            onSuccess: () => {
              toast.success("User updated successfully!");
              setOpen(false);
            },
            onError: (error) => {
              const errorRes = error as AxiosError<IErrorResponse>;
              toast.error(
                `Error updating user: ${
                  errorRes.response?.data.error || error.message
                }`
              );
            },
          }
        );
      }
      setOpen(false);
    },
    [mode, setOpen, createMutation, form, data, editMutation]
  );

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && data) {
        form.reset({
          email: data.email,
          role: data.role,
        });
      }
    } else {
      // Reset form when modal is closed
      form.reset({
        email: "",
        password: "",
        role: "user",
      });
    }
  }, [data, form, isOpen, mode]);

  return (
    <Dialog onOpenChange={setOpen} open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create User" : "Edit User"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to create a new user."
              : `Edit details for ${data?.email}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter user email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter user password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col md:flex-row gap-2 md:justify-end">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || editMutation.isPending}
              >
                {mode === "create" ? (
                  <>
                    {createMutation.isPending ? (
                      <>
                        <Loader2Icon className="animate-spin" />
                        Creating User...
                      </>
                    ) : (
                      "Create User"
                    )}
                  </>
                ) : (
                  <>
                    {editMutation.isPending ? (
                      <>
                        <Loader2Icon className="animate-spin" />
                        Updating User...
                      </>
                    ) : (
                      "Update User"
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FormUserModal;
