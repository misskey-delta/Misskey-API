import {IApplication, IUser} from '../../../db/interfaces';
import getFolders from '../../../endpoints/album/folders/list';

export default function(
	app: IApplication,
	user: IUser,
	req: any,
	res: any
): void {
	getFolders(user, req.payload['folder-id']).then(folders => {
		res(folders);
	}, (err: any) => {
		res({error: err}).code(500);
	});
}
