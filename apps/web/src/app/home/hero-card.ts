import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import source from './hero-card.html?highlight';

/** The home page's live sample. The hero shows `HERO_SOURCE` beside it, read from the same file, so the code and the preview cannot drift. */
@Component({
  selector: 'web-hero-card',
  imports: [HlmButton, HlmCardImports, HlmSwitchImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex w-full justify-center' },
  templateUrl: './hero-card.html',
})
export class HeroCard {}

export const HERO_SOURCE = source;
