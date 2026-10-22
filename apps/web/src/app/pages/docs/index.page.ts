import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouteMeta } from '@analogjs/router';

export const routeMeta: RouteMeta = {
	canActivate: [() => inject(Router).parseUrl('/docs/introduction')],
};

@Component({ template: '' })
export default class DocsIndex {}