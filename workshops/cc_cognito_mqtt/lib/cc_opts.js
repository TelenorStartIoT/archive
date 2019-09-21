const ccOpts = {
	'verbose': {
		key: 'v',
		description: 'Verbose output'
	},
	'account': {
		key: 'a',
		args: 1,
		description: 'Cloud Connect AWS account number',
	},
	'env': {
		key: 'e',
		args: 1,
		description: 'Cloud Connect AWS environment (stack name)',
	},
	'username': {
		key: 'u',
		args: 1,
		description: 'Cloud Connect username',
		mandatory: true
	},
	'password': {
		key: 'P',
		args: 1,
		description: 'Cloud Connect password',
		mandatory: true
	},
	'topic': {
		key: 's',
		args: 1,
		description: 'Subscription topic',
	},
	'topic_publish': {
		key: 'p',
		args: 1,
		description: 'Publish topic',
	}
};

module.exports = ccOpts;
