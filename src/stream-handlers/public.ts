import * as Websocket from 'ws';
import { IUser } from '../db/interfaces';
import event, { MisskeyEventMessage } from '../event';
import posts_show from '../endpoints/posts/show';
import notifications_show from '../endpoints/notifications/show';

export default async function(user: IUser, ws: Websocket, url: string): Promise<void> {
	const client = event.subscribePublicStream(subscriber);
	ws.on('close', (code, mes) => {
		client.quit();
	});

	async function subscriber(message: MisskeyEventMessage): Promise<void> {
		switch (message.type) {
			case 'post':
				let post: any;
				if (message.value.serialized) {
					delete message.value.serialized;
					post = message.value;
				} else {
					post = await posts_show(null, message.value.id);
				}

				sendEvent({
					type: message.type,
					value: post
				});
				break;

			default:
				break;
		}
	}

	function sendEvent(message: MisskeyEventMessage): void {
		ws.send(JSON.stringify(message));
	}
}
