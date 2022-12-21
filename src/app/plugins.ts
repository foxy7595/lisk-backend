/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Application } from 'lisk-sdk';
import { LNSDashboardPlugin } from 'lns-dashboard-plugin';

export const registerPlugins = (_app: Application): void => {
	_app.registerPlugin(LNSDashboardPlugin);
	_app.overridePluginOptions(LNSDashboardPlugin.alias, {
		applicationUrl: `ws://localhost:8080/ws`,
		port: 8000,
	});
};
