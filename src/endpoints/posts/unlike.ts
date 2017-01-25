import {User, Post, PostLike} from '../../db/db';
import {IUser, IPost, IPostLike} from '../../db/interfaces';

/**
 * Unlikeします
 * @param user ユーザー
 * @param id 対象の投稿のID
 */
export default function(user: IUser, id: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		// check user
		if (user === undefined || user === null) {
			return reject('plz-authenticate');
		} else if (user.isSuspended) {
			return reject('access-denied');
		}

		Post.findById(id, (err: any, post: IPost) => {
			if (err !== null) {
				return reject(err);
			} else if (post === null) {
				return reject('post-not-found');
			} else if (post.isDeleted) {
				return reject('post-is-deleted');
			} else if (post.type === 'repost') {
				return reject('no-unlike-to-repost');
			}
			PostLike.findOne({
				post: post.id,
				user: user.id
			}, (postLikeFindErr: any, postLike: IPostLike) => {
				if (postLikeFindErr !== null) {
					return reject(postLikeFindErr);
				}
				if (postLike === null) {
					return reject('already-unliked');
				}
				PostLike.remove({
					post: post.id,
					user: user.id
				}, (removeErr: any) => {
					if (removeErr !== null) {
						return reject(removeErr);
					}
					resolve();

					// 投稿のlikesCountをデクリメント
					post.likesCount--;
					post.save();

					// ユーザーのlikesCountをデクリメント
					user.likesCount--;
					user.save();

					// 投稿の作者のlikedCountをデクリメント
					User.findById(<string>post.user, (authorFindErr: any, author: IUser) => {
						author.likedCount--;
						author.save();
					});
				});
			});
		});
	});
}
