import type { BrnDismissReason } from '@spartan-ng/brain/core';

export type BrnDialogState = 'closed' | 'open';

export type BrnDialogPhase = 'closed' | 'closing' | 'open';

export type BrnDialogDismissReason = BrnDismissReason;
