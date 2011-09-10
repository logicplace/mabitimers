/**
 * @preserve Javascript widget for Moongates. Last edit 2008-03-24 22:26
 * Author: Kakurady
 * 星月门脚本。最后更新 2008-03-24 22:26
 * 作者: 卡库拉迪
 */

// Schedules are current as of G10 in NA
// In case someone wants to translate this for whatever reason
var l18n = {
    moongate: {
        tir: 'Tir Chonaill',
        dunbarton: 'Dunbarton',
        bangor: 'Bangor',
        emain: 'Emain Macha',
        taillteann: 'Taillteann',
        tara: 'Tara',
        ceo: 'Ceo',
        ceann: 'Port Ceann'
    },
    pryce: {
        tir: 'Outside Tir Chonaill Inn',
        dugald: 'Dugald Aisle Logging Camp Hut',
        dunbartonField: 'Dunbarton East Potato Field',
        dragonRuins: 'Dragon Ruins - House at 5 o\'clock ',
        bangorBar: 'Bangor Bar',
        senMag: 'Sen Mag 5th house from West',
        emainAlley: 'Emain Macha - Alley Behind Weapon Shop',
        ceo: 'Ceo Island',
        emainIsland: 'Emain Macha - Island in South Pathway',
        barri: 'Outside Barri Dungeon',
        dunbartonSchool: 'Dunbarton School Stairway'
    },
    rua: {
        rest: 'Resting',
        work: 'Working'
    }
};

(function(l18n, window) {
    // Time
    var date; //current time
    var timePerErinnHour = 90000; //1 min 30 s
    var timePerErinnMinute = 1500; //1.5 s
    var timePerErinnDay = 2160000; //36 min

    var serverTime; //current timeof server since unix epoch
    var serverDate; //for display of server time only

    var erinnDay;
    var erinnHour;
    var erinnMinute;

    //This value should be modified with regards to DST
    var serverOffset = -6 * 60 * 60 * 1000 - (60 * 1000 * 60); //GMT - 7

    // Moongate
    var moonGateEpoch = Date.parse('Mar 23, 2008 22:21:00 GMT');
    var moonGateList = function(m) {
        return [
            m.tara, m.ceo, m.tir, m.taillteann, m.emain, m.tara, m.dunbarton,
            m.ceann, m.bangor, m.emain, m.tara, m.tir, m.taillteann, m.ceo,
            m.emain, m.tara, m.bangor, m.dunbarton, m.ceann, m.tara,
            m.taillteann, m.tir, m.dunbarton, m.bangor
        ];
    }(l18n.moongate);
    var moongateTime; // a number
    var moongateDate; // a Date
    var moonGate;
    var lastmoonGate;
    var i; // iterator for moongate labels
    var nGatesShown = 6;
    var nGatesChanged = false;

    // Pryce
    var pryceEpoch = Date.parse('Mar 24, 2008 00:00:00 GMT');
    var pryceList = function(p) {
        return [
            p.tir, p.dugald, p.dunbartonField, p.dragonRuins, p.bangorBar,
            p.senMag, p.emainAlley, p.ceo, p.emainIsland, p.senMag,
            p.dragonRuins, p.barri, p.dunbartonSchool, p.dugald
        ];
    }(l18n.pryce);
    var pryce;
    var lastPryce;
    var nPryceShown = 2;
    var nPryceChanged = false;

    // Rua
    var ruaList = function(r) {
        var rest = r.rest;
        var work = r.work;
        return [
            rest, rest, rest, work, rest, rest, rest, rest, work, rest, rest,
            work, rest, work, work, rest, work, work, work, rest, rest, rest,
            rest, rest, rest, rest, work, rest, work, rest, rest, work, rest,
            rest, rest, work, rest, rest, rest, work, rest, rest, work
        ];
    }(l18n.rua);
    var rua;
    var lastRua;
    var nRuaShown = 2;
    var nRuaChanged = false;

    var day=' day';
    var days=' days';
    var today='Today';
    var next='Next';

    var exports = {
        doSomething: function() {
            date = new Date();

            //add the offset (in milliseconds) to UTC to get server time
            serverTime = date.getTime() + serverOffset;

            //game time
            erinnHour = Math.floor(serverTime / timePerErinnHour) % 24;
            erinnMinute = Math.floor(serverTime / timePerErinnMinute) % 60;

            //erinnDay = Math.floor(serverTime / timePerErinnDay) % 40;

            //moongate target
            moonGate = Math.floor(
                (serverTime - moonGateEpoch) / timePerErinnDay % moonGateList.length
            );    if (moonGate < 0) {moonGate += moonGateList.length;};
            pryce = Math.floor(
                (serverTime - pryceEpoch) / timePerErinnDay % pryceList.length
            );    if (pryce < 0) {pryce += pryceList.length;};
            rua = Math.floor(
                (serverTime - moonGateEpoch) / timePerErinnDay % ruaList.length
            );    if (rua < 0) {rua += ruaList.length;};

            //convert the milliseconds back to Date for easy displaying
            serverDate = new Date(serverTime);


            //access the document
            //textContent is not supported by IE 7
            document.getElementById('tGameTime').firstChild.nodeValue = erinnHour + ((erinnMinute < 10)?':0':':') + erinnMinute ;
            document.getElementById('trealtime1').firstChild.nodeValue = date.getHours() + ((date.getMinutes() < 10)?':0':':') + date.getMinutes();
            document.getElementById('trealtime2').firstChild.nodeValue = serverDate.getUTCHours() + ((serverDate.getUTCMinutes() < 10)?':0':':') + serverDate.getUTCMinutes();
            // document.getElementById('date').firstChild.nodeValue = 'Day '+ erinnDay;

            //TODO: adjust how many moongate we have easier
            //TODO: No need to parse the gates each time this runs.
            if(nGatesChanged || moonGate != lastmoonGate) {

                moongateTime = serverTime - Math.floor(serverTime % timePerErinnDay); //the server time for the current Erinn day's midnight
                moongateTime += (
                    (erinnHour < 6)? //yesterday's gate?
                        -6*timePerErinnHour :
                        18*timePerErinnHour)
                    - serverOffset; //  so it's UTC again

                for(i=0; i < nGatesShown ; moongateTime += timePerErinnDay, i++) {
                    moongateDate  = new Date(moongateTime); // so as not to worry about converting dates!

                    //Moongate Time
                    document.getElementById('mgtm'+i).firstChild.nodeValue = moongateDate.getHours() + ((moongateDate.getMinutes() < 10)?':0':':') + moongateDate.getMinutes();
                    //Moongate Destination
                    document.getElementById('mgtxt'+i).firstChild.nodeValue = moonGateList[(moonGate + i) % moonGateList.length];
                }
                for(i=0; i<moonGateList.length; i++) {
                    if (moonGateList[(moonGate + i) % moonGateList.length] == l18n.moongate.ceo) { // ceo
                        document.getElementById('mgtxtceo').firstChild.nodeValue = i + ((i==1)?day: days);
                        break;
                    }
                }

                lastmoonGate = moonGate;
                nGatesChanged = false;
            }
            if(nPryceChanged|| pryce != lastPryce) {

                moongateTime = serverTime - Math.floor(serverTime % timePerErinnDay); //the server time for the current Erinn day's midnight
                moongateTime -= serverOffset;

                for(i=0; i < nPryceShown ; moongateTime += timePerErinnDay, i++) {
                    moongateDate  = new Date(moongateTime); // so as not to worry about converting dates!

                    //Moongate Time
                    document.getElementById('prtm'+i).firstChild.nodeValue = moongateDate.getHours() + ((moongateDate.getMinutes() < 10)?':0':':') + moongateDate.getMinutes();
                    //Moongate Destination
                    document.getElementById('prtxt'+i).firstChild.nodeValue = pryceList[(pryce + i) % pryceList.length];
                }
                lastPryce = pryce;
                nPryceChanged = false;
            }
            //setContent(s, d.getTime());

            if(nRuaChanged|| rua != lastRua) {

                moongateTime = serverTime - Math.floor(serverTime % timePerErinnDay); //the server time for the current Erinn day's midnight
                moongateTime += (
                    (erinnHour < 6)? //yesterday's gate?
                        -6*timePerErinnHour :
                        18*timePerErinnHour)
                    - serverOffset; //  so it's UTC again

                for(i=0; i < nRuaShown; moongateTime += timePerErinnDay, i++) {

                    moongateDate  = new Date(moongateTime); // so as not to worry about converting dates!

                    //Rua Time
                    document.getElementById('ruatm'+i).firstChild.nodeValue = moongateDate.getHours() + ((moongateDate.getMinutes() < 10)?':0':':') + moongateDate.getMinutes();
                    //Rua Status
                    document.getElementById('ruatxt'+i).firstChild.nodeValue = ruaList[(rua + i) % ruaList.length];
                }
                lastRua = rua;
                nRuaChanged = false;
            }
        }
    };
    // Closure compiler exports. Used to preserve names on minification.
    window['mabiTimers'] = exports;
    exports['doSomething'] = exports.doSomething;
})(l18n, window);

window.setInterval(mabiTimers.doSomething, 200);

// DOM helpers
window['addRow'] = function(myTop, myPrefix) {
    var myRow; var myCell1; var myCell2; var myCell3;
    var myShown;
    switch (myPrefix) {
    case 'mg':myShown = nGatesShown; break;
    case 'pr':myShown = nPryceShown; break;
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
        nPryceShown++;
        nPryceChanged = true; break;
    case 'rua':
        nRuaShown++;
        nRuaChanged = true; break;
    default:
    }
    mabiTimers.doSomething();
},
window['removeRow'] = function() {
    //TODO:Check if rows can be removed
    var myRow;

    if (nGatesShown > 2) {
        nGatesShown--;
        myRow = document.getElementById('mgRow'+nGatesShown);
        document.getElementById('mgtblbody0').removeChild(myRow);
        nGatesChanged = true;
    }
},
window['removeRow1'] = function() {
    //TODO:Check if rows can be removed
    var myRow;

    if (nPryceShown > 2) {
        nPryceShown--;
        myRow = document.getElementById('prRow'+nPryceShown);
        document.getElementById('prtblbody0').removeChild(myRow);
        nPryceChanged = true;
    }
},
window['removeRow2'] = function() {
    //TODO:Check if rows can be removed
    var myRow;

    if (nRuaShown > 2) {
        nRuaShown--;
        myRow = document.getElementById('ruaRow'+nRuaShown);
        document.getElementById('ruatblbody0').removeChild(myRow);
        nRuaChanged = true;
    }
}
