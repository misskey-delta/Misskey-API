import * as Websocket from 'ws';
import { IUser } from '../db/interfaces';
import event, { MisskeyEventMessage } from '../event';
import posts_show from '../endpoints/posts/show';
import notifications_show from '../endpoints/notifications/show';

export default async function(user: IUser, ws: Websocket): Promise<void> {
  const client = event.subscribeUserStream(user.id, subscriber);
  ws.on('close', (code, mes) => {
    client.quit();
  });

  async function subscriber(message: MisskeyEventMessage): Promise<void> {
    switch(message.type) {
      case 'post':
        const post = await posts_show(user, message.value.id);
        sendEvent({
          type: message.type,
          value: post
        });
        break;
      case 'notification':
        const notification = await notifications_show(user, message.value.id);
        sendEvent({
          type: message.type,
          value: notification
        });
        break;
      case 'talk-user-message':
        sendEvent(message); //id付いてる
        break;
    }
  }

  function sendEvent(message: MisskeyEventMessage): void {
    ws.send(JSON.stringify(message));
  }
}