import * as redis from 'redis';
import {UserFollowing} from './db/db';
import {IUser, IPost, IRepost, IUserFollowing, INotification, ITalkGroup, ITalkMessage, ITalkUserMessage} from './db/interfaces';
import config from './config';
import showPost from './endpoints/posts/show';

export interface MisskeyEventMessage {
	type: string;
	value: any;
}

class MisskeyEvent {
	private redisConnection: any;

	constructor() {
		// super();

		// Initialize Redis connection
		this.redisConnection = redis.createClient(
			config.redis.port,
			config.redis.host,
			{
				auth_pass: config.redis.password
			}
		);
	}

	public publishPost(userId: string, post: IPost | IRepost): void {
		showPost(null, post.id).then(postData => {
			const postObj = JSON.stringify({
				type: 'post',
				value: postData
			});

			// 自分のストリーム
			this.publish(`user-stream:${userId}`, postObj);

			// 自分のフォロワーのストリーム
			UserFollowing.find({followee: userId}, (_: any, followers: IUserFollowing[]) => {
				followers.forEach(follower => {
					this.publish(`user-stream:${follower.follower}`, postObj);
				});
			});
		});
	}

	public publishNotification(notification: INotification): void {
		this.publish(`user-stream:${notification.user}`, JSON.stringify({
			type: 'notification',
			value: {
				id: notification.id
			}
		}));
	}

	public subscribeUserStream(userID: string, onMessage: (messsage: MisskeyEventMessage) => any): redis.RedisClient {
		return this.subscribe(`user-stream:${userID}`, mesStr => {
			onMessage(JSON.parse(mesStr) as MisskeyEventMessage);
		});
	}

	public publishReadTalkUserMessage(otherpartyId: string, meId: string, message: ITalkMessage): void {
		this.publish(`talk-user-stream:${otherpartyId}-${meId}`, JSON.stringify({
			type: 'read',
			value: message.id
		}));
	}

	public publishDeleteTalkUserMessage(meId: string, otherpartyId: string, message: ITalkMessage): void {
		this.publish(`talk-user-stream:${otherpartyId}-${meId}`, JSON.stringify({
			type: 'otherparty-message-delete',
			value: message.id
		}));
		this.publish(`talk-user-stream:${meId}-${otherpartyId}`, JSON.stringify({
			type: 'me-message-delete',
			value: message.id
		}));
	}

	public subscribeUserTalkStream(userID: string, otherpartyID: string, onMessage: (message: MisskeyEventMessage) => any): redis.RedisClient {
		return this.subscribe(`talk-user-stream:${userID}-${otherpartyID}`, mesStr => {
			onMessage(JSON.parse(mesStr) as MisskeyEventMessage);
		});
	}

	public publishReadTalkGroupMessage(groupId: string, message: ITalkMessage): void {
		this.publish(`talk-group-stream:${groupId}`, JSON.stringify({
			type: 'read',
			value: message.id
		}));
	}

	public publishDeleteTalkGroupMessage(groupId: string, message: ITalkMessage): void {
		this.publish(`talk-group-stream:${groupId}`, JSON.stringify({
			type: 'delete-message',
			value: message.id
		}));
	}

	public subscribeGroupTalkStream(groupID: string, onMessage: (message: MisskeyEventMessage) => any): redis.RedisClient {
		return this.subscribe(`talk-group-stream:${groupID}`, mesStr => {
			onMessage(JSON.parse(mesStr) as MisskeyEventMessage);
		});
	}

	public publishUserTalkMessage(meId: string, recipientId: string, message: ITalkUserMessage): void {
		[
			[`user-stream:${recipientId}`, 'talk-user-message'],
			[`talk-user-stream:${recipientId}-${meId}`, 'message'],
			[`talk-user-stream:${meId}-${recipientId}`, 'message']
		].forEach(([channel, type]) => {
			this.publish(channel, JSON.stringify({
				type: type,
				value: {
					id: message.id,
					userId: meId,
					text: message.text
				}
			}));
		});
	}

	public publishGroupTalkMessage(message: ITalkMessage, group: ITalkGroup): void {
		(<string[]>group.members).map(member => [`user-stream:${member}`, 'talk-user-message']).concat([
			[`talk-group-stream:${group.id}`, 'message']
		]).forEach(([channel, type]) => {
			this.publish(channel, JSON.stringify({
				type: type,
				value: {
					id: message.id
				}
			}));
		});
	}

	private publish(channel: string, message: string): void {
		this.redisConnection.publish(`misskey:${channel}`, message);
	}

	private subscribe(channel: string, onMessage: (message: string) => any): redis.RedisClient {
		const subscriber = redis.createClient(
			config.redis.port,
			config.redis.host,
			{
				password: config.redis.password
			}
		);

		subscriber.subscribe(`misskey:${channel}`);
		subscriber.on('message', onStreamMessage);

		function onStreamMessage(_, message: string): void {
			onMessage(message);
		}

		return subscriber;
	}
}

export default new MisskeyEvent();
