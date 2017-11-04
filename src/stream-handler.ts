import * as hapi from 'hapi';
import * as Websocket from 'ws';
import * as url_process from 'url';
import * as query_process from 'querystring';
import * as http from 'http';
import config from './config';
import { User } from './db/db';
import { IUser } from './db/interfaces';
import { logInfo } from 'log-cool';

export default async function(name: string, ws: Websocket, req: http.IncomingMessage): Promise<void> {
	logInfo(`Request: stream /streams/${name}`);

	const query: { [key: string]: string|string[] } = query_process.parse(url_process.parse(req.url).query);

	const reject = (mes: string = 'authentication failed') => {
		const res = {
			type: 'error',
			value: {
				message: mes
			}
		};
		ws.send(JSON.stringify(res));
		ws.close();
	};

	if (query['passkey'] === undefined || query['passkey'] === null) {
		reject("'passkey' is required");
		return;
	}
	if (query['user-id'] === undefined || query['user-id'] === null) {
		reject("'user-id' is required");
		return;
	}
	if (!isValidApiKey(query['passkey'] as string)) {
		reject("'passkey' is not a valid api key");
		return;
	}

	const user = await getUserByID(query['user-id'] as string);
	if (user === null) {
		reject('user not found');
		return;
	}

	const handler = require(`./stream-handlers/${name}`).default;
	handler(user, ws, query);
}

// toriaezu
function isValidApiKey(key: string): boolean {
	return key === config.apiPasskey;
}

function getUserByID(id: string): Promise<IUser | null> {
	return new Promise<IUser | null>((res, rej) => {
		try {
			User.findById(id, (err: any, doc: IUser) => {
				if (err === null) {
					res(doc);
				} else {
					res(null);
				}
			});
		} catch (err) {
			res(null);
		}
	});
}
