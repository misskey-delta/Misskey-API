import {IApplication, IUser} from '../../db/interfaces';
import getFollowings from '../../endpoints/users/following';

export default function(
	app: IApplication,
	user: IUser,
	req: any,
	res: any
): void {
	getFollowings(
		user,
		req.payload['user-id'],
		req.payload['limit'],
		req.payload['since-cursor'],
		req.payload['max-cursor']
	).then(followings => {
		res(followings);
	}, (err: any) => {
		res({error: err}).code(500);
	});
}
