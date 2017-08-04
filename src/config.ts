import * as request from  'request';

const homeDirPath: string = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
const configDirName = '.misskey';
const configFileName = 'api.json';
const configDirectoryPath = `${homeDirPath}/${configDirName}`;
const configPath = `${configDirectoryPath}/${configFileName}`;

export default loadConfig();

function loadConfig(): IConfig {
	const config = <IConfig>require(configPath);
	request.get(config.jws.infoUrl, (err, _, body) => {
		const temp = JSON.parse(body);
		config.jws.algorithm = temp.algorithm;
		config.jws.key = temp.key;
	});
	return config;
}

export interface IConfig {
	mongo: {
		uri: string,
		options: {
			user: string,
			pass: string
		}
	};
	redis: {
		host: string,
		port: number,
		password: string;
	};
	fileServer: {
		passkey: string,
		url: string,
		ip: string,
		port: number
	};
	authServer: {
		url: string;
		ip: string;
		port: number;
	};
	apiPasskey: string;
	port: {
		http: number,
		https: number
	};
	https: {
		enable: boolean;
		keyPath: string;
		certPath: string;
	};
	jws: {
		infoUrl: string;
		algorithm: string;
		key: string;
	};
	token: {
		cacheSeconds: number;
	};
}
