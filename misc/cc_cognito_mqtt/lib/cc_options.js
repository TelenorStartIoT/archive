const stdio = require('stdio');
const logger = require('winston');
const ccOpts = require('./cc_opts');
const opts = stdio.getopt(ccOpts);

if (opts.verbose) logger.level = 'debug';

module.exports = opts;
