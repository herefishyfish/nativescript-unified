import { ActionBarComponent } from '@nativescript/angular';
import { ChangeDetectionStrategy, Component, inject, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogImports, HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';

/** Opened through HlmDialogService.open(), with its context passed as data. */
@Component({
  selector: 'overlays-greeting',
  imports: [HlmButton, HlmDialogImports],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-dialog-header>
      <h3 hlmDialogTitle>Hello, {{ context.name }}</h3>
      <p hlmDialogDescription>This dialog was opened from code with HlmDialogService.</p>
    </hlm-dialog-header>
    <hlm-dialog-footer>
      <button hlmBtn (click)="context.close('greeted')">Done</button>
    </hlm-dialog-footer>
  `,
})
class OverlaysGreeting {
  protected readonly context = injectBrnDialogContext<{ name: string; close: (result: string) => void }>();
}

/** Spartan's dialog, alert dialog, drawer, sheet, popover and dropdown menu, each opened in a native window. */
@Component({
  selector: 'overlays-page',
  imports: [
    ActionBarComponent,
    HlmButton,
    HlmDialogImports,
    HlmAlertDialogImports,
    HlmDrawerImports,
    HlmDropdownMenuImports,
    HlmSheetImports,
    HlmPopoverImports,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ActionBar title="Overlays" />
    <scroll>
      <div class="flex flex-col gap-4 p-4 bg-background text-foreground">
        <p class="text-sm text-muted-foreground" data-testid="last-result">Last result: {{ lastResult() }}</p>

        <hlm-dialog (closed)="lastResult.set('dialog: ' + $event)">
          <button hlmBtn hlmDialogTrigger variant="outline">Open dialog</button>
          <hlm-dialog-content *hlmDialogPortal="let ctx">
            <hlm-dialog-header>
              <h3 hlmDialogTitle>Edit profile</h3>
              <p hlmDialogDescription>Make changes to your profile, then save.</p>
            </hlm-dialog-header>
            <hlm-dialog-footer>
              <button hlmBtn variant="outline" (click)="ctx.close('cancelled')">Cancel</button>
              <button hlmBtn (click)="ctx.close('saved')">Close</button>
            </hlm-dialog-footer>
          </hlm-dialog-content>
        </hlm-dialog>

        <hlm-alert-dialog (closed)="lastResult.set('alert: ' + $event)">
          <button hlmBtn hlmAlertDialogTrigger variant="destructive">Delete account</button>
          <hlm-alert-dialog-content *hlmAlertDialogPortal="let ctx">
            <hlm-alert-dialog-header>
              <h3 hlmAlertDialogTitle>Are you sure?</h3>
              <p hlmAlertDialogDescription>This cannot be undone.</p>
            </hlm-alert-dialog-header>
            <hlm-alert-dialog-footer>
              <button hlmAlertDialogCancel (click)="ctx.close('cancel')">Cancel</button>
              <button hlmAlertDialogAction (click)="ctx.close('continue')">Continue</button>
            </hlm-alert-dialog-footer>
          </hlm-alert-dialog-content>
        </hlm-alert-dialog>

        <hlm-drawer (closed)="lastResult.set('drawer: ' + $event)">
          <button hlmBtn hlmDrawerTrigger variant="outline">Open drawer</button>
          <hlm-drawer-content *hlmDrawerPortal="let ctx">
            <div hlmDrawerHeader>
              <h3 hlmDrawerTitle>Move goal</h3>
              <p hlmDrawerDescription>Set your daily activity goal.</p>
            </div>
            <div hlmDrawerFooter>
              <button hlmBtn (click)="ctx.close('submitted')">Submit</button>
              <button hlmBtn hlmDrawerClose variant="outline">Cancel</button>
            </div>
          </hlm-drawer-content>
        </hlm-drawer>

        @for (sheet of sheets; track sheet.label) {
          <hlm-sheet
            [side]="sheet.side"
            [closeOnOutsidePointerEvents]="sheet.closeOnBackdrop"
            (closed)="lastResult.set(sheet.result + ': ' + $event)"
          >
            <button hlmBtn hlmSheetTrigger variant="outline">{{ sheet.label }}</button>
            <hlm-sheet-content *hlmSheetPortal="let ctx">
              <div hlmSheetHeader>
                <h3 hlmSheetTitle>Settings</h3>
                <p hlmSheetDescription>{{ sheet.description }}</p>
              </div>
              <div hlmSheetFooter>
                <button hlmBtn (click)="ctx.close('applied')">Apply</button>
                <button hlmBtn variant="outline" (click)="ctx.close('cancelled')">Cancel</button>
              </div>
            </hlm-sheet-content>
          </hlm-sheet>
        }

        <hlm-popover>
          <button hlmBtn hlmPopoverTrigger variant="outline">Open popover</button>
          <hlm-popover-content *hlmPopoverPortal="let ctx" class="w-72">
            <div hlmPopoverHeader>
              <div hlmPopoverTitle>Dimensions</div>
              <p hlmPopoverDescription>Set the dimensions for the layer.</p>
            </div>
            <button hlmBtn size="sm" (click)="ctx.close()">Done</button>
          </hlm-popover-content>
        </hlm-popover>

        <button hlmBtn variant="outline" [hlmDropdownMenuTrigger]="menu">Open menu</button>
        <ng-template #menu>
          <hlm-dropdown-menu class="w-56">
            <button hlmDropdownMenuItem (triggered)="lastResult.set('menu: profile')">Profile</button>
            <button hlmDropdownMenuCheckbox [checked]="statusBar()" (triggered)="toggleStatusBar()">
              <hlm-dropdown-menu-checkbox-indicator />
              Status bar
            </button>
            <button hlmDropdownMenuItem disabled>Billing</button>
            <button hlmDropdownMenuItem variant="destructive" (triggered)="lastResult.set('menu: log out')">Log out</button>
          </hlm-dropdown-menu>
        </ng-template>

        <button hlmBtn variant="secondary" (click)="openFromService()">Open from service</button>
      </div>
    </scroll>
  `,
})
export default class OverlaysPage {
  private readonly _dialogs = inject(HlmDialogService);
  protected readonly sheets = [
    {
      side: 'left',
      label: 'Open left sheet',
      result: 'left sheet',
      closeOnBackdrop: true,
      description: 'A left sheet docks to the left edge.',
    },
    {
      side: 'right',
      label: 'Open right sheet',
      result: 'right sheet',
      closeOnBackdrop: true,
      description: 'A right sheet docks to the right edge.',
    },
    {
      side: 'top',
      label: 'Open top sheet',
      result: 'top sheet',
      closeOnBackdrop: true,
      description: 'A top sheet docks to the top edge.',
    },
    {
      side: 'right',
      label: 'Open right sheet (backdrop ignored)',
      result: 'pinned sheet',
      closeOnBackdrop: false,
      description: 'A tap on the backdrop leaves this sheet open.',
    },
  ] as const;
  protected readonly lastResult = signal('none');
  protected readonly statusBar = signal(true);

  protected toggleStatusBar(): void {
    this.statusBar.update((shown) => !shown);
    this.lastResult.set('menu: status bar ' + (this.statusBar() ? 'on' : 'off'));
  }

  protected openFromService(): void {
    const ref = this._dialogs.open<string>(OverlaysGreeting, { context: { name: 'Dylan' } });
    ref.closed$.subscribe((result) => this.lastResult.set('service: ' + result));
  }
}
