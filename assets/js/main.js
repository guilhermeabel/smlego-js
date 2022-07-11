let bpm = 120;
let isRunningMetronome = false
const metronomeClick = new Audio('assets/sounds/metronome.wav');
const noteClick = new Audio('assets/sounds/note.wav');

$("#bpm").val(bpm)

/* FILE PICKER */
const pickerOpts = {
	types: [
		{
			description: 'MusicXML',
			accept: {
				'xml/*': ['.musicxml']
			}
		},
	],
	excludeAcceptAllOption: true,
	multiple: false
};

async function getTheFile() {
	[fileHandle] = await window.showOpenFilePicker(pickerOpts);
	const fileData = await fileHandle.getFile();
	const contents = await fileData.text();
	//return contents;
	await parse(contents)
}

var readFiles = function (files) {
	return files.reduce((p, file) => {
		return p.then(() => readFile(file));
	}, Promise.resolve());
};

/* PARSE FILE */

function parse(fileData) {
	$xml = $(fileData);
	let types = $xml.find("note").get();
	let parsedSheet = []
	for (const s of types) {

		let $s = $(s)
		let rest = $s.children("rest").length > 0
		let note = $s.find("type").text()

		if (note == "eighth" && !rest) {
			parsedSheet.push("black")
		} else if (note == "eighth" && rest) {
			parsedSheet.push("white")
		} else if (note == "quarter" && rest) {
			parsedSheet.push("white")
			parsedSheet.push("white")
		} else if (note == "quarter" && !rest) {
			parsedSheet.push("black")
			parsedSheet.push("white")
		}

	}
	clearSheet()
	window.notes = parsedSheet
	return appendNotes(parsedSheet)
}

/* MOUNT SHEET */

function appendNotes(parsedSheet, group = 1, breakpoint = 8) {
	addGroup(group)
	for (let note = 0, i = 1; note < breakpoint; note++, i++) {
		line = i % 2 + 1
		elem = $(`.group-${group} .line-${line}`)

		addNote(elem, parsedSheet[note], note)
	}
	let remaining = parsedSheet.slice(breakpoint)
	if (remaining.length > 0) {
		appendNotes(remaining, group + 1)
	}

}

function addGroup(i) {
	$(".sheet").append(`<div class="group-${i}"><div class="line-1 row gx-1"><div class="col-md-1 note">&nbsp;</div></div><div class="line-2 row 	gx-1"></div></div>`)
}

function addNote(elem, type, i) {
	switch (type) {
		case "white":
			note = "○"
			break;
		case "black":
			note = "●"
			break;
		default:
			note = "&nbsp;"
	}

	elem.append(`<div class="col-md-2 note note-${i}">${note}</div>`)
}

async function loopThrough() {
	await $(".sheet > div").each(function (index) {
		var that = $(this);
		setTimeout(function () {
			that.addClass("highlight");
			let t = setInterval(function () {
				that.removeClass("highlight");
				return t
			}, 500);
		}, 500 * index);
	});
	clearInterval(t)
}


/* CLICK & METRONOME */

function Timer(callback, interval, options) {
	this.interval = interval;

	this.start = () => {
		this.expected = Date.now() + this.interval;
		this.theTimeout = null;

		if (options.immediate) {
			callback();
		}

		this.timeout = setTimeout(this.round, this.interval);
	}
	this.stop = () => {
		clearTimeout(this.timeout);
	}
	this.round = () => {
		let drift = Date.now() - this.expected;
		if (drift > this.interval) {
			if (options.errorCallback) {
				options.errorCallback();
			}
		}
		callback();
		this.expected += this.interval;
		this.timeout = setTimeout(this.round, this.interval - drift);
	}
}

/* ACTION HANDLERS */

function metronomeHandler() {
	metronomeClick.play()
}

function noteHandler() {
	let notes = window.notes

	$(notes).each(function () {
		if (this == "black") {
			noteClick.play()
		}
	})

}

function playNote() {
	window.notesPlayer = new Timer(noteHandler, 60000 / bpm, { immediate: true })
	window.notesPlayer.start()
}

function toggleMetronome() {
	if (isRunningMetronome) {
		window.metronomePlayer.stop()
		isRunningMetronome = false
	} else {
		window.metronomePlayer = new Timer(metronomeHandler, 60000 / bpm, { immediate: true })

		window.metronomePlayer.start()
		isRunningMetronome = true
	}
}

function stop() {
	// note.stop
	window.metronomePlayer.stop()
}

function clearSheet() {
	$(".sheet").empty()
}

function setBpm() {
	bpm = $("#bpm").val()
}


function toggleTheme() {
	if ($('body').hasClass("highContrastTheme")) {
		$('body').removeClass("highContrastTheme")
	} else {
		$('body').addClass("highContrastTheme")
	}
}
