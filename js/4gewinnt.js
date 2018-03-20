var cols = 7; // anz spalten
var rows = 6; // anz reihen
var step = 8; // Fallgeschwindigkeit (mehr=schneller)
var colwidth = 64;
var rowheight = 64;

var field = new Array( cols );
var disknr = 0; // laufende disk-id
var color = "red";
var back = null; // div element mit id back
var currentDisk = null; // der diskus, der zur zeit animiert wird
var currentBottom = null; // die untergrenze des aktuellen animierten diskus
var timeoutVar = null;
var locked = false;

function doMove(column) {
	var bottom = getBottom(column);
	if (parseInt(currentDisk.style.bottom) - step > bottom)
		currentDisk.style.bottom = parseInt(currentDisk.style.bottom) - step + 'px';
	else { // Animation abgeschlossen
		currentDisk.style.bottom = bottom + 'px';
		currentDisk = null;
	}

	if (currentDisk != null)
		timeoutVar = setTimeout(function() {doMove(column);}, 20); // call doMove in 20msec
}

function init() {
	if( window.location.protocol == "file:" && navigator.userAgent.toLowerCase().search('msie') != -1)
		alert("Der Internet Explorer kann diese Webseite nicht korrekt darstellen, wenn sie lokal aufgerufen wird. Laden Sie sie bitte vom Webserver oder verwenden Sie einen anderen Browser.");

	field = new Array( cols );

	color = "red";
	currentDisk = null; // der diskus, der zur zeit animiert wird
	currentBottom = null; // die untergrenze des aktuellen animierten diskus
	if (timeoutVar) {clearTimeout(timeoutVar); timeoutVar = null; }
	locked = false;

	back = document.getElementById("back");

	for (var i = 0; i < disknr; i++  ) {
		var elem = document.getElementById('disk' + i);
		if (elem)
			back.removeChild(elem);
	}
	disknr = 0; // laufende disk-id

	addListener(back, 'click', clickEvent);

	for (var i=0; i<field.length; i++) {
		field[i] = []; // create empty array
	}

	dispPlayerTurn();
}

/*
 * Wird beim Klicken des Grids aufgerufen
 */
function clickEvent(event) {
	var parentPosition = getPosition(event.currentTarget);
	var x = event.clientX - parentPosition.x; // Ermittle relative Mausposition
	var column = ( x / colwidth) >> 0; // Gib Ganzzahl-Division zurück
	if (locked) return;
	if (field[column].length >= rows) return; // Spalte schon voll, tue nichts

	var newdisk = createNewDisk(column);

	field[column].push(color); // lege diskus auf den Stack
	changeTurn();
	disknr++;

	dispPlayerTurn();

	if (currentDisk != null ) { // animation im gange, abbrechen
		if (timeoutVar) clearTimeout(timeoutVar);
		currentDisk.style.bottom = currentBottom + 'px';
	}

	currentDisk = newdisk;
	currentBottom = getBottom(column);
	doMove(column);

	if (locked = checkWin(column)) {
		changeTurn();
		dispWinner();
	}
	if (isRemis()) document.getElementById('info').innerHTML = "Spiel ist unentschieden";
}

function changeTurn() {
	color = (color == "red" ? "blue" : "red"); // Farbwechsel nach jedem Zug
}

/*
 * Prüft, ob der fallende Stein gewinnt
 */
function checkWin(column) {
	var myIndex = field[column].length -1;
	var myColor = field[column][myIndex];

	var i;
	var col;
	var row;

	for (i = 1; i < 4; i++) {
		// schaue nach unten
		col = column;
		row = myIndex - i;
		try {
			if (myColor != field[col][row]) break; // Auf falsche Farbe getroffen
		} catch (err) {
			break;
		}
	}
	if (i >= 4) return true;

	for (i = 1; i < 4; i++) {
		// nach links
		col = column - i;
		row = myIndex;
		try {
			if (myColor != field[col][row]) break; // Auf falsche Farbe getroffen
		} catch (err) {
			break;
		}
	}
	if (i >= 4) return true;

	for (i = 1; i < 4; i++) {
		// nach rechts
		col = column + i;
		row = myIndex;
		try {
			if (myColor != field[col][row]) break; // Auf falsche Farbe getroffen
		} catch (err) {
			break;
		}
	}
	if (i >= 4) return true;

	for (i = 1; i < 4; i++) {
		// diagonal SW
		col = column - i;
		row = myIndex - i;
		try {
			if (myColor != field[col][row]) break; // Auf falsche Farbe getroffen
		} catch (err) {
			break;
		}
	}
	if (i >= 4) return true;

	for (i = 1; i < 4; i++) {
		//diagonal SO
		col = column + i;
		row = myIndex - i;
		try {
			if (myColor != field[col][row]) break; // Auf falsche Farbe getroffen
		} catch (err) {
			break;
		}
	}
	if (i >= 4) return true;

	for (i = 1; i < 4; i++) {
		//diagonal NW
		col = column - i;
		row = myIndex + i;
		try {
			if (myColor != field[col][row]) break; // Auf falsche Farbe getroffen
		} catch (err) {
			break;
		}
	}
	if (i >= 4) return true;

	for (i = 1; i < 4; i++) {
		//diagonal NO
		col = column + i;
		row = myIndex + i;
		try {
			if (myColor != field[col][row]) break; // Auf falsche Farbe getroffen
		} catch (err) {
			break;
		}
	}
	if (i >= 4) return true;

	return false;
}

/*
 * Erstellt einen neuen Diskus im HTML
 */
function createNewDisk(column) {
	var newdisk = document.createElement("div");
	newdisk.setAttribute('class', 'disk ' + color);
	newdisk.setAttribute('id', 'disk' + disknr);
	newdisk.style.bottom = rowheight * rows + 'px';
	newdisk.style.left = column*colwidth + 'px';
	back.appendChild(newdisk);
	return newdisk;
}

/*
 * Abfrage, ob spielfeld voll ist
 */
function isRemis() {
	var diskCounter = 0;
	for (var i=0; i < cols; i++) {
		diskCounter += field[i].length;
	}
	if (diskCounter >= cols * rows) // spielfeld voll, daher unentschieden
		return true;
	return false;
}

function dispPlayerTurn() {
	var colorName = (color == "red" ? "rot" : "blau"); // Übersetzung ins Deutsche
	var infoElement = document.getElementById('info');
	var colorTag = document.createElement('span');
	colorTag.setAttribute('class', color);
	colorTag.appendChild(document.createTextNode(colorName));

	while (infoElement.firstChild)
		infoElement.removeChild(infoElement.firstChild); // entferne alten info-text

	infoElement.appendChild(colorTag);
	infoElement.appendChild( document.createTextNode(' ist dran') );
}

function dispWinner() {
	var colorName = (color == "red" ? "rot" : "blau"); // Übersetzung ins Deutsche
	var infoElement = document.getElementById('info');
	var colorTag = document.createElement('span');
	colorTag.setAttribute('class', color);
	colorTag.appendChild(document.createTextNode(colorName));

	while (infoElement.firstChild)
		infoElement.removeChild(infoElement.firstChild); // entferne alten info-text

	infoElement.appendChild(colorTag);
	infoElement.appendChild( document.createTextNode(' gewinnt!') );
}

/*
 * Liefert die Untergrenze der Spalte col in Pixel
 */
function getBottom(col) {
	return (field[col].length - 1) * rowheight;
}

/*
 * Absolute Position eines Elements ermitteln
 */
function getPosition(element) {
	var xPosition = 0;
	var yPosition = 0;

	while(element) {
		xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
		yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
		element = element.offsetParent;
	}
	return { x: xPosition, y: yPosition };
}

/*
 * Events hinzufügen
 */
function addListener(element, eventName, handler) {
	if (element.addEventListener) {
		element.addEventListener(eventName, handler, false);
	}
	else if (element.attachEvent) {
		element.attachEvent('on' + eventName, handler);
	}
	else {
		element['on' + eventName] = handler;
	}
}

/*
 * Events entfernen
 */
function removeListener(element, eventName, handler) {
	if (element.addEventListener) {
		element.removeEventListener(eventName, handler, false);
	}
	else if (element.detachEvent) {
		element.detachEvent('on' + eventName, handler);
	}
	else {
		element['on' + eventName] = null;
	}
}

window.onload = init;