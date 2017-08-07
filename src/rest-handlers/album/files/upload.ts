import * as fs from 'fs';
import {IApplication, IUser} from '../../../db/interfaces';
import upload from '../../../endpoints/album/files/upload';

export default function(
	app: IApplication,
	user: IUser,
	req: any,
	res: any
): void {
	const file = req.payload.file;
	if (file === undefined || file === null) {
		res('empty-file').code(400);
		return;
	}
	const unconditional: boolean = req.payload.unconditional;
	let folder: string = req.payload['folder-id'];
	if (folder === 'null') {
		folder = null;
	}
	const path: string = file.path;
	const fileName: string = file.filename;
	const mimetype: string = file.headers['content-type'];
	const fileBuffer: Buffer = fs.readFileSync(path);
	const size: number = file.bytes;

	const unlinking = new Promise<void>((resolve, reject) => {
		fs.unlink(path, (e) => {
			if (e === null) {
				resolve();
			} else {
				reject(e);
			}
		});
	});

	const uploading = upload(
		app,
		user,
		fileName,
		mimetype,
		fileBuffer,
		size,
		folder,
		unconditional
	);

	Promise.all([unlinking, uploading])
		.then(a => a[1])
		.then(albumFile => {
			res(albumFile);
		})
		.catch(err => {
			res({error: err}).code(500);
		});
}
