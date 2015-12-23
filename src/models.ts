import * as mongoose from 'mongoose';
import config from './config';

const db = mongoose.createConnection(config.mongo.uri, config.mongo.options);

import albumFile from './models/album-file';
import albumFolder from './models/album-folder';
import application from './models/application';
import bbsPost from './models/bbs-post';
import bbsTopic from './models/bbs-topic';
import bbsWatching from './models/bbs-watching';
import hashtag from './models/hashtag';
import notification from './models/notification';
import { post, status, photo, repost } from './models/post';
import postLike from './models/post-like';
import postMention from './models/post-mention';
import * as talk from './models/talk-message';
import talkGroup from './models/talk-group';
import talkGroupInvitation from './models/talk-group-invitation';
import { talkHistory, talkUserHistory, talkGroupHistory } from './models/talk-history';
import user from './models/user';
import userFollowing from './models/user-following';

/* tslint:disable:variable-name */
export const AlbumFile = albumFile(db);
export const AlbumFolder = albumFolder(db);
export const Application = application(db);
export const BBSPost = bbsPost(db);
export const BBSTopic = bbsTopic(db);
export const BBSWatching = bbsWatching(db);
export const Hashtag = hashtag(db);
export const Notification = notification(db);
export const Post = post(db);
export const StatusPost = status(db);
export const PhotoPost = photo(db);
export const Repost = repost(db);
export const PostLike = postLike(db);
export const PostMention = postMention(db);
export const TalkMessage = talk.message(db);
export const TalkUserMessage = talk.userMessage(db);
export const TalkGroupMessageBase = talk.groupMessageBase(db);
export const TalkGroupMessage = talk.groupMessage(db);
export const TalkGroupSendInvitationActivity = talk.groupSendInvitationActivity(db);
export const TalkGroupMemberJoinActivity = talk.groupMemberJoinActivity(db);
export const TalkGroupMemberLeftActivity = talk.groupMemberLeftActivity(db);
export const TalkRenameGroupActivity = talk.renameGroupActivity(db);
export const TalkTransferGroupOwnershipActivity = talk.transferGroupOwnershipActivity(db);
export const TalkHistory = talkHistory(db);
export const TalkUserHistory = talkUserHistory(db);
export const TalkGroupHistory = talkGroupHistory(db);
export const TalkGroup = talkGroup(db);
export const TalkGroupInvitation = talkGroupInvitation(db);
export const User = user(db);
export const UserFollowing = userFollowing(db);
