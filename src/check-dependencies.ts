import {logInfo, logWarn} from 'log-cool';
import {exec, ExecOutputReturnValue} from 'shelljs';

export default function(): void {
	checkDependency('Node.js', 'node -v', x => x.match(/^v(.*)\r?\n$/)[1]);
	checkDependency('npm', 'npm -v', x => x.match(/^(.*)\r?\n$/)[1]);
	checkDependency('MongoDB', 'mongo --version', x => x.match(/^MongoDB shell version: (.*)\r?\n$/)[1]);
	checkDependency('Redis', 'redis-server --version', x => x.match(/v=([0-9\.]*)/)[1]);
}

function checkDependency(serviceName: string, command: string, transform: (x: string) => string): void {
	const code = {
		success: 0,
		notFound: 127
	};
	const x = <ExecOutputReturnValue>exec(command, { silent: true });
	if (x.code === code.success) {
		logInfo(`${serviceName} ${transform(x.output)}`);
	} else if (x.code === code.notFound) {
		logWarn(`Unable to find ${serviceName}`);
	}
}
