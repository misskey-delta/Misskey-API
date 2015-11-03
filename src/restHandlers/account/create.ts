// import * as express from 'express';
import { MisskeyExpressRequest } from '../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../misskeyExpressResponse';
import createAccount from '../../endpoints/account/create';
import {IUser} from '../../interfaces';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';
	createAccount(req.body['screen-name'], req.body['password']).then((user: IUser) => {
		res.apiRender({
			user: user.toObject()
		});
	}, (err: any) => {
		const statuscode: number = (() => {
			switch (err) {
				case 'empty-screen-name':
					return 400;
				case 'invalid-screen-name':
					return 400;
				case 'empty-password':
					return 400;
				default:
					return 500;
			}
		})();
		res.apiError(statuscode, err);
	});
};