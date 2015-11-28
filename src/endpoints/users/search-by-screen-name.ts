import {User} from '../../models';
import {IUser} from '../../interfaces';
import serializeUser from '../../core/serialize-user';

/**
 * ユーザーをScreen nameで検索します
 * @param me API利用ユーザー
 * @param screenName クエリ
 */
export default function search(me: IUser, screenName: string): Promise<Object[]> {
	'use strict';
	const screenNameLower: string = screenName.toLowerCase();
	return new Promise<Object[]>((resolve, reject) => {
		User.find({
			screenNameLower: new RegExp(screenNameLower, 'i')
		}, (searchErr: any, users: IUser[]) => {
			if (searchErr !== null) {
				return reject('something-happened');
			} else if (users.length === 0) {
				return resolve(null);
			}
			Promise.all(users.map(user => serializeUser(me, user)))
			.then((serializedUsers: Object[]) => {
				resolve(serializedUsers);
			}, (err: any) => {
				reject('something-happened');
			});
		});
	});
}
