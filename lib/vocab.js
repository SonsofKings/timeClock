let self;
const moment = require('moment');

exports.init = function(el, message, allDone) {
	self = el;
}

exports.clockin = function(self, message, allDone) {

	//Check passKey
	let pass = message.content.pass;
	if (pass != self.resources.globals.conf.passKey) {
		allDone(true, 'Incorrect Pass')
	}

	//Check if clocked in already
	if (self.resources.globals.conf.clockedIn === true) {
		allDone(false, 'You are already clocked in.');
	}

	//If not
	if (self.resources.globals.conf.clockedIn === false) {
		let month = moment().format('MMM');
		let day = moment().format('D');
		let year = moment().format('YYYY');
		let date = month + ' ' + day + ' ' + year;

		if (!self.resources.globals.conf.stats[date]) {
			self.resources.globals.conf.stats[date] = {
				clockIn: [],
				clockOut: [],
				dateID: date,
				notes: '-'
			};
		};

		let time = moment().format('LT');
		self.resources.globals.conf.stats[date].clockIn.push(time);
		self.resources.globals.cFile.update('stats', self.resources.globals.conf.stats)


		let clockTime = moment().format('LLL');
		self.resources.globals.conf.clockedIn = true;
		self.resources.globals.cFile.update('clockedIn', self.resources.globals.conf.clockedIn);
		allDone(false, 'Clocked in on ' + clockTime);
	};
};

exports.clockout = function(self, message, allDone) {

	//Check passKey
	let pass = message.content.pass;
	if (pass != self.resources.globals.conf.passKey) {
		allDone(true, 'Incorrect Pass')
	}

	//Check if clocked out
	if (self.resources.globals.conf.clockedIn === false) {
		allDone(false, 'You are already clocked out.');
	}

	//If not
	if (self.resources.globals.conf.clockedIn === true) {
		let month = moment().format('MMM');
		let day = moment().format('D');
		let year = moment().format('YYYY');
		let date = month + ' ' + day + ' ' + year;

		if (!self.resources.globals.conf.stats[date]) {
			self.resources.globals.conf.stats[date] = {
				clockIn: [],
				clockOut: [],
				dateID: date,
				notes: '-'
			};
		};

		let time = moment().format('LT');
		self.resources.globals.conf.stats[date].clockOut.push(time);
		self.resources.globals.cFile.update('stats', self.resources.globals.conf.stats)


		let clockTime = moment().format('LLL');
		self.resources.globals.conf.clockedIn = false;
		self.resources.globals.cFile.update('clockedIn', self.resources.globals.conf.clockedIn);
		allDone(false, 'Clocked out on ' + clockTime);
	};
}; 

exports.testmoment = function(self, message, allDone) {
	let month = moment().format('MMM');
	let day = moment().format('D');
	let year = moment().format('YYYY');

	allDone(false, month + " " + day + ' ' + year);
}

exports.gettimes = function(self, message, allDone) {
	//Create Variables
	let reportObj = {
		outside: 'double',
		vLines: true,
		head: [
			{caption: 'Date', just: 'left'},
			{caption: 'Clock In', just: 'left'},
			{caption: 'Clock Out', just: 'left'},
			{caption: 'Total Time', just: 'left'},
			{caption: 'Notes', just: 'left'}
		],
		headDiv: true,
		rows: []
	}
	let workStats = self.resources.globals.conf.stats;


	//Build Rows
	for (let day in workStats) {
		//For Each Clock In Per Day
		for (i=0; i<workStats[day].clockIn.length; i++) {
			let thisArr = [];

			//Build Date Column
			if (i === 0) {
				thisArr.push(workStats[day].dateID);
			} else {
				thisArr.push('-');
			}

			//Build Clock In Column
			thisArr.push(workStats[day].clockIn[i]);

			//Build Clock Out Column
			thisArr.push(workStats[day].clockOut[i]);

			//Build Total Time Column
			if (i === 0) {
				thisArr.push('Not Yet Implemented');
			} else {
				thisArr.push('-');
			};

			//Build Notes Column
			if (i === 0) {
				thisArr.push(workStats[day].notes);
			} else {
				thisArr.push('-');
			}

			//Push Arr to Rows
			reportObj.rows.push(thisArr);
		};

	};
	let out = self.utilities.strings.report(reportObj);
	if (message.isFromTerminal) out = '$$$div=tight\r\n' + out;
	allDone(false, out);
};

exports.cleartimes = function(self, message, allDone) {
	//Throw Warning
	if (!message.content.pass) allDone(false, 'Clearing Time Log is Permanent, Use Verb with PassKey to force.');

	//Check Pass
	let pass = message.content.pass;
	if (pass != self.resources.globals.conf.passKey) {
		allDone('Incorrect Password')
	};

	//Delete Times
	self.resources.globals.conf.stats = {};
	allDone(false, 'Time Log Cleared');
}

exports.makenote = function(self, message, allDone) {
	let month = moment().format('MMM');
	let day = moment().format('D');
	let year = moment().format('YYYY');
	let date = month + ' ' + day + ' ' + year;

	self.resources.globals.conf.stats[date].notes = message.content.note;
	self.resources.globals.cFile.update('notes', self.resources.globals.conf.stats)
	allDone(false, 'Note Made')
}