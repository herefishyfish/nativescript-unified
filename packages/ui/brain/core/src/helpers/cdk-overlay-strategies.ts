import type {
	OverlayPositionBuilder,
	PositionStrategy,
	ScrollStrategy,
	ScrollStrategyOptions,
} from '@angular/cdk/overlay';
import type { BrnOverlayPlacement, BrnOverlayRequest } from './overlay-host';

/** The CDK position strategy for a request: its web-only override, or one derived from its placement. */
export function cdkPositionStrategy(builder: OverlayPositionBuilder, request: BrnOverlayRequest): PositionStrategy {
	return request.positionStrategy ?? cdkPlacementStrategy(builder, request.placement);
}

function cdkPlacementStrategy(builder: OverlayPositionBuilder, placement: BrnOverlayPlacement): PositionStrategy {
	switch (placement.kind) {
		case 'center':
			return builder.global().centerHorizontally().centerVertically();
		case 'edge': {
			const global = builder.global();
			return placement.side === 'top'
				? global.top()
				: placement.side === 'right'
					? global.right()
					: placement.side === 'bottom'
						? global.bottom()
						: global.left();
		}
		case 'anchored':
			return builder
				.flexibleConnectedTo(placement.origin)
				.withPositions([...placement.positions])
				.withPush(placement.push);
	}
}

export function cdkScrollStrategy(options: ScrollStrategyOptions, request: BrnOverlayRequest): ScrollStrategy {
	const strategy = request.scrollStrategy;
	if (strategy === 'close') return options.close();
	if (strategy === 'reposition') return options.reposition();
	return strategy ?? options.block();
}
