'use strict';

const topics = require('../topics');
const user = require('../user');
const meta = require('../meta');
const privileges = require('../privileges');

const SocketTopics = module.exports;

require('./topics/unread')(SocketTopics);
require('./topics/move')(SocketTopics);
require('./topics/tools')(SocketTopics);
require('./topics/infinitescroll')(SocketTopics);
require('./topics/tags')(SocketTopics);
require('./topics/merge')(SocketTopics);

SocketTopics.postcount = async function (socket, tid) {
	const canRead = await privileges.topics.can('topics:read', tid, socket.uid);
	if (!canRead) {
		throw new Error('[[no-privileges]]');
	}
	return await topics.getTopicField(tid, 'postcount');
};

SocketTopics.bookmark = async function (socket, data) {
	if (!socket.uid || !data) {
		throw new Error('[[error:invalid-data]]');
	}
	const postcount = await topics.getTopicField(data.tid, 'postcount');
	if (data.index > meta.config.bookmarkThreshold && postcount > meta.config.bookmarkThreshold) {
		await topics.setUserBookmark(data.tid, socket.uid, data.index);
	}
};

SocketTopics.createTopicFromPosts = async function (socket, data) {
	if (!socket.uid) {
		throw new Error('[[error:not-logged-in]]');
	}

	if (!data || !data.title || !data.pids || !Array.isArray(data.pids)) {
		throw new Error('[[error:invalid-data]]');
	}

	return await topics.createTopicFromPosts(socket.uid, data.title, data.pids, data.fromTid);
};

SocketTopics.isFollowed = async function (socket, tid) {
	const isFollowing = await topics.isFollowing([tid], socket.uid);
	return isFollowing[0];
};

SocketTopics.isModerator = async function (socket, tid) {
	const cid = await topics.getTopicField(tid, 'cid');
	return await user.isModerator(socket.uid, cid);
};

require('../promisify')(SocketTopics);
