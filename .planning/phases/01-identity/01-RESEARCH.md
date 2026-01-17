# Phase 1: Identity - Research

**Researched:** 2026-01-17
**Domain:** Client-side user identity with localStorage persistence (Next.js 15, React 19)
**Confidence:** HIGH

## Summary

This phase implements passphrase-based user identification where users enter a passphrase that gets hashed to create a unique user ID, stored in localStorage for persistence. The existing codebase already has the necessary UI components (Sheet, Dialog, Avatar, Form, Input) from shadcn/ui and the validation libraries (Zod, React Hook Form with resolver).

The implementation requires:
1. A localStorage hook that handles SSR/hydration safely
2. SHA-256 hashing via Web Crypto API for passphrase-to-ID conversion
3. React Context for identity state management
4. Form components using existing React Hook Form + Zod patterns
5. Settings sheet triggered by avatar tap (per CONTEXT.md decisions)

**Primary recommendation:** Use the existing shadcn/ui components and validation stack. Create a custom `useLocalStorage` hook with proper SSR guards. Use Web Crypto API's `crypto.subtle.digest` for SHA-256 hashing. Wrap identity state in a React Context provider at the app root.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.54.2 | Form state management | Industry standard for React forms |
| @hookform/resolvers | ^4.1.3 | Validation integration | Official RHF resolver for Zod |
| zod | ^3.24.2 | Schema validation | Type-safe validation with inference |
| @radix-ui/react-dialog | ^1.1.6 | Modal/sheet primitives | shadcn/ui foundation |
| @radix-ui/react-avatar | ^1.1.3 | Avatar component | shadcn/ui foundation |
| lucide-react | ^0.475.0 | Icons | User icon for avatar fallback |

### Supporting (No Additional Install Needed)
| Library | Purpose | When to Use |
|---------|---------|-------------|
| Web Crypto API | SHA-256 hashing | Built into all modern browsers |
| React Context | Identity state | Built into React 19 |
| localStorage | Persistence | Built into browsers |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Web Crypto SHA-256 | crypto-js library | Web Crypto is native, no bundle size |
| React Context | Zustand | Overkill for simple identity state |
| Custom hook | usehooks-ts | Adding dependency for one hook |

**Installation:**
```bash
# No additional packages needed - all required libraries already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── contexts/
│   └── identity-context.tsx    # Identity provider and hook
├── hooks/
│   └── use-local-storage.ts    # SSR-safe localStorage hook
├── lib/
│   ├── identity.ts             # Passphrase hashing utilities
│   └── types.ts                # Add UserIdentity type
├── components/
│   └── identity/
│       ├── passphrase-dialog.tsx   # Initial entry modal
│       ├── settings-sheet.tsx      # Settings overlay
│       └── user-avatar.tsx         # Avatar trigger component
```

### Pattern 1: SSR-Safe localStorage Hook
**What:** Custom hook that safely accesses localStorage without hydration mismatches
**When to use:** Any localStorage read/write in Next.js 15

```typescript
// Source: https://usehooks-ts.com/react-hook/use-local-storage (pattern verified)
import { useState, useEffect, useCallback } from 'react';

const IS_SERVER = typeof window === 'undefined';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Always start with initialValue for SSR
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    if (IS_SERVER) return;

    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsHydrated(true);
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    if (IS_SERVER) return;

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
      // Dispatch event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', { key }));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    if (IS_SERVER) return;

    try {
      setStoredValue(initialValue);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
```

### Pattern 2: Web Crypto SHA-256 Hashing
**What:** Hash passphrase to create deterministic user ID
**When to use:** Converting user passphrase to unique identifier

```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export async function hashPassphrase(passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passphrase.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
```

### Pattern 3: Identity Context Provider
**What:** React Context for identity state across app
**When to use:** Accessing user identity in any component

```typescript
// Source: Kent C. Dodds pattern - https://kentcdodds.com/blog/how-to-use-react-context-effectively
interface IdentityContextValue {
  userId: string | null;
  passphrase: string | null;
  isLoading: boolean;
  isIdentified: boolean;
  setPassphrase: (passphrase: string) => Promise<void>;
  clearIdentity: () => void;
}

const IdentityContext = createContext<IdentityContextValue | undefined>(undefined);

export function useIdentity() {
  const context = useContext(IdentityContext);
  if (context === undefined) {
    throw new Error('useIdentity must be used within an IdentityProvider');
  }
  return context;
}
```

### Pattern 4: React Hook Form + Zod Validation
**What:** Type-safe form validation for passphrase input
**When to use:** Passphrase entry and change forms

```typescript
// Source: https://ui.shadcn.com/docs/forms/react-hook-form
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const passphraseSchema = z.object({
  passphrase: z.string()
    .min(4, 'Passphrase must be at least 4 characters')
    .max(100, 'Passphrase must be less than 100 characters'),
});

const changePassphraseSchema = z.object({
  newPassphrase: z.string()
    .min(4, 'Passphrase must be at least 4 characters')
    .max(100, 'Passphrase must be less than 100 characters'),
  confirmPassphrase: z.string(),
}).refine(data => data.newPassphrase === data.confirmPassphrase, {
  message: 'Passphrases must match',
  path: ['confirmPassphrase'],
});

type PassphraseFormData = z.infer<typeof passphraseSchema>;
```

### Anti-Patterns to Avoid
- **Direct localStorage access in render:** Causes hydration mismatch. Always use useEffect or custom hook.
- **Storing passphrase in plain text permanently:** Store hashed userId, only keep passphrase in memory during session if needed.
- **Using typeof window check inline:** Use a constant like `IS_SERVER` to avoid bundle issues.
- **Context re-render on every change:** Memoize context value object to prevent unnecessary re-renders.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | Zod + react-hook-form | Type inference, error handling, edge cases |
| Modal/sheet UI | Custom modal | Radix Dialog/Sheet | Accessibility, focus trapping, animations |
| Avatar display | Custom div | Radix Avatar | Fallback handling, image loading states |
| Input styling | Custom input | shadcn/ui Input | Consistent styling, accessibility |
| Toast notifications | Alert/banner | Existing Toaster | Already in layout, consistent UX |

**Key insight:** The project already has shadcn/ui components with Radix primitives. These handle accessibility (ARIA, focus management, keyboard navigation) correctly. Building custom modals or inputs would miss these features.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with localStorage
**What goes wrong:** Server renders without localStorage value, client hydrates with value, React throws hydration error
**Why it happens:** localStorage only exists in browser, SSR has no access
**How to avoid:**
- Always initialize state with default value
- Use `useEffect` to hydrate from localStorage after mount
- Return loading state until hydrated if UI depends on identity
**Warning signs:** Console error "Text content does not match server-rendered HTML"

### Pitfall 2: Safari Private Mode localStorage
**What goes wrong:** `localStorage.setItem()` throws QUOTA_EXCEEDED_ERR even for small values
**Why it happens:** Safari private mode sets quota to 0
**How to avoid:**
- Wrap all localStorage operations in try-catch
- Test with actual setItem, not just existence check
- Provide graceful degradation (in-memory fallback or session-only mode)
**Warning signs:** Error code DOMException.QUOTA_EXCEEDED_ERR with localStorage.length === 0

### Pitfall 3: Missing Type Safety on Stored Data
**What goes wrong:** localStorage returns corrupted/unexpected data shape, app crashes
**Why it happens:** Manual JSON.parse without validation
**How to avoid:**
- Validate retrieved data against Zod schema
- Handle parse errors gracefully
- Default to initial value on invalid data
**Warning signs:** Runtime errors on property access of stored objects

### Pitfall 4: Show/Hide Password UX
**What goes wrong:** Users mistype passphrase with masked input, get frustrated
**Why it happens:** Masked inputs prevent typo detection
**How to avoid:**
- Include show/hide toggle on passphrase input
- For passphrase change, require confirmation field as decided in CONTEXT.md
- Consider showing passphrase by default (it's not a security-sensitive password)
**Warning signs:** User complaints about "wrong passphrase" when they mistyped

### Pitfall 5: Modal Close Without Passphrase
**What goes wrong:** First-time users close passphrase modal and are stuck without identity
**Why it happens:** Modal allows dismissal before passphrase entry
**How to avoid:**
- Make initial passphrase entry modal non-dismissible (no X button, no backdrop close)
- Or auto-generate temporary identity with prompt to set passphrase later
**Warning signs:** Users with null identity trying to use features

## Code Examples

Verified patterns from official sources:

### localStorage Detection with Safari Fallback
```typescript
// Source: https://trackjs.com/javascript-errors/failed-to-execute-setitem-on-storage/
function isLocalStorageAvailable(): boolean {
  const testKey = '__storage_test__';
  try {
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}
```

### Form with Zod Resolver (shadcn pattern)
```typescript
// Source: https://ui.shadcn.com/docs/forms/react-hook-form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({
  passphrase: z.string().min(4, 'Passphrase must be at least 4 characters'),
});

function PassphraseForm({ onSubmit }: { onSubmit: (passphrase: string) => void }) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { passphrase: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => onSubmit(data.passphrase))}>
        <FormField
          control={form.control}
          name="passphrase"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passphrase</FormLabel>
              <FormControl>
                <Input placeholder="Enter your passphrase" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Continue</Button>
      </form>
    </Form>
  );
}
```

### Avatar with User Icon Fallback
```typescript
// Source: https://ui.shadcn.com/docs/components/avatar + lucide-react
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

function UserAvatar({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
      <Avatar>
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
    </button>
  );
}
```

### Sheet for Settings (per CONTEXT.md decision)
```typescript
// Source: https://ui.shadcn.com/docs/components/sheet
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

function SettingsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Manage your identity</SheetDescription>
        </SheetHeader>
        {/* Change passphrase form here */}
      </SheetContent>
    </Sheet>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| crypto-js library | Web Crypto API | 2020+ | Native, no bundle size, better security |
| useEffect for forms | react-hook-form | 2020+ | Less re-renders, better DX |
| yup validation | Zod | 2022+ | Better TypeScript inference |
| Manual modal | Radix primitives | 2021+ | Accessibility built-in |
| window check inline | IS_SERVER constant | Current | Cleaner, avoids bundler issues |

**Deprecated/outdated:**
- **crypto-js:** Not needed when Web Crypto API available (all modern browsers)
- **componentDidMount localStorage:** Use hooks pattern with useEffect
- **Confirm password without show/hide:** Industry moving away from double-entry

## Open Questions

Things that couldn't be fully resolved:

1. **Passphrase minimum length**
   - What we know: 4 characters is typical minimum, but passphrases are meant to be longer
   - What's unclear: Whether to encourage longer (8+) or keep simple for casual game app
   - Recommendation: Start with 4 minimum, can add strength indicator later if desired

2. **Cross-tab identity sync**
   - What we know: StorageEvent can sync across tabs
   - What's unclear: Whether app needs this (single-tab usage expected?)
   - Recommendation: Implement basic sync for robustness, but not critical for v1

3. **Offline/fallback behavior**
   - What we know: Safari private mode may block localStorage
   - What's unclear: Should app work without persistence at all?
   - Recommendation: Show warning toast if localStorage unavailable, continue with in-memory

## Sources

### Primary (HIGH confidence)
- [MDN SubtleCrypto.digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) - SHA-256 hashing API
- [Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error) - Official SSR guidance
- [shadcn/ui Forms](https://ui.shadcn.com/docs/forms/react-hook-form) - Form pattern with RHF + Zod
- [usehooks-ts useLocalStorage](https://usehooks-ts.com/react-hook/use-local-storage) - SSR-safe hook pattern

### Secondary (MEDIUM confidence)
- [Kent C. Dodds Context Pattern](https://kentcdodds.com/blog/how-to-use-react-context-effectively) - Context best practices
- [CXL Password UX](https://cxl.com/blog/password-ux/) - Show/hide toggle recommendation
- [TrackJS localStorage Errors](https://trackjs.com/javascript-errors/failed-to-execute-setitem-on-storage/) - Safari fallback pattern

### Tertiary (LOW confidence)
- [Medium useLocalStorage article](https://medium.com/@lean1190/uselocalstorage-hook-for-next-js-typed-and-ssr-friendly-4ddd178676df) - Additional SSR patterns
- [DEV.to State Management 2025](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k) - Context vs other options

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed, patterns well-documented
- Architecture: HIGH - Based on official shadcn/ui and React patterns
- Pitfalls: HIGH - Well-documented SSR/localStorage issues with clear solutions

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - stable domain, minimal churn)
