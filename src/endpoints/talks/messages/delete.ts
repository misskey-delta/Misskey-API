import {TalkMessage} from '../../../db/db';
import {ITalkMessage, ITalkUserMessage, ITalkGroupMessage, IUser} from '../../../db/interfaces';
import event from '../../../event';

function isUserMessage(message: ITalkUserMessage | ITalkGroupMessage): message is ITalkUserMessage {
	return message.type === 'user-message';
}

/**
 * Talkのメッセージを削除します
 * @param user API利用ユーザー
 * @param messageId メッセージのID
 */
export default function(user: IUser, messageId: string): Promise<Object> {
	if (messageId === '')  {
		return <Promise<Object>>Promise.reject('empty-message-id');
	}

	return new Promise<Object>((resolve, reject) => {
		// 対象のメッセージを取得
		TalkMessage.findOne({_id: messageId, user: user.id}, (findErr: any, message: any) => {
			if (findErr !== null) {
				return reject(findErr);
			} else if (message === null) {
				return reject('message-not-found');
			} else if (message.user.toString() !== user.id.toString()) {
				return reject('message-not-found');
			} else if (message.isDeleted) {
				return reject('this-message-has-already-been-deleted');
			}

			message.isDeleted = true;
			message.save((saveErr: any) => {
				if (saveErr !== null) {
					reject(saveErr);
				} else {
					resolve();

					if (isUserMessage(message)) {
						event.publishDeleteTalkUserMessage(user.id, <string>message.recipient, message);
					} else {
						event.publishDeleteTalkGroupMessage(<string>message.group, message);
					}
				}
			});
		});
	});
}
