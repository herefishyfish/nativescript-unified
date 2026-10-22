import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { DrawerModule } from '@nativescript-community/ui-drawer/angular';
import { PageRouterOutlet } from '@nativescript/angular';

/**
 * The drawer hosts spartan's left, right and top sheets (see NativeScriptOverlayHost). It opens only from code, so
 * edge swipes stay with the pages, and a backdrop tap is reported to the sheet instead of closing the drawer.
 * The backdrop is helm's sheet overlay, `bg-black/10`.
 */
@Component({
  selector: 'ns-app',
  imports: [DrawerModule, PageRouterOutlet],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <Drawer gestureEnabled="false" [backdropTapGestureEnabled]="false" backdropColor="rgba(0, 0, 0, 0.1)">
      <page-router-outlet id="MainContent" class="style-vega" />
    </Drawer>
  `,
})
export class AppComponent {}
