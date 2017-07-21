import { property } from '../../helpers/property';

export const schema = `
	type Message {
		id: String
		author: User
		content: String
		channel: Channel
		creationTime: String
		fromServer: Boolean
		userRef: [User]
		channelRef: [Channel]
		reactions: [Reaction]
		# TODO
		tags: [String]
	}
`;

export const resolver = {
	Message: {
		id: property('_id'),
		content: property('msg'),
		creationTime: property('ts'),
		author: (root) => {
			return RocketChat.models.Users.findOne(root.u._id);
		},
		channel: (root) => {
			return RocketChat.models.Rooms.findOne(root.rid);
		},
		fromServer: (root) => typeof root.t !== 'undefined', // on a message sent by user `true` otherwise `false`
		channelRef: (root) => {
			if (!root.channels) {
				return;
			}

			return RocketChat.models.Rooms.find({
				_id: {
					$in: root.channels.map(c => c._id)
				}
			}, {
				sort: {
					name: 1
				}
			}).fetch();
		},
		userRef: (root) => {
			if (!root.mentions) {
				return;
			}

			return RocketChat.models.Users.find({
				_id: {
					$in: root.mentions.map(c => c._id)
				}
			}, {
				sort: {
					username: 1
				}
			}).fetch();
		},
		reactions: (root) => {
			if (!root.reactions || Object.keys(root.reactions).length === 0) {
				return;
			}

			const reactions = [];

			Object.keys(root.reactions).forEach(icon => {
				root.reactions[icon].usernames.forEach(username => {
					reactions.push({
						icon,
						username
					});
				});
			});

			return reactions;
		},
		// TODO
		tags: () => {}
	}
};