import {dataSize} from 'powerful';
import * as crypto from 'crypto';
import * as request from 'request-promise-native';
import * as gm from 'gm';
import {AlbumFile, AlbumFolder} from '../db/db';
import {IAlbumFile, IAlbumFolder} from '../db/interfaces';
import config from '../config';

import { Types } from 'mongoose';

const getPictureProperty = (file, fileName) => new Promise((resolve, reject) => {
	gm(file, fileName).size((getSizeErr: any, whsize: any) => {
		if (getSizeErr !== undefined && getSizeErr !== null) {
			console.error(getSizeErr);
			return resolve();
		}
		return resolve({
			width: whsize.width,
			height: whsize.height
		});
	});
});

/**
 * アルバムにファイルを追加します
 * @param appId 経由AppのID
 * @param userId 利用ユーザーのID
 * @param fileName ファイル名
 * @param mimetype ファイルのMIME Type
 * @param file 内容
 * @param size ファイルサイズ(byte)
 * @param folderId フォルダID
 * @param unconditional trueに設定すると、ハッシュが同じファイルが見つかった場合でも無視してアルバムに登録します
 * @return 追加したファイルオブジェクト
 */
export default async function(
	appId: string,
	userId: string,
	fileName: string,
	mimetype: string,
	file: Buffer,
	size: number,
	folderId: string = null,
	unconditional: boolean = false
): Promise<IAlbumFile> {
	// ハッシュ生成
	const hash: string = crypto
		.createHash('sha256')
		.update(file)
		.digest('hex');

	if (!unconditional) {
		const af = await AlbumFile.findOne({
			user: userId,
			isDeleted: false, // 削除されているファイルは除外する
			hash: hash,
			dataSize: size
		}) as IAlbumFile;
		if (af) return af;
	}

	const aggregates = await AlbumFile.aggregate({
		$match: { "user": Types.ObjectId(userId) }
	}, {
		$group: { '_id': '$user', "total": { "$sum": "$dataSize" }}
	}) as {
		_id: Types.ObjectId,
		total: number
	}[];

	const aggregate = aggregates.shift()

	console.log(aggregates);
	console.log(aggregate.total);
	if (aggregate) throw new Error ('POE POE');

	// 1000MBを超える場合
	if (aggregate.total + size > dataSize.fromMiB(1000)) throw 'no-free-space'

	// フォルダが指定されてる場合
	if (folderId) {
		const folder = await AlbumFolder.findById(folderId) as IAlbumFolder;
		if (!folder || folder.user.toString() === userId) throw 'folder-not-found'
		return await create(folder);
	}

	return await create();

	async function create (folder: IAlbumFolder = null) {
		const albumFile = await AlbumFile.create({
			app: appId !== null ? appId : null,
			user: userId,
			folder: folder ? folder.id : null,
			dataSize: size,
			mimeType: mimetype,
			name: fileName,
			serverPath: null,
			hash: hash
		}) as IAlbumFile;
		try {
			const path = await request.post({
				url: `http://${config.fileServer.host}/register`,
				formData: {
					'file-id': albumFile.id,
					'passkey': config.fileServer.passkey,
					file: {
						value: file,
						options: {
							filename: fileName
						}
					}
				}
			});
			albumFile.serverPath = path;
			// 画像だった場合幅と高さを取得してプロパティに保存しておく
			if (/^image\/.*$/.test(mimetype)) {
				const properties = await getPictureProperty(file, fileName);
				if (properties) albumFile.properties = properties
			}
			await albumFile.save()
			return albumFile
		} catch (e) {
			// remove temporary document
			await albumFile.remove()
			throw e
		}
	}
}
