import React, { useCallback, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { authService, cdnApiClient } from "../../../services/authService";
import toast from "react-hot-toast";
import MainContentWrapper from "@/components/layouts/main-content-wrapper";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { AxiosError } from "axios";
import { IErrorResponse } from "@/types/response";
import {
  emailFormSchema,
  passwordFormSchema,
  twoFaFormSchema,
  twoFaSetupSchema,
} from "./schema";
import TwoFactorSection from "./two-factor-section";
import TwoFactorDialogs from "./two-factor-modal";

const UserSettings: React.FC = () => {
  const { user, refreshToken, refreshUserProfile, logout } = useAuth();

  // Modal
  const [twoFaSetupModalOpen, setTwoFaSetupModalOpen] = useState(false);
  const [twoFaVerifyModalOpen, setTwoFaVerifyModalOpen] = useState(false);

  // Form hooks
  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const twoFaForm = useForm<z.infer<typeof twoFaFormSchema>>({
    resolver: zodResolver(twoFaFormSchema),
    defaultValues: {
      twoFaEnable: user?.is_2fa_enabled || false,
    },
  });

  const twoFaSetupForm = useForm<z.infer<typeof twoFaSetupSchema>>({
    resolver: zodResolver(twoFaSetupSchema),
    defaultValues: {
      twoFACode: "",
    },
  });

  // Mutation
  const changeEmailMutation = useMutation({
    mutationFn: (payload: { new_email: string }) => {
      return cdnApiClient.put("/auth/change-email", payload);
    },
    onSuccess: (_data, variables) => {
      toast.success("Email updated successfully!");
      refreshToken();
      emailForm.reset({
        email: variables.new_email,
      });
    },
    onError: (error: AxiosError<IErrorResponse>) => {
      toast.error(error.response?.data.error || "Failed to update email");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: {
      current_password: string;
      new_password: string;
    }) => {
      return cdnApiClient.put("/auth/change-password", payload);
    },
    onSuccess: () => {
      toast.success("Password updated successfully!");
      logout();
    },
    onError: (error: AxiosError<IErrorResponse>) => {
      toast.error(error.response?.data.error || "Failed to update password");
    },
  });

  const twoFaSetupMutation = useMutation({
    mutationFn: (payload: { enable: boolean; token?: string }) => {
      return authService.setup2FA(payload);
    },
    onSuccess: (_data, variables) => {
      if (variables.enable) {
        setTwoFaSetupModalOpen(true);
        twoFaSetupForm.reset();
      } else {
        toast.success("2FA disabled successfully!");
        refreshUserProfile();
      }
      // Reset the 2FA form so isDirty is false
      twoFaForm.reset({ twoFaEnable: variables.enable });
    },
    onError: (error: AxiosError<IErrorResponse>) => {
      toast.error(
        error.response?.data.error || "Failed to update 2FA settings"
      );
      // reset form
      twoFaForm.reset();
    },
  });

  const twoFaVerifyMutation = useMutation({
    mutationFn: (payload: { token: string }) => {
      return authService.verify2FA(payload);
    },
    onSuccess: () => {
      toast.success("2FA enabled successfully!");
      setTwoFaSetupModalOpen(false);
      setTwoFaVerifyModalOpen(false);
      twoFaSetupForm.reset();
      refreshUserProfile();
    },
    onError: (error: AxiosError<IErrorResponse>) => {
      toast.error(error.response?.data.error || "Failed to verify 2FA code");
    },
  });

  const handleSubmitEmail = useCallback(
    (data: z.infer<typeof emailFormSchema>) => {
      changeEmailMutation.mutate({ new_email: data.email });
    },
    [changeEmailMutation]
  );

  const handleSubmitPassword = useCallback(
    async (data: z.infer<typeof passwordFormSchema>) => {
      changePasswordMutation.mutate({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
    },
    [changePasswordMutation]
  );

  const handleSubmitTwoFA = useCallback(
    async (data: z.infer<typeof twoFaFormSchema>) => {
      if (data.twoFaEnable) {
        twoFaSetupMutation.mutate({ enable: true });
      } else {
        setTwoFaVerifyModalOpen(true);
      }
    },
    [twoFaSetupMutation]
  );

  const handleTwoFAVerify = useCallback(
    async (data: z.infer<typeof twoFaSetupSchema>) => {
      if (!twoFaForm.getValues().twoFaEnable) {
        // Disabling 2FA: call setup2FA with enable: false and token
        twoFaSetupMutation.mutate({ enable: false, token: data.twoFACode });
        setTwoFaVerifyModalOpen(false);
        twoFaSetupForm.reset();
      } else {
        // Enabling 2FA: call verify2FA
        twoFaVerifyMutation.mutate({ token: data.twoFACode });
      }
    },
    [twoFaForm, twoFaSetupMutation, twoFaVerifyMutation, twoFaSetupForm]
  );

  return (
    <MainContentWrapper title="User Settings" className="flex flex-row gap-28">
      <section className="space-y-8 flex-1 max-w-sm">
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(handleSubmitEmail)}
            className="space-y-6"
          >
            <div>
              <h3 className="mb-4 text-lg font-medium">Change Email</h3>
              <div className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your new email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit" disabled={changeEmailMutation.isPending}>
              {changeEmailMutation.isPending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Please wait
                </>
              ) : (
                "Update Email"
              )}
            </Button>
          </form>
        </Form>

        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(handleSubmitPassword)}
            className="space-y-6"
          >
            <div>
              <h3 className="mb-4 text-lg font-medium">Change Password</h3>
              <div className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your current password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your new password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your new password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Please wait
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </Form>
      </section>

      <section className="space-y-8 flex-1 max-w-sm">
        <TwoFactorSection
          twoFaForm={twoFaForm}
          onSubmit={handleSubmitTwoFA}
          isDirty={twoFaForm.formState.isDirty}
        />
      </section>
      <TwoFactorDialogs
        setupModalOpen={twoFaSetupModalOpen}
        setSetupModalOpen={setTwoFaSetupModalOpen}
        verifyModalOpen={twoFaVerifyModalOpen}
        setVerifyModalOpen={setTwoFaVerifyModalOpen}
        setupMutation={twoFaSetupMutation}
        setupForm={twoFaSetupForm}
        handleVerify={handleTwoFAVerify}
        verifyMutation={twoFaVerifyMutation}
      />
    </MainContentWrapper>
  );
};

export default UserSettings;
