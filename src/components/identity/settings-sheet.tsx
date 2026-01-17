'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';

import { useIdentity } from '@/contexts/identity-context';
import { toast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const changePassphraseSchema = z
  .object({
    newPassphrase: z
      .string()
      .min(4, 'Passphrase must be at least 4 characters')
      .max(100, 'Passphrase must be less than 100 characters'),
    confirmPassphrase: z.string(),
  })
  .refine((data) => data.newPassphrase === data.confirmPassphrase, {
    message: 'Passphrases must match',
    path: ['confirmPassphrase'],
  });

type ChangePassphraseFormData = z.infer<typeof changePassphraseSchema>;

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Settings sheet for managing identity.
 * Allows users to change their passphrase.
 */
export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { setPassphrase } = useIdentity();
  const [showNewPassphrase, setShowNewPassphrase] = useState(false);
  const [showConfirmPassphrase, setShowConfirmPassphrase] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChangePassphraseFormData>({
    resolver: zodResolver(changePassphraseSchema),
    defaultValues: {
      newPassphrase: '',
      confirmPassphrase: '',
    },
  });

  const onSubmit = async (data: ChangePassphraseFormData) => {
    setIsSubmitting(true);
    try {
      await setPassphrase(data.newPassphrase);
      toast({
        title: 'Passphrase updated',
        description: 'Your new passphrase has been saved.',
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update passphrase:', error);
      toast({
        title: 'Error',
        description: 'Failed to update passphrase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when sheet closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setShowNewPassphrase(false);
      setShowConfirmPassphrase(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Manage your identity</SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-4">Change Passphrase</h3>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassphrase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Passphrase</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassphrase ? 'text' : 'password'}
                          placeholder="Enter new passphrase"
                          autoComplete="off"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassphrase(!showNewPassphrase)}
                          tabIndex={-1}
                        >
                          {showNewPassphrase ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showNewPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassphrase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Passphrase</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassphrase ? 'text' : 'password'}
                          placeholder="Confirm new passphrase"
                          autoComplete="off"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassphrase(!showConfirmPassphrase)}
                          tabIndex={-1}
                        >
                          {showConfirmPassphrase ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Passphrase'}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
