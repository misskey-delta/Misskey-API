import {IApplication, IUser} from '../../../db/interfaces';
import getFiles from '../../../endpoints/album/files/list';

export default function(
	app: IApplication,
	user: IUser,
	req: any,
	res: any
): void {
	getFiles(
		user,
		req.payload['folder-id'],
		req.payload['limit'],
		req.payload['since-cursor'],
		req.payload['max-cursor']
	).then(files => {
		res(files);
	}, (err: any) => {
		res({error: err}).code(500);
	});
}
