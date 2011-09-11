/**
 * @preserve JavaScript module for calculating Mabinogi schedules.
 *
 * Copyright 2011 Saiyr (me@saiyr.org)
 *
 * License: http://www.opensource.org/licenses/mit-license.php
 *
 * Original work by Kakurady (Moongates, Price) and Huijun (Rua).
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
        ceo: 'Ceo Island',
        ceann: 'Port Ceann'
    },
    price: {
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
    },
    //This value should be modified with regards to DST
    serverOffset: -6 * 60 * 60 * 1000 - (60 * 1000 * 60) //GMT - 7
};

(function(l18n, window) {
    // Time
    var TIME_PER_ERINN_MINUTE = 1500; // 1.5 s
    var TIME_PER_ERINN_HOUR   = TIME_PER_ERINN_MINUTE * 60; // 1 min 30 s
    var TIME_PER_ERINN_DAY    = TIME_PER_ERINN_HOUR * 24; // 36 min

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

    // Price
    var priceEpoch = Date.parse('Mar 24, 2008 00:00:00 GMT');
    var priceList = function(p) {
        return [
            p.tir, p.dugald, p.dunbartonField, p.dragonRuins, p.bangorBar,
            p.senMag, p.emainAlley, p.ceo, p.emainIsland, p.senMag,
            p.dragonRuins, p.barri, p.dunbartonSchool, p.dugald
        ];
    }(l18n.price);

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

    var day = ' day';
    var days = ' days';
    var today = 'Today';
    var next = 'Next';

    /**
     * Determine the starting time and index into a list.
     */
    function listSelector(list, serverTime, epoch, nightShift) {
        var erinnDaysPassed = (serverTime - epoch) / TIME_PER_ERINN_DAY;
        var erinnHour = exports.serverTimeToErinnTime(serverTime).hour;
        var startTime = serverTime - (serverTime % TIME_PER_ERINN_DAY);
        var index = Math.floor(erinnDaysPassed) % list.length;

        // If this is a "night shift" timer, then the time changes at 6pm. In
        // addition, it before 6am, the starting point should be from the day
        // before.
        if (nightShift) {
            if (erinnHour < 6) {
                startTime -= 6 * TIME_PER_ERINN_HOUR;
            } else {
                startTime += 18 * TIME_PER_ERINN_HOUR;
            }
        }

        if (index < 0) {
            index += list.length;
        }
        return { time: startTime, index: index };
    }

    /**
     * Generate a function for getting the next N items in a list given a
     * server time as a starting point.
     */
    function nextItemsGenerator(list, epoch, nightShift) {
        return function(serverTime, count) {
            var start = listSelector(list, serverTime, epoch, nightShift);
            var items = [];

            for (var i = 0; i < count; i++) {
                items.push({
                    'time': new Date(start.time + TIME_PER_ERINN_DAY * i),
                    'item': list[(i + start.index) % list.length]
                });
            }
            return items;
        };
    }

    var exports = {
        getServerTimeMillis: function(date) {
            return (date || new Date()).getTime() + l18n.serverOffset;
        },
        getMoonGates: nextItemsGenerator(moonGateList, moonGateEpoch, true),
        getPriceLocations: nextItemsGenerator(priceList, priceEpoch, false),
        getRuaStatuses: nextItemsGenerator(ruaList, moonGateEpoch, true),
        serverTimeToErinnTime: function(serverTime) {
            return {
                'hour': Math.floor(serverTime / TIME_PER_ERINN_HOUR) % 24,
                'minute': Math.floor(serverTime / TIME_PER_ERINN_MINUTE) % 60
            };
        },
        getNextCeoMoonGate: function(serverTime) {
            var moonGatesFromNow = this.getMoonGates(serverTime,
                                                     moonGateList.length);
            for (var i = 0; i < moonGatesFromNow.length; i++) {
                if (moonGatesFromNow[i].item === l18n.moongate.ceo) {
                    return i;
                }
            }
        }
    };
    // Closure compiler exports. Used to preserve names on minification.
    window['mabiTimers'] = exports;
    exports['getServerTimeMillis'] = exports.getServerTimeMillis;
    exports['getMoonGates'] = exports.getMoonGates;
    exports['getPriceLocations'] = exports.getPriceLocations;
    exports['getRuaStatuses'] = exports.getRuaStatuses;
    exports['serverTimeToErinnTime'] = exports.serverTimeToErinnTime;
    exports['getNextCeoMoonGate'] = exports.getNextCeoMoonGate;
})(l18n, window);
