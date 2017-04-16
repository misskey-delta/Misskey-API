import {dataSize} from 'powerful';
import {logInfo, logWarn} from 'log-cool';
import * as cluster from 'cluster';
import * as hapi from 'hapi';
import hapiws = require('hapi-plugin-websocket');
import * as Websocket from 'ws';
import * as url from 'url';

import httpEndpoints from './http-endpoints';
import streamEndpoints from './stream-endpoints';
import apiHandler from './api-handler';
import streamHandler from './stream-handler';
import config from './config';

export default function(): void {
	logInfo(`(cluster: ${cluster.worker.id}) Initializing server`);

	const server = new hapi.Server();
	server.connection({ port: config.port.http });

	// REST endpoints routing
	httpEndpoints.forEach(endpoint => {
		if (endpoint.name === 'album/files/upload') {
			server.route({
				method: 'post',
				path: `/${endpoint.name}`,
				config: {
					payload: {
						output: 'file',
						parse: true,
						maxBytes: dataSize.fromMiB(100),
						allow: 'multipart/form-data'
					},
					handler: (request: any, reply: any): void => {
						apiHandler(endpoint, request, reply);
					}
				}
			});
		} else {
			server.route({
				method: 'post',
				path: `/${endpoint.name}`,
				handler: (request: any, reply: any): void => {
					apiHandler(endpoint, request, reply);
				}
			});
		}
	});

	// Stream endpoints routing
	server.register(hapiws, (err) => {
		streamEndpoints.forEach(name => {
			server.route({
				method: 'post',
				path: `/streams/${name}`,
				config: {
					plugins: {
						websocket: {
							only: true,
							connect: (wss: Websocket.Server, ws: Websocket) => {
								streamHandler(name, ws);
							}
						}
					}
				},
				handler: (req, reply) => { return; }
			});
		});
	});

	server.route({ method: '*', path: '/{p*}', handler: notFoundHandler });

	server.start(() => {
		logInfo(`(cluster: ${cluster.worker.id}) Listening at ${server.info.uri}`);
	});
}

function notFoundHandler(req: any, res: any): any {
	logWarn(`Request not handled: ${req.method.toUpperCase()} ${req.path}`);
	return res({
		error: 'api-not-found'
	}).code(404);
}
