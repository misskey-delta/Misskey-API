import { List } from 'powerful';
const isEmpty = List.isEmpty;
import {TalkHistory} from '../../../../models';
import {ITalkMessage, IUser, ITalkHistory} from '../../../../interfaces';
import serialize from '../../../../core/serialize-talk-message';

/**
 * Talkの履歴を取得します
 * @param user API利用ユーザー
 * @param limit 取得する投稿の最大数
 */
export default function show(
	user: IUser,
	limit: number = 10
): Promise<Object[]> {
	'use strict';

	return new Promise<Object[]>((resolve, reject) => {
		(<any>TalkHistory)
		.find({
			user: user.id
		})
		.sort('-updatedAt')
		.limit(limit)
		.deepPopulate('message.user message.otherparty message.file')
		.exec((err: any, histories: ITalkHistory[]) => {
			if (err !== null) {
				return reject(err);
			} else if (isEmpty(histories)) {
				return resolve([]);
			}

			const messages = histories.map(history => <ITalkMessage>history.message);

			Promise.all(messages.map(message =>
				serialize(message, user)
			)).then(resolve, reject);
		});
	});
}
