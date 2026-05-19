# luci-app-netmap

A visual network topology dashboard for OpenWrt. Scans your home network, identifies every device by type, and renders an interactive SVG map grouped by interface (wired, 2.4 GHz, 5 GHz).

[assets/screenshot.png]

## Features

- **Automatic discovery** — ARP sweep + nmap ping scan finds all reachable devices
- **Device classification** — MAC OUI lookup, hostname pattern matching, and nmap OS fingerprinting combine to identify phones, tablets, TVs, speakers, printers, IoT devices, APs, and more
- **SVG topology view** — router at the centre, devices grouped under their interface/radio
- **Device table** — filterable, sortable list with vendor, IP, MAC, signal strength, and TX/RX rates for wireless clients
- **Quick and deep scan modes** — quick (ARP + wireless) runs every 5 minutes; deep (adds nmap OS fingerprinting) runs every 30 minutes
- **Persistent history** — first-seen timestamps and custom device names survive rescans
- **~880-entry OUI database** — covers Apple, Samsung, Google, Amazon, Nest, Sonos, TP-Link, Ubiquiti, MikroTik, Espressif, Raspberry Pi, HP, Canon, and many more

## Requirements

- OpenWrt 25.12 or later (ucode-based LuCI architecture)
- Packages: `luci-base`, `iw`, `nmap`, `ip-full`

## Manual installation

Until a package feed is available, deploy directly over SSH:

```sh
# 1. Copy the scan script
cat files/netmap.scan      | ssh root@192.168.1.1 "cat > /usr/bin/netmap-scan && chmod +x /usr/bin/netmap-scan"

# 2. Copy the ucode assembler and OUI database
ssh root@192.168.1.1 "mkdir -p /usr/share/netmap"
cat files/netmap-assemble.uc | ssh root@192.168.1.1 "cat > /usr/share/netmap/assemble.uc"
cat files/oui.db             | ssh root@192.168.1.1 "cat > /usr/share/netmap/oui.db"

# 3. Copy the rpcd ucode handler
cat luci/rpcd/luci.netmap              | ssh root@192.168.1.1 "cat > /usr/share/rpcd/ucode/luci.netmap"
cat luci/acl.d/luci-app-netmap.json   | ssh root@192.168.1.1 "cat > /usr/share/rpcd/acl.d/luci-app-netmap.json"
cat luci/menu.d/luci-app-netmap.json  | ssh root@192.168.1.1 "cat > /usr/share/luci/menu.d/luci-app-netmap.json"

# 4. Copy the LuCI JS view
ssh root@192.168.1.1 "mkdir -p /www/luci-static/resources/view/netmap"
cat www/resources/view/netmap/netmap.js | ssh root@192.168.1.1 "cat > /www/luci-static/resources/view/netmap/netmap.js"

# 5. Copy the init script and start the service
cat files/netmap.init | ssh root@192.168.1.1 "cat > /etc/init.d/netmap && chmod +x /etc/init.d/netmap"
ssh root@192.168.1.1 "/etc/init.d/netmap enable && /etc/init.d/netmap start"

# 6. Restart rpcd to pick up the new ubus handler
ssh root@192.168.1.1 "/etc/init.d/rpcd restart"
```

Then open **Network → Network Map** in LuCI.

## Project structure

```
luci-app-netmap/
├── files/
│   ├── netmap.scan          # Shell scan script (/usr/bin/netmap-scan)
│   ├── netmap-assemble.uc   # ucode JSON assembler (/usr/share/netmap/assemble.uc)
│   ├── netmap.init          # procd init + cron (/etc/init.d/netmap)
│   └── oui.db               # MAC OUI database (/usr/share/netmap/oui.db)
├── luci/
│   ├── rpcd/luci.netmap     # ubus RPC handler (/usr/share/rpcd/ucode/luci.netmap)
│   ├── acl.d/               # rpcd ACL (/usr/share/rpcd/acl.d/)
│   └── menu.d/              # LuCI menu entry (/usr/share/luci/menu.d/)
└── www/
    └── resources/view/netmap/netmap.js   # LuCI JS view
```

## Scan modes

| Mode | Trigger | What it does |
|------|---------|--------------|
| `quick` | Every 5 min (cron) | ARP sweep + nmap ping + wireless station dump |
| `deep` | Every 30 min (cron) | Quick + nmap OS fingerprinting (`-O --osscan-guess`) |
| Manual | LuCI button | Either mode on demand |

## Device types

`phone_apple` · `phone_android` · `tablet` · `computer` · `tv` · `streaming` · `speaker` · `printer` · `gaming` · `nas` · `iot` · `ap` · `powerline` · `unknown`

Classification priority: hostname pattern → OUI device-type hint → nmap OS string.

## License

GPL-2.0
