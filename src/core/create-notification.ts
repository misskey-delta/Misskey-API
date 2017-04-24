import {Notification} from '../db/db';
import {IApplication, INotification} from '../db/interfaces';
import event from '../event';

export default (
	app: IApplication,
	userId: string,
	type: string,
	content: any
): Promise<INotification> => new Promise ((resolve, reject) => {
	// get lastOne
	Notification.find({
		app: app || null,
		user: userId,
		type: type
	}).limit(1).sort('-$natural').exec((findErr: any, notifications: INotification[]) => {
		if (! findErr) {
			const lastOneNotification: INotification = notifications[0] || null;
			// check notify already sent.
			if (lastOneNotification) {
				// check lastOne's content whether it's same as passed content
				const similar = Object.keys(lastOneNotification.content).every(
					key => lastOneNotification.content[key] === content[key]
				);
				// if similar, calc delay.
				if (similar) {
					const createdAt: Date = lastOneNotification.createdAt;
					const delay = Date.now() - createdAt.getTime();
					// notified similer notification within 10 min, stop.
					if (delay < (10 * 60 * 1000)) {
						resolve(lastOneNotification);
						return;
					}
				}
			}
		}
		// create
		Notification.create({
			app: app || null,
			user: userId,
			type: type,
			content: content
		}, (createErr: any, createdNotification: INotification) => {
			if (createErr) {
				reject(createErr);
				return;
			}
			event.publishNotification(createdNotification);
			resolve(createdNotification);
		});
	});
});
