import {logInfo, logDone, logWarn} from 'log-cool';
import {exec} from 'child_process';

export default function(): void {
	try {
		checkDependency('Node.js', 'node -v', x => x.match(/^v(.*)\r?\n$/)[1]);
		checkDependency('npm', 'npm -v', x => x.match(/^(.*)\r?\n$/)[1]);
		checkDependency('MongoDB', 'mongo --version', x => x.match(/^MongoDB shell version: (.*)\r?\n$/)[1]);
		checkDependency('Redis', 'redis-server --version', x => x.match(/v=([0-9\.]*)/)[1]);
		logDone('Checked external dependencies');
	} catch(e) {
		logWarn('Check dependencies error')
	}
}

function checkDependency(serviceName: string, command: string, transform: (x: string) => string): void {
	try{
		exec(command, (error, stdout, stderr) => {
			try{
				if (error) {
					logWarn(`Unable to find ${serviceName}`);
				} else {
					logInfo(`${serviceName} ${transform(stdout.toString())}`);
				}
			} catch(e) {
				console.error(e)
				logWarn(`Check dependencies error (${serviceName})`)
			}
		});
	} catch(e) {
		console.error(e)
		logWarn(`Check dependencies error (${serviceName})`)
	}
}
