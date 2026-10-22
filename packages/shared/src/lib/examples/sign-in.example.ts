import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideApple,
  lucideArrowRight,
  lucideCircleCheck,
  lucideEye,
  lucideEyeOff,
  lucideFingerprint,
  lucideGitBranch,
  lucideLock,
  lucideMail,
  lucideMoon,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';

type Status = 'editing' | 'submitting' | 'signed-in';

type Provider = { readonly id: string; readonly label: string; readonly icon: string };

const PROVIDERS: readonly Provider[] = [
  { id: 'apple', label: 'Apple', icon: 'lucideApple' },
  { id: 'github', label: 'GitHub', icon: 'lucideGitBranch' },
  { id: 'passkey', label: 'Passkey', icon: 'lucideFingerprint' },
];

const STRENGTH_LABELS = ['Too short', 'Weak', 'Okay', 'Strong', 'Excellent'] as const;

/** A moody sign-in screen: signal-driven validation, a show/hide password toggle, a strength meter, social sign-in and a success state. */
@Component({
  selector: 'example-sign-in',
  imports: [NgIcon, HlmButton, HlmCardImports, HlmInput, HlmLabel, HlmSeparator, HlmSwitchImports],
  providers: [
    provideIcons({
      lucideApple,
      lucideArrowRight,
      lucideCircleCheck,
      lucideEye,
      lucideEyeOff,
      lucideFingerprint,
      lucideGitBranch,
      lucideLock,
      lucideMail,
      lucideMoon,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-sign-in' },
  template: `
    <div class="page flex flex-col gap-6 px-5 py-8 text-foreground">
      <div class="flex flex-col items-center gap-3">
        <div class="logo flex items-center justify-center w-20 h-20 rounded-3xl">
          <ng-icon name="lucideMoon" class="logo-glyph text-4xl" />
        </div>
        <span class="text-xs font-bold tracking-widest text-primary">NOCTURNE</span>
        <span class="text-4xl font-extrabold text-center text-foreground">
          {{ status() === 'signed-in' ? 'You are in.' : 'Welcome back' }}
        </span>
        <span class="text-sm text-center text-muted-foreground">
          {{ status() === 'signed-in' ? 'Your night shift starts now.' : 'Sign in to pick up where you left off.' }}
        </span>
      </div>

      @if (status() === 'signed-in') {
        <div hlmCard class="border border-border">
          <div hlmCardContent class="flex flex-col items-center gap-4">
            <div class="success-ring flex items-center justify-center w-16 h-16 rounded-full">
              <ng-icon name="lucideCircleCheck" class="success-glyph text-4xl" />
            </div>
            <span class="text-xl font-bold text-card-foreground">Signed in as {{ handle() }}</span>
            <span class="text-sm text-muted-foreground">{{ email() }}</span>
            <span class="text-xs text-center text-muted-foreground">{{ remember() ? 'This device will remember you for 30 days.' : 'You will be signed out when you close the app.' }}</span>
            <button hlmBtn variant="outline" size="lg" class="w-full" (click)="signOut()">Sign out</button>
          </div>
        </div>
      } @else {
        <div hlmCard class="border border-border">
          <div hlmCardContent class="flex flex-col gap-5">
            <div class="flex flex-col gap-2">
              <label hlmLabel for="sign-in-email" class="flex flex-row items-center gap-2">
                <ng-icon name="lucideMail" class="text-sm text-primary" />
                <span>Email</span>
              </label>
              <input
                hlmInput
                id="sign-in-email"
                class="h-11"
                type="email"
                placeholder="you@nocturne.app"
                autocomplete="email"
                [forceInvalid]="!!emailError()"
                [value]="email()"
                (input)="email.set(valueOf($event))"
                (blur)="emailTouched.set(true)"
              />
              @if (emailError(); as error) {
                <span class="text-xs text-destructive">{{ error }}</span>
              }
            </div>

            <div class="flex flex-col gap-2">
              <label hlmLabel for="sign-in-password" class="flex flex-row items-center gap-2">
                <ng-icon name="lucideLock" class="text-sm text-primary" />
                <span>Password</span>
              </label>
              <div class="flex flex-row items-center gap-2">
                <input
                  hlmInput
                  id="sign-in-password"
                  class="h-11 flex-1"
                  placeholder="At least 8 characters"
                  autocomplete="current-password"
                  [type]="showPassword() ? 'text' : 'password'"
                  [forceInvalid]="!!passwordError()"
                  [value]="password()"
                  (input)="password.set(valueOf($event))"
                  (blur)="passwordTouched.set(true)"
                />
                <button hlmBtn variant="outline" size="icon-lg" class="h-11 w-11" (click)="showPassword.set(!showPassword())">
                  <ng-icon [name]="showPassword() ? 'lucideEyeOff' : 'lucideEye'" />
                </button>
              </div>
              <div class="flex flex-row items-center gap-2">
                @for (segment of segments; track segment) {
                  <div class="flex-1 h-1 rounded-full bg-muted" [class]="segment < strength() ? 'meter-on-' + strength() : ''"></div>
                }
                <span class="text-xs text-right text-muted-foreground w-16">{{ strengthLabel() }}</span>
              </div>
              @if (passwordError(); as error) {
                <span class="text-xs text-destructive">{{ error }}</span>
              }
            </div>

            <div class="flex flex-row items-center justify-between">
              <div class="flex flex-row items-center gap-2">
                <hlm-switch [checked]="remember()" (checkedChange)="remember.set($event)" />
                <span class="text-sm text-muted-foreground">Remember me</span>
              </div>
              <button hlmBtn variant="link" size="sm" (click)="notice.set('We sent a reset link to your inbox.')">Forgot password?</button>
            </div>

            <button hlmBtn size="lg" class="cta w-full h-12 rounded-xl text-base font-bold" [disabled]="status() === 'submitting'" (click)="submit()">
              {{ status() === 'submitting' ? 'Signing in…' : 'Sign in' }}
              @if (status() === 'editing') {
                <ng-icon name="lucideArrowRight" />
              }
            </button>
          </div>
        </div>

        <div class="flex flex-row items-center gap-3">
          <div hlmSeparator class="flex-1"></div>
          <span class="text-xs text-muted-foreground">or continue with</span>
          <div hlmSeparator class="flex-1"></div>
        </div>

        <div class="flex flex-row gap-3">
          @for (provider of providers; track provider.id) {
            <button hlmBtn variant="outline" size="lg" class="flex-1 h-12 rounded-xl" (click)="notice.set(provider.label + ' sign-in is a demo here.')">
              <ng-icon [name]="provider.icon" />
              {{ provider.label }}
            </button>
          }
        </div>

        @if (notice(); as notice) {
          <div class="flex flex-row items-center gap-2 px-4 py-3 rounded-xl border border-border bg-accent">
            <span class="text-sm flex-1 text-accent-foreground">{{ notice }}</span>
          </div>
        }

        <p class="text-sm text-center text-muted-foreground">New to Nocturne? <strong class="text-primary">Create an account</strong></p>
      }
    </div>
  `,
})
export class SignInExample {
  protected readonly providers = PROVIDERS;
  protected readonly segments = [0, 1, 2, 3] as const;

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly emailTouched = signal(false);
  protected readonly passwordTouched = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly remember = signal(true);
  protected readonly notice = signal('');
  protected readonly status = signal<Status>('editing');
  private readonly attempted = signal(false);

  protected readonly emailError = computed(() => {
    if (!this.emailTouched() && !this.attempted()) return '';
    const email = this.email().trim();
    if (!email) return 'Enter your email address.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'That does not look like an email address.';
  });

  protected readonly passwordError = computed(() => {
    if (!this.passwordTouched() && !this.attempted()) return '';
    const password = this.password();
    if (!password) return 'Enter your password.';
    return password.length < 8 ? `Use at least 8 characters (${8 - password.length} to go).` : '';
  });

  /** 0 to 4: length gate first, then one point each for case mix, digits and symbols. */
  protected readonly strength = computed(() => {
    const password = this.password();
    if (password.length < 8) return 0;
    return 1 + Number(/[a-z]/.test(password) && /[A-Z]/.test(password)) + Number(/\d/.test(password)) + Number(/[^A-Za-z0-9]/.test(password));
  });
  protected readonly strengthLabel = computed(() => (this.password() ? STRENGTH_LABELS[this.strength()] : ''));

  protected readonly handle = computed(() => this.email().split('@')[0]);

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected submit(): void {
    this.attempted.set(true);
    this.notice.set('');
    if (this.emailError() || this.passwordError()) return;
    this.status.set('submitting');
    setTimeout(() => this.status.set('signed-in'), 900);
  }

  protected signOut(): void {
    this.status.set('editing');
    this.password.set('');
    this.attempted.set(false);
    this.passwordTouched.set(false);
  }
}
