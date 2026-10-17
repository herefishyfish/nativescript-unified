import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FEATURES } from './../content';

/** HTML-first feature list. Plain elements and Tailwind classes only, so it renders on web and on native (MasonKit). */
@Component({
  selector: 'app-home-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-feature.component.html',
})
export class HomeFeature {
  readonly features = FEATURES;
}
