/**
 * Visual variant for native-view stand-ins. Web cannot simulate iOS or Android, so these are
 * approximations of how the native views look: `ios` (UIKit style), `material` (Android Material),
 * `default` (neutral docs style). Set as `platform="ios"` on the element; styling hooks on the attribute.
 */
export type NsPlatform = 'default' | 'ios' | 'material';
