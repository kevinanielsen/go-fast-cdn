import MainContentWrapper from "@/components/layouts/main-content-wrapper";
import DataTable from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Check,
  Cross,
  Loader2Icon,
  Pencil,
  Plus,
  Trash,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { TUser } from "@/types/user";
import { useCallback, useEffect, useMemo, useState } from "react";
import FormUserModal from "./modal/form-user-modal";
import DeleteUserConfirmModal from "./modal/delete-user-confirm-modal";
import useRegistrationEnabledQuery from "./hooks/use-registration-enabled-query";
import UseToggleRegistrationMutation from "./hooks/use-toggle-registration-mutation";
import toast from "react-hot-toast";
import useUsersQuery from "./hooks/use-users-query";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const UserManagementPage = () => {
  const { data } = useUsersQuery();
  const { user: currentUser } = useAuth();
  const registrationEnabledQuery = useRegistrationEnabledQuery();
  const registrationToggleMutation = UseToggleRegistrationMutation();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<TUser | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");

  const columns = useMemo<ColumnDef<TUser>[]>(
    () => [
      {
        header: "No. ",
        accessorFn: (_row, index) => index + 1,
        id: "no",
      },
      // email
      {
        header: "Email",
        accessorKey: "email",
      },
      // role
      {
        header: "Role",
        accessorKey: "role",
        cell: ({ getValue }) => {
          const role = getValue();
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                role === "admin"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {role as string}
            </span>
          );
        },
      },
      // is_verified
      {
        header: "Verified",
        accessorKey: "is_verified",
        cell: ({ getValue }) => (
          <div>
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                getValue() ? "bg-green-400" : "bg-red-400"
              }`}
            ></span>
            <span className="ml-2">{getValue() ? "Yes" : "No"}</span>
          </div>
        ),
      },
      // created at
      {
        header: "Created At",
        accessorKey: "created_at",
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
      },
      // last login
      {
        header: "Last Login",
        accessorKey: "last_login",
        cell: ({ getValue }) => {
          if (getValue() === null) {
            return <span className="text-gray-500">Never</span>;
          }
          const date = new Date(getValue() as string);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => {
          const userData = row.original;
          return (
            <div className="flex gap-2">
              {currentUser && currentUser.id === userData.id ? (
                <span className="text-gray-500 cursor-not-allowed">
                  It's you!
                </span>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setMode("edit");
                      setSelectedData(userData);
                      setFormModalOpen(true);
                    }}
                    variant="outline"
                    size="icon"
                  >
                    <Pencil />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setSelectedData(userData);
                      setDeleteConfirmModalOpen(true);
                    }}
                  >
                    <Trash />
                    <span className="sr-only">Delete</span>
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [currentUser]
  );

  const defineButtonState = useMemo(() => {
    if (registrationEnabledQuery.isLoading) {
      return (
        <Button disabled>
          <Loader2Icon className="animate-spin" />
          Loading...
        </Button>
      );
    }
    if (registrationEnabledQuery.isError) {
      return (
        <Button variant="destructive" disabled>
          <Cross />
          Error
        </Button>
      );
    }
    if (registrationToggleMutation.isPending) {
      if (registrationEnabledQuery.data) {
        return (
          <Button variant="destructive" disabled>
            <Loader2Icon className="animate-spin" />
            Disabling...
          </Button>
        );
      }
      return (
        <Button variant="success" disabled>
          <Loader2Icon className="animate-spin" />
          Enabling...
        </Button>
      );
    }
    if (!registrationEnabledQuery.data) {
      return (
        <Button
          variant="destructive"
          onClick={() => {
            registrationToggleMutation.mutate(true, {
              onSuccess: () => {
                toast.success("Registration enable successfully!");
              },
              onError: () => {
                toast.error("Failed to enable registration.");
              },
            });
          }}
        >
          <X />
          Registration Disabled
        </Button>
      );
    }
    return (
      <Button
        variant="success"
        onClick={() => {
          registrationToggleMutation.mutate(false, {
            onSuccess: () => {
              toast.success("Registration disabled successfully!");
            },
            onError: () => {
              toast.error("Failed to disabled registration.");
            },
          });
        }}
      >
        <Check />
        Registration Enabled
      </Button>
    );
  }, [
    registrationEnabledQuery.data,
    registrationEnabledQuery.isError,
    registrationEnabledQuery.isLoading,
    registrationToggleMutation,
  ]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDebounceSearch(event.target.value);
    },
    []
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(debounceSearch);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [debounceSearch]);

  return (
    <MainContentWrapper title="User Management">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <section className="flex items-center gap-2">
            <Input
              className="w-full max-w-md min-w-xs"
              placeholder="Search users by email or role"
              value={debounceSearch}
              onChange={handleSearchChange}
              aria-label="Search users"
            />
            <Button
              variant="outline"
              className={cn({
                hidden: !search,
              })}
              onClick={() => {
                setSearch("");
                setDebounceSearch("");
              }}
              aria-label="Clear search"
            >
              <X />
              Clear Search
            </Button>
          </section>
          <section className="flex items-center gap-2">
            {defineButtonState}
            <Button
              onClick={() => {
                setMode("create");
                setFormModalOpen(true);
              }}
              variant="default"
            >
              <Plus />
              Add User
            </Button>
          </section>
        </div>
        <DataTable globalFilter={search} columns={columns} data={data || []} />
      </div>

      <FormUserModal
        isOpen={formModalOpen}
        setOpen={setFormModalOpen}
        mode={mode}
        data={selectedData}
      />
      <DeleteUserConfirmModal
        isOpen={deleteConfirmModalOpen}
        setOpen={setDeleteConfirmModalOpen}
        id={selectedData?.id || 0}
      />
    </MainContentWrapper>
  );
};

export default UserManagementPage;
