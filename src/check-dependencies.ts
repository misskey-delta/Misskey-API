import {logInfo, logDone, logWarn} from 'log-cool';
import {exec} from 'child_process';

export default function(): void {
	checkDependency('Node.js', 'node -v', x => x.match(/^v(.*)\r?\n$/)[1]);
	checkDependency('npm', 'npm -v', x => x.match(/^(.*)\r?\n$/)[1]);
	checkDependency('MongoDB', 'mongo --version', x => x.match(/^MongoDB shell version: (.*)\r?\n$/)[1]);
	checkDependency('Redis', 'redis-server --version', x => x.match(/v=([0-9\.]*)/)[1]);
	logDone('Checked external dependencies');
}

function checkDependency(serviceName: string, command: string, transform: (x: string) => string): void {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            logWarn(`Unable to find ${serviceName}`);
        } else {
            logInfo(`${serviceName} ${transform(stdout.toString())}`);
        }
    });
}
