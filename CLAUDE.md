# CLAUDE.md — luci-app-netmap

Developer and AI-assistant guide for working on this codebase.

## Deploy to router

The router (`192.168.1.1`) does not have an SFTP server, so use stdin piping over SSH:

```sh
ssh -i ~/.ssh/openwrt_router root@192.168.1.1 "cat > /destination/path" < local/file
```

Full redeploy (run from repo root):

```sh
R="ssh -i ~/.ssh/openwrt_router root@192.168.1.1"
$R "mkdir -p /usr/share/netmap /usr/share/rpcd/ucode /usr/share/rpcd/acl.d /usr/share/luci/menu.d /www/luci-static/resources/view/netmap /etc/netmap /lib/upgrade/keep.d"

$R "cat > /usr/bin/netmap-scan"           < files/netmap.scan
$R "cat > /usr/share/netmap/assemble.uc"  < files/netmap-assemble.uc
$R "cat > /usr/share/netmap/oui.db"       < files/oui.db
$R "cat > /etc/init.d/netmap"             < files/netmap.init
$R "cat > /usr/share/rpcd/ucode/luci.netmap"           < luci/rpcd/luci.netmap
$R "cat > /usr/share/rpcd/acl.d/luci-app-netmap.json"  < luci/acl.d/luci-app-netmap.json
$R "cat > /usr/share/luci/menu.d/luci-app-netmap.json" < luci/menu.d/luci-app-netmap.json
$R "cat > /www/luci-static/resources/view/netmap/netmap.js" < www/resources/view/netmap/netmap.js

$R "chmod +x /usr/bin/netmap-scan /etc/init.d/netmap"
$R "/etc/init.d/rpcd restart && /etc/init.d/uhttpd restart"
```

After deploying JS, always hard-refresh the browser (Ctrl+Shift+R).

## File map

| Repo path | Router path | Purpose |
|-----------|-------------|---------|
| `files/netmap.scan` | `/usr/bin/netmap-scan` | Shell scan script |
| `files/netmap-assemble.uc` | `/usr/share/netmap/assemble.uc` | ucode JSON assembler |
| `files/netmap.init` | `/etc/init.d/netmap` | procd init + cron setup |
| `files/oui.db` | `/usr/share/netmap/oui.db` | MAC OUI database (TSV) |
| `luci/rpcd/luci.netmap` | `/usr/share/rpcd/ucode/luci.netmap` | ubus RPC handler |
| `luci/acl.d/luci-app-netmap.json` | `/usr/share/rpcd/acl.d/luci-app-netmap.json` | rpcd ACL |
| `luci/menu.d/luci-app-netmap.json` | `/usr/share/luci/menu.d/luci-app-netmap.json` | LuCI menu entry |
| `www/resources/view/netmap/netmap.js` | `/www/luci-static/resources/view/netmap/netmap.js` | LuCI JS view |

## Architecture

```
netmap-scan (shell) → TSV temp files → assemble.uc (ucode) → /etc/netmap/devices.json
                                                                        ↓
                                               luci.netmap (rpcd/ubus) ← LuCI JS view
```

### Scan pipeline (`netmap.scan`)

Each step writes a TSV to `$TMP_DIR`:

| Step | Output file | Content |
|------|-------------|---------|
| 1 | — | Network topology (LOCAL_IP, SCAN_NET, ROUTER_MACS) |
| 2 | `wifi_ifaces.txt`, `wifi_stations.txt`, `wifi_survey.txt` | Wireless interfaces, station dumps, channel survey |
| 3 | `dhcp.txt` | DHCP leases |
| 4 | `arp.txt` | ARP table (flushed twice around nmap ping sweep) |
| 5 | `nmap_os.txt` | OS fingerprints (deep mode only) |
| 6 | `health.txt` | CPU load, memory %, uptime, WAN latency |
| 7 | `latency.txt` | Per-host ping latency (parallel) |
| 8 | `existing.txt` | Custom names/types extracted from current devices.json |
| 9 | `devices.json` | Final assembled JSON via `assemble.uc` |

### Assembler args (positional, `assemble.uc`)

```
ARGV: arp dhcp stations ifaces nmap_os existing oui_db
      scan_net local_ip scan_mode now out_file router_macs latency survey health
```

### RPC methods (`luci.netmap`)

| Method | Args | Description |
|--------|------|-------------|
| `get_devices` | — | Full devices.json |
| `get_status` | — | Lightweight: scanning flag + counts |
| `trigger_scan` | `mode` | Start background scan |
| `set_device_name` | `mac`, `name`, `type` | Save custom name/type; sync static DHCP lease |

## Key gotchas

**ucode `for...of` is not valid** — use `for (let _i, val in array)`. The `for...of` form silently fails when called via `-e` with `2>/dev/null`. This was the root cause of custom names not persisting across scans.

**ACL path** — rpcd reads ACLs from `/usr/share/rpcd/acl.d/`, not `/usr/share/acl.d/`. Wrong path means the menu item disappears entirely because the `depends.acl` check fails.

**Static DHCP leases** — `set_device_name` writes a UCI `host` entry with `mac + ip + name`. A host entry without an IP field breaks dnsmasq completely and kills DHCP. Only create the entry when both name and IP are present.

**dnsmasq reload** — always run it as a background task with a short delay (`sleep 2 && reload &`) to avoid disrupting active DHCP leases. Synchronous reload from an rpcd handler can cause clients to lose their IP.

**SVG click delegation** — per-node click listeners added inside `renderTopology()` are destroyed every poll cycle. Wire the single click listener once in `render()` using `e.target.closest('[data-mac]')`.

**Static panel HTML** — any element with a persistent event listener (save button, edit row, close button) must live in the static HTML, not inside `renderDetail()`'s `innerHTML`. Only `#nm-dt-body` is replaced on device selection.

**Firmware upgrades** — sysupgrade wipes all manually-installed files. The file `/lib/upgrade/keep.d/luci-app-netmap` lists all paths to preserve. It includes itself so it survives subsequent upgrades too. `/etc/netmap/` is in `/etc/` and is preserved by "Keep settings" automatically.

**Cron schedule** — quick scan runs `*/5 * * * *`, deep scan runs `15,45 * * * *` (staggered to never overlap with quick). Both hitting the same minute caused the lock file to block the deep scan every 30 minutes.

## devices.json structure

```json
{
  "meta": {
    "router_ip": "192.168.1.1",
    "network": "192.168.1.0/24",
    "last_scan": "2026-05-23T15:10:00Z",
    "scan_mode": "quick",
    "device_count": 35,
    "health": { "load_pct": 3, "mem_pct": 18, "uptime_s": 4753, "wan_ms": 1 }
  },
  "interfaces": [
    { "name": "wired", "type": "wired", "display": "Wired (Ethernet)", ... },
    { "name": "phy1-ap0", "type": "wifi", "ssid": "...", "band": "5GHz",
      "channel": 36, "noise": -92, "busy_pct": 9, "tx_pct": 2, "rx_pct": 3 }
  ],
  "devices": [
    {
      "mac": "aa:bb:cc:dd:ee:ff",
      "ip": "192.168.1.x",
      "hostname": "...",
      "custom_name": "",
      "custom_type": "",
      "vendor": "Apple",
      "device_type": "phone_apple",
      "interface": "phy1-ap0",
      "signal": -62,
      "tx_rate": 300.0, "rx_rate": 243.0,
      "tx_failed": 42, "tx_retries": 128, "inactive_ms": 300,
      "latency_ms": 3,
      "os_guess": "",
      "online": true,
      "first_seen": "2026-01-01T00:00:00Z",
      "last_seen": "2026-05-23T15:10:00Z"
    }
  ]
}
```

## Testing a scan

```sh
ssh -i ~/.ssh/openwrt_router root@192.168.1.1 'netmap-scan quick 2>&1 | tail -10'
ssh -i ~/.ssh/openwrt_router root@192.168.1.1 'logread | grep netmap | tail -20'
```

Check health data reached the JSON:
```sh
ssh -i ~/.ssh/openwrt_router root@192.168.1.1 'ubus call luci.netmap get_devices | head -c 400'
```
