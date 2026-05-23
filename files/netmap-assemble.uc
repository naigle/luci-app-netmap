#!/usr/bin/ucode
// /usr/share/netmap/assemble.uc
// Merges scan TSV data into /etc/netmap/devices.json
// Args: arp dhcp stations ifaces nmap_os existing oui_db
//       scan_net local_ip scan_mode now out_file router_macs_str latency

'use strict';

import { open } from 'fs';

let ai = 0;
let arp_f      = ARGV[ai++];
let dhcp_f     = ARGV[ai++];
let sta_f      = ARGV[ai++];
let iface_f    = ARGV[ai++];
let nmap_f     = ARGV[ai++];
let exist_f    = ARGV[ai++];
let oui_f      = ARGV[ai++];
let scan_net   = ARGV[ai++];
let local_ip   = ARGV[ai++];
let scan_mode  = ARGV[ai++];
let now        = ARGV[ai++];
let out_f      = ARGV[ai++];
let router_macs_str = ARGV[ai++] ?? '';
let latency_f       = ARGV[ai++] ?? '';

// Router MACs to exclude (keyed object for O(1) lookup)
let routerMacs = {};
let _rmArr = split(trim(router_macs_str), ' ');
for (let _i, m in _rmArr) {
    if (length(m)) routerMacs[uc(replace(m, ':', ''))] = true;
}

// ---- TSV reader ----
function readTSV(path) {
    let rows = [];
    let f = open(path, 'r');
    if (!f) return rows;
    let line;
    while ((line = f.read('line')) !== null) {
        line = rtrim(line, '\r\n');
        if (!length(line) || substr(line, 0, 1) === '#') continue;
        push(rows, split(line, '\t'));
    }
    f.close();
    return rows;
}

// ---- OUI database ----
let ouiDB = {};
let _ouiRows = readTSV(oui_f);
for (let _i, row in _ouiRows) {
    if (length(row) >= 3 && row[0] && substr(row[0], 0, 1) !== '#')
        ouiDB[uc(row[0])] = [ row[1], row[2] ];
}

function ouiLookup(mac) {
    let prefix = substr(uc(replace(mac, ':', '')), 0, 6);
    let hit = ouiDB[prefix];
    return hit ?? [ 'Unknown', 'unknown' ];
}

// ---- Classification rules ----
let HOSTNAME_RULES = [
    [ /iphone/i,                         'phone_apple'  ],
    [ /ipad/i,                           'tablet'       ],
    [ /macbook|imac/i,                   'computer'     ],
    [ /android|galaxy|pixel/i,           'phone_android'],
    [ /xbox/i,                           'gaming'       ],
    [ /playstation|ps[2345]/i,           'gaming'       ],
    [ /nintendo|nswitch/i,               'gaming'       ],
    [ /firetv|fire.tv|chromecast|roku/i, 'streaming'    ],
    [ /appletv|apple.tv/i,               'streaming'    ],
    [ /echo|alexa/i,                     'speaker'      ],
    [ /sonos|homepod/i,                  'speaker'      ],
    [ /printer|officejet|laserjet|envy|deskjet|pixma/i, 'printer' ],
    [ /bravia|androidtv|hisense|vizio|lgwebos/i, 'tv'  ],
    [ /diskstation|readynas|mycloud|truenas/i, 'nas'    ],
    [ /shelly|tasmota|esphome/i,         'iot'          ],
    [ /raspberry|raspberrypi|rpi/i,      'iot'          ],
    [ /esp_|esp8266|esp32/i,             'iot'          ],
    [ /lifx/i,                           'iot'          ],
    [ /led.strip|led.bulb|smart.bulb/i,  'iot'          ],
    [ /homeplug|devolo|powerline/i,      'powerline'    ],
    [ /openwrt|ubnt|unifi|eero|orbi|velop|deco/i, 'ap' ],
    [ /^mac$/i,                          'computer'     ],
    [ /homeassistant|hass/i,             'iot'          ],
    [ /lightwaverf|lightwave/i,          'iot'          ],
    [ /arlo/i,                           'iot'          ],
    [ /octo|octoprint/i,                 'iot'          ],
    [ /pihole|pialert/i,                 'iot'          ],
];

let OS_RULES = [
    [ /ios|iphone|ipad/i,              'phone_apple'  ],
    [ /android/i,                      'phone_android'],
    [ /windows/i,                      'computer'     ],
    [ /mac os|macos|darwin/i,          'computer'     ],
    [ /game console|playstation|xbox/i,'gaming'       ],
    [ /printer/i,                      'printer'      ],
    [ /broadband router|wireless/i,    'ap'           ],
    [ /embedded/i,                     'iot'          ],
];

function classify(hostname, ouiType, osGuess) {
    for (let _i, rule in HOSTNAME_RULES)
        if (match(hostname, rule[0])) return rule[1];
    if (ouiType && ouiType !== 'unknown') return ouiType;
    for (let _i, rule in OS_RULES)
        if (match(osGuess, rule[0])) return rule[1];
    return 'unknown';
}

// ---- Load all data files ----
let arpRows     = readTSV(arp_f);
let dhcpRows    = readTSV(dhcp_f);
let staRows     = readTSV(sta_f);
let ifaceRows   = readTSV(iface_f);
let nmapRows    = readTSV(nmap_f);
let existRows   = readTSV(exist_f);
let latencyRows = readTSV(latency_f);

// ---- Build lookup maps ----
let macToIP  = {};
let ipToMac  = {};
for (let _i, row in arpRows) {
    let ip = row[0]; let mac = row[1];
    if (ip && mac) {
        macToIP[lc(mac)] = ip;
        ipToMac[ip]      = lc(mac);
    }
}

let dhcpInfo = {};
for (let _i, row in dhcpRows) {
    if (row[0]) dhcpInfo[lc(row[0])] = { ip: row[1] ?? '', hostname: row[2] ?? '' };
}

let stations = {};
for (let _i, row in staRows) {
    if (row[0]) {
        stations[lc(row[0])] = {
            iface:   row[1] ?? 'wired',
            signal:  length(row[2]) ? +row[2] : null,
            tx_rate: length(row[3]) ? +row[3] : null,
            rx_rate: length(row[4]) ? +row[4] : null,
        };
    }
}

let nmapOS = {};
for (let _i, row in nmapRows)
    if (row[0]) nmapOS[row[0]] = trim(row[1] ?? '');

let existing = {};
for (let _i, row in existRows)
    if (row[0]) existing[lc(row[0])] = { first_seen: row[1] ?? '', custom_name: row[2] ?? '' };

let latencyMS = {};
for (let _i, row in latencyRows)
    if (row[0] && length(row[1])) latencyMS[row[0]] = +row[1];

// ---- Collect unique MACs ----
let allMacs = {};
for (let _i, row in arpRows)
    if (row[1]) allMacs[lc(row[1])] = true;
for (let mac in stations)
    allMacs[mac] = true;

// ---- Build device list ----
let devices = [];
for (let mac in allMacs) {
    if (!mac || mac === 'ff:ff:ff:ff:ff:ff') continue;
    let macClean = uc(replace(mac, ':', ''));
    if (routerMacs[macClean]) continue;
    let ip       = macToIP[mac] ?? (dhcpInfo[mac] ? dhcpInfo[mac].ip : '');
    if (ip === local_ip) continue;

    let hostname = dhcpInfo[mac] ? dhcpInfo[mac].hostname : '';
    let sta      = stations[mac];
    let osGuess  = nmapOS[ip] ?? '';

    let ouiResult  = ouiLookup(mac);
    let vendor     = ouiResult[0];
    let ouiType    = ouiResult[1];
    let deviceType = classify(hostname, ouiType, osGuess);

    let hist      = existing[mac] ?? {};
    let firstSeen = length(hist.first_seen) ? hist.first_seen : now;

    push(devices, {
        mac,
        ip,
        hostname,
        custom_name:  hist.custom_name ?? '',
        vendor,
        device_type:  deviceType,
        interface:    sta ? sta.iface    : 'wired',
        signal:       sta ? sta.signal   : null,
        tx_rate:      sta ? sta.tx_rate  : null,
        rx_rate:      sta ? sta.rx_rate  : null,
        latency_ms:   latencyMS[ip] ?? null,
        os_guess:     osGuess,
        online:       true,
        first_seen:   firstSeen,
        last_seen:    now,
    });
}

// ---- Build interface list ----
let interfaces = [{
    name: 'wired', type: 'wired', display: 'Wired (Ethernet)',
    ssid: '', band: '', channel: 0
}];
for (let _i, row in ifaceRows) {
    if (!row[0]) continue;
    push(interfaces, {
        name:    row[0],
        type:    'wifi',
        display: (row[2] ?? '?') + ' (' + row[0] + ')',
        ssid:    row[1] ?? '',
        band:    row[2] ?? '',
        channel: length(row[3]) ? +row[3] : 0,
    });
}

// ---- Output ----
let output = {
    meta: {
        router_ip:    local_ip,
        network:      scan_net,
        last_scan:    now,
        scan_mode,
        device_count: length(devices),
    },
    interfaces,
    devices,
};

let tmp = out_f + '.tmp';
let wf  = open(tmp, 'w');
if (!wf) {
    warn('netmap-assemble: cannot write ' + tmp + '\n');
    exit(1);
}
wf.write(sprintf('%J', output));
wf.close();
system([ 'mv', tmp, out_f ]);
warn('netmap-assemble: wrote ' + length(devices) + ' devices -> ' + out_f + '\n');
