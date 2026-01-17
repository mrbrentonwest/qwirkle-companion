'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useIdentity } from '@/contexts/identity-context';
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

const passphraseSchema = z.object({
  passphrase: z
    .string()
    .min(4, 'Passphrase must be at least 4 characters')
    .max(100, 'Passphrase must be less than 100 characters'),
});

type PassphraseFormData = z.infer<typeof passphraseSchema>;

interface PassphraseDialogProps {
  open: boolean;
}

/**
 * Non-dismissible dialog for first-time users to enter their passphrase.
 * Cannot be closed without entering a valid passphrase.
 */
export function PassphraseDialog({ open }: PassphraseDialogProps) {
  const { setPassphrase } = useIdentity();
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PassphraseFormData>({
    resolver: zodResolver(passphraseSchema),
    defaultValues: {
      passphrase: '',
    },
  });

  const onSubmit = async (data: PassphraseFormData) => {
    setIsSubmitting(true);
    try {
      await setPassphrase(data.passphrase);
      // Dialog closes automatically when identity is set (open becomes false)
    } catch (error) {
      console.error('Failed to set passphrase:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open}>
      <DialogPrimitive.Portal>
        {/* Overlay - no onClick to dismiss */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/80',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />
        {/* Content - no close button, onEscapeKeyDown prevented */}
        <DialogPrimitive.Content
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
            'gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]'
          )}
        >
          {/* Header */}
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">
              Welcome to Qwirkle Companion
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              Enter a passphrase to identify yourself. This will be used to sync your games across devices.
            </DialogPrimitive.Description>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="passphrase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passphrase</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassphrase ? 'text' : 'password'}
                          placeholder="Enter your passphrase"
                          autoComplete="off"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassphrase(!showPassphrase)}
                          tabIndex={-1}
                        >
                          {showPassphrase ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Footer */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Continuing...' : 'Continue'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
