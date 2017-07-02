import * as Websocket from 'ws';
import { IUser } from '../db/interfaces';
import { User } from '../db/db';
import event, { MisskeyEventMessage } from '../event';
import talkmessages_show from '../endpoints/talks/messages/show';

import * as url_process from 'url';
import * as query_process from 'querystring';

export default async function(user: IUser, ws: Websocket, url: string): Promise<void> {
	const query = query_process.parse(url_process.parse(url).query);

	if (query['otherparty-id'] === undefined || query['otherparty-id'] === null) {
		reject("'otherparty-id' is required");
	}

	const otherparty = await getUserByID(query['otherparty-id'] as string);
	if (otherparty === null) {
		reject('otherparty user is not found');
		return;
	}

	const client = event.subscribeUserTalkStream(user.id, otherparty.id, subscriber);
	ws.on('close', err => {
		client.quit();
	});

	async function subscriber(message: MisskeyEventMessage): Promise<void> {
		const obj = await (() => {
			switch (message.type) {
				case 'message':
					return talkmessages_show(user, message.value.id);

				default:
					return Promise.resolve({
						id: message.value
					});
			}
		})();
		sendEvent({
			type: message.type,
			value: obj
		});
	}

	function sendEvent(mes: MisskeyEventMessage): void {
		ws.send(JSON.stringify(mes));
	}

	function reject(mes: string): void {
		sendEvent({
			type: 'error',
			value: {
				message: mes
			}
		});
		ws.close();
	}
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
