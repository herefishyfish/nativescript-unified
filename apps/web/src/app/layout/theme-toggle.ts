import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { ThemeService } from '../core/theme';

@Component({
  selector: 'web-theme-toggle',
  imports: [HlmButton, NgIcon],
  providers: [provideIcons({ lucideMoon, lucideSun })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button hlmBtn variant="ghost" size="icon" type="button" aria-label="Dark mode" [attr.aria-pressed]="theme.dark()" data-testid="theme-toggle" (click)="theme.toggle()">
      <ng-icon [name]="theme.dark() ? 'lucideSun' : 'lucideMoon'" size="18" aria-hidden="true" />
    </button>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
}