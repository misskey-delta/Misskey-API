import * as Websocket from 'ws';
import { IUser } from '../db/interfaces';
import event, { MisskeyEventMessage } from '../event';
import talkmessages_show from '../endpoints/talks/messages/show';

import * as url_process from 'url';
import * as query_process from 'querystring';

export default async function(user: IUser, ws: Websocket): Promise<void> {
  const query = (() => {
    const q = url_process.parse(ws.upgradeReq.url).query;
    return query_process.parse(q);
  })();

  if(query['group-id'] === undefined || query['group-id'] === null) {
    reject("'group-id' is required");
    return;
  }

  const group_id = query['group-id'];
  
  const client = event.subscribeGroupTalkStream(group_id, subscriber);
  ws.on('close', (code, mes) => {
    client.quit();
  });
  return;

  async function subscriber(message: MisskeyEventMessage): Promise<void> {
    const obj = await (() => {
      switch(message.type) {
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