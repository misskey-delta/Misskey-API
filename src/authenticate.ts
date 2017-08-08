import * as hapi from 'hapi';
import * as jws from 'jws';
import * as request from 'request';
import * as redis from 'redis';
import {User} from './db/db';
import {IUser} from './db/interfaces';
import config from './config';

const redisConnection = redis.createClient(
	config.redis.port,
	config.redis.host,
	{
		auth_pass: config.redis.password
	}
);

interface AuthResult {
	app: any;
	user: IUser|null;
	isOfficial: boolean;
}

export default async function(req: hapi.Request): Promise<AuthResult> {
	if (req.headers['passkey'] === undefined || req.headers['passkey'] === null) {
		if (req.headers['authorization'] !== undefined && req.headers['authorization'] !== null) {
			const token = parseAuthorizationHeader(req.headers['authorization']);
			if (token !== null) {
				if (await isValidToken(token)) {
					const user = <IUser>await User.findById(decodeToken(token).sub);
					return {
						app: null,
						user,
						isOfficial: true
					};
				}
			}
		}
		return { app: null, user: null, isOfficial: false };
	}
	if (req.headers['passkey'] !== config.apiPasskey) {
		throw new Error();
	}
	if (req.headers['user-id'] === undefined || req.headers['user-id'] === null || req.headers['user-id'] === 'null') {
		return { app: null, user: null, isOfficial: true };
	} else {
		const user = <IUser>await User.findById(req.headers['user-id']);
		return {
			app: null,
			user,
			isOfficial: true,
		};
	}
}

function parseAuthorizationHeader(header: string): string|null {
	if (/^\s*[\w\-]+\s+[^\s]+\s*$/.test(header) === false) { return null; }
	const parts = header.split(' ').map((a) => a.trim());
	const scheme = parts[0].toLowerCase();
	const data = parts[1];

	if (scheme !== "bearer") { return null; }
	return data;
}

async function isValidToken(token: string): Promise<boolean> {
	if (jws.verify(token, config.jws.algorithm, config.jws.key) === false) { return false; }
	if (await redisExists(`token:${token}`)) {
		return true;
	} else {
		const active = await queryIsActiveToken(token);
		if (!active) { return false; }
		await redisSetex(`token:${token}`, '', config.token.cacheSeconds);
		return true;
	}
}

function queryIsActiveToken(token: string): Promise<boolean> {
	return new Promise<string>((res, rej) => {
		request.post(
			`https://${config.authServer.ip}:${config.authServer.port}/tokens/introspect`,
			{
				form: {token}
			},
			(err, _, body) => {
				if (err === null) {
					res(body);
				} else {
					rej(err);
				}
			}
		);
	}).then((a) => {
		return JSON.parse(a).active;
	});
}

function decodeToken(token: string): any {
	return JSON.parse(jws.decode(token).payload);
}

function redisExists(key: string): Promise<boolean> {
	return new Promise<boolean>((res, rej) => {
		redisConnection.exists(key, (err, data) => {
			if (err === null) {
				res(data === 1);
			} else {
				rej(err);
			}
		});
	});
}

function redisSetex(key: string, value: string, seconds: number): Promise<void> {
	return new Promise<void>((res, rej) => {
		redisConnection.set(key, value, 'EX', seconds, (err) => {
			if (err === null) {
				res();
			} else {
				rej();
			}
		});
	});
}
