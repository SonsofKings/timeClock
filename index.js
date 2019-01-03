const        vcb = require('./lib/vocab'),
          myName = 'timeClock',
           debug = (process.argv[3] == 'debug'),
          moment = require('moment');
	confTemplate = {
				uplinkHost:'127.0.0.1',
				uplinkPort: 6443,
				ivKey: '4sc0re&7',
                clockedIn: false,
                passKey: 'orenda',
                stats: {}
				};

let conf,
	cFile;

exports.neuron  = {
	system: {
		debugAll: debug,
		ouputDebugAt: (debug) ? 0 : 5,
		version: '1.0',
		beforeBoot: function(config, dispatcher, globals, allDone) {
			cFile = dispatcher.utilities.configFile;
			conf = cFile.get(confTemplate);

            globals.cFile = cFile;
            globals.conf = conf;

			config.interneuron.ivKey = conf.ivKey;
			config.interneuron.connectTo.host = conf.uplinkHost;
			config.interneuron.connectTo.port = conf.uplinkPort;
			allDone(false, config, dispatcher, globals);
		}
	},
	interneuron: {
		type: 'node',
		name: myName,
		ivKey: false,
		connectTo: {host: false, port: false }
	},
	skills: [
        {
            name: 'boot',
            emits: ['boot'],
            beforeEmit: function(self, message, allDone) {
                self.resources.globals.cFile = cFile;
                self.resources.globals.conf = conf;

                vcb.init(self, message, allDone);
                allDone();
            }
        }
	],
	vocab: {
		lexicon: {
            clockin: {
                nick: 'clockIn',
                help: 'Clock In for Work',
                parameters: [{nick: 'pass', optional: false}],
                handler: vcb.clockin
            },
            clockout: {
                nick: 'clockOut',
                help: 'Clock Out of Work',
                parameters: [{nick: 'pass', optional: false}],
                handler: vcb.clockout
            },
            testmoment: {
                nick: 'testmoment',
                help: '',
                parameters: false,
                handler: vcb.testmoment
            },
            gettimes: {
                nick: 'getTimes',
                help: 'Return Table of Worked Time',
                parameters: false,
                handler: vcb.gettimes
            },
            cleartimes: {
                nick: 'clearTimes',
                help: 'Clear Time Log',
                parameters: [{nick: 'pass', optional: true}],
                handler: vcb.cleartimes
            }
		}
	}
}