import { useForm } from "react-hook-form";
import { twoFaFormSchema } from "./schema";
import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const TwoFactorSection: React.FC<{
  twoFaForm: ReturnType<typeof useForm<z.infer<typeof twoFaFormSchema>>>;
  onSubmit: (data: z.infer<typeof twoFaFormSchema>) => void;
  isDirty: boolean;
}> = ({ twoFaForm, onSubmit, isDirty }) => (
  <Form {...twoFaForm}>
    <form onSubmit={twoFaForm.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium">
          Two-Factor Authentication (2FA)
        </h3>
        <div className="space-y-4">
          <FormField
            control={twoFaForm.control}
            name="twoFaEnable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Enable Two-Factor Authentication</FormLabel>
                  <FormDescription>
                    Add an extra layer of security to your account.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
      <Button disabled={!isDirty} type="submit">
        Save Settings
      </Button>
    </form>
  </Form>
);
export default TwoFactorSection;
