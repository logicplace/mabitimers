// DOM helpers
function addRow(myTop, myPrefix) {
    var myRow; var myCell1; var myCell2; var myCell3;
    var myShown;
    switch (myPrefix) {
    case 'mg':myShown = nGatesShown; break;
    case 'pr':myShown = nPriceShown; break;
    case 'rua':myShown = nRuaShown; break;
    default:
    }
    myRow = document.createElement('TR');
    myRow.id=myPrefix+'Row'+myShown;
    myRow.className='mgrow';
    //myCell1 = document.createElement('TD');
    //myCell1.id=myPrefix+'lbl'+myShown;
    //myCell1.className='mglabel';
    myCell2 = document.createElement('TD');
    myCell2.id=myPrefix+'tm'+myShown;
    myCell2.className='mglabel2';
    myCell3 = document.createElement('TD');
    myCell3.id=myPrefix+'txt'+myShown;
    myCell3.className='mgtext';

    //myCell1.appendChild(document.createTextNode('in ' + myShown + ' days'));
    myCell2.appendChild(document.createTextNode('one'));
    myCell3.appendChild(document.createTextNode('moment...'));
    //myRow.appendChild(myCell1);
    myRow.appendChild(myCell2);
    myRow.appendChild(myCell3);

    document.getElementById(myTop).appendChild(myRow);
    switch (myPrefix) {
    case 'mg':
        nGatesShown++;
        nGatesChanged = true; break;
    case 'pr':
        nPriceShown++;
        nPriceChanged = true; break;
    case 'rua':
        nRuaShown++;
        nRuaChanged = true; break;
    default:
    }
    doSomething();
}
function removeRow() {
    var myRow;

    if (nGatesShown > 2) {
        nGatesShown--;
        myRow = document.getElementById('mgRow'+nGatesShown);
        document.getElementById('mgtblbody0').removeChild(myRow);
        nGatesChanged = true;
    }
}
function removeRow1() {
    var myRow;

    if (nPriceShown > 2) {
        nPriceShown--;
        myRow = document.getElementById('prRow'+nPriceShown);
        document.getElementById('prtblbody0').removeChild(myRow);
        nPriceChanged = true;
    }
}
function removeRow2() {
    var myRow;

    if (nRuaShown > 2) {
        nRuaShown--;
        myRow = document.getElementById('ruaRow'+nRuaShown);
        document.getElementById('ruatblbody0').removeChild(myRow);
        nRuaChanged = true;
    }
}

function formatTime(hours, minutes) {
    var hoursPrefix = hours < 10 ? '0' : '';
    var minutesPrefix = minutes < 10 ? ':0' : ':';
    return hoursPrefix + hours + minutesPrefix + minutes;
}

var nGatesShown = 6;
var nPriceShown = 2;
var nRuaShown = 2;

function updateCells(items, timePrefix, textPrefix) {
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var time = item['time'];
        document.getElementById(timePrefix + i).firstChild.nodeValue =
            formatTime(time.getUTCHours(), time.getUTCMinutes());
        document.getElementById(textPrefix + i).firstChild.nodeValue =
            item.item;
    }
}

function doSomething() {
    var date = new Date();

    //add the offset (in milliseconds) to UTC to get server time
    var serverTime = mabiTimers.getServerTimeMillis(date);

    //game time
    var erinnTime = mabiTimers.serverTimeToErinnTime(serverTime);
    var erinnHour = erinnTime.hour;
    var erinnMinute = erinnTime.minute;
    //erinnDay = Math.floor(serverTime / TIME_PER_ERINN_DAY) % 40;

    //convert the milliseconds back to Date for easy displaying
    var serverDate = new Date(serverTime);

    //access the document
    //textContent is not supported by IE 7
    document.getElementById('tGameTime').firstChild.nodeValue =
        formatTime(erinnHour, erinnMinute);
    document.getElementById('trealtime1').firstChild.nodeValue =
        formatTime(date.getHours(), date.getMinutes());
    document.getElementById('trealtime2').firstChild.nodeValue =
        formatTime(serverDate.getUTCHours(), serverDate.getUTCMinutes());

    // document.getElementById('date').firstChild.nodeValue = 'Day '+ erinnDay;

    var moonGates = mabiTimers.getMoonGates(serverTime, nGatesShown);
    var priceLocations = mabiTimers.getPriceLocations(serverTime, nPriceShown);
    var ruaStatuses = mabiTimers.getRuaStatuses(serverTime, nRuaShown);

    updateCells(moonGates, 'mgtm', 'mgtxt');
    updateCells(priceLocations, 'prtm', 'prtxt');
    updateCells(ruaStatuses, 'ruatm', 'ruatxt');

    var nextCeo = mabiTimers.getNextCeoMoonGate(serverTime);
    document.getElementById('mgtxtceo').firstChild.nodeValue =
        nextCeo + (nextCeo == 1 ? ' day' : ' days');
}

window.setInterval(doSomething, 200);
