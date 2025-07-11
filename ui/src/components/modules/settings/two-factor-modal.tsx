import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { IErrorResponse } from "@/types/response";
import { UseMutationResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import QRCode from "react-qr-code";
import z from "zod";
import { twoFaSetupSchema } from "./schema";

const TwoFactorDialogs: React.FC<{
  setupModalOpen: boolean;
  setSetupModalOpen: (open: boolean) => void;
  verifyModalOpen: boolean;
  setVerifyModalOpen: (open: boolean) => void;
  setupMutation: UseMutationResult<
    // Data type returned by setup2FA
    { otpauth_url?: string; secret?: string },
    AxiosError<IErrorResponse>,
    { enable: boolean; token?: string }
  >;
  setupForm: ReturnType<typeof useForm<z.infer<typeof twoFaSetupSchema>>>;
  handleVerify: (data: z.infer<typeof twoFaSetupSchema>) => void;
  verifyMutation: UseMutationResult<
    // Data type returned by verify2FA
    unknown,
    AxiosError<IErrorResponse>,
    { token: string }
  >;
}> = ({
  setupModalOpen,
  setSetupModalOpen,
  verifyModalOpen,
  setVerifyModalOpen,
  setupMutation,
  setupForm,
  handleVerify,
  verifyMutation,
}) => (
  <>
    <Dialog open={setupModalOpen} onOpenChange={setSetupModalOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Set up Two-Factor Authentication (2FA) to enhance your account
            security.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {setupMutation.data?.otpauth_url && (
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-white p-3 rounded-lg border-2 border-gray-100 shadow-sm">
                <QRCode value={setupMutation.data?.otpauth_url} size={140} />
              </div>
              <p className="text-xs text-gray-600 text-center max-w-sm">
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.)
              </p>
            </div>
          )}
          {setupMutation.data?.secret && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Can't scan? Enter this key manually:
              </h4>
              <div className="bg-white p-2 rounded border border-gray-300 font-mono text-xs text-gray-800 break-all select-all cursor-pointer hover:bg-gray-50 transition-colors">
                {setupMutation.data?.secret}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            className="w-full"
            onClick={() => {
              setVerifyModalOpen(true);
              setSetupModalOpen(false);
            }}
          >
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Verify Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app to verify 2FA.
          </DialogDescription>
        </DialogHeader>
        <Form {...setupForm}>
          <form
            onSubmit={setupForm.handleSubmit(handleVerify)}
            className="space-y-6"
          >
            <FormField
              control={setupForm.control}
              name="twoFACode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      containerClassName="mx-auto"
                      maxLength={6}
                      {...field}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage className="mx-auto" />
                  <FormDescription className="mx-auto">
                    Enter the 6-digit code from your authenticator app.
                  </FormDescription>
                </FormItem>
              )}
            />
            <Button
              className="w-full"
              type="submit"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Please wait
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  </>
);
export default TwoFactorDialogs;
