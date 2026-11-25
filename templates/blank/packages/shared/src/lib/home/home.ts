import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';

/** The home screen. Both apps render it, so it uses HTML, Tailwind classes and helm components only. */
@Component({
  selector: 'app-home',
  imports: [HlmButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-4 p-4 bg-background text-foreground">
      <h1 class="text-2xl font-bold">Blank app</h1>
      <p class="text-muted-foreground">Edit packages/shared/src/lib/home/home.ts to change this screen on web and native.</p>
      <button hlmBtn type="button" (click)="increment()">Count: {{ count() }}</button>
    </div>
  `,
})
export class Home {
  protected readonly count = signal(0);

  protected increment(): void {
    this.count.update((n) => n + 1);
  }
}
