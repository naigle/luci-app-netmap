'use strict';
'require view';
'require poll';
'require rpc';

// ============================================================
// RPC declarations
// ============================================================
const callGetDevices = rpc.declare({
	object: 'luci.netmap',
	method: 'get_devices',
	expect: {}
});
const callGetStatus = rpc.declare({
	object: 'luci.netmap',
	method: 'get_status',
	expect: {}
});
const callScan = rpc.declare({
	object: 'luci.netmap',
	method: 'trigger_scan',
	params: ['mode'],
	expect: {}
});

// ============================================================
// Icons  (24×24 SVG path content, stroke="currentColor")
// ============================================================
const ICONS = {
	router:
		'<circle cx="12" cy="6" r="3" stroke-width="1.6"/>' +
		'<path d="M12 9v3M8 18h8M12 12v6" stroke-width="1.6" stroke-linecap="round"/>' +
		'<path d="M6 16c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke-width="1.6" stroke-linecap="round"/>' +
		'<line x1="9" y1="3.5" x2="6" y2="1" stroke-width="1.4" stroke-linecap="round"/>' +
		'<line x1="15" y1="3.5" x2="18" y2="1" stroke-width="1.4" stroke-linecap="round"/>',

	computer:
		'<rect x="3" y="4" width="18" height="13" rx="2" stroke-width="1.6"/>' +
		'<path d="M8 21h8M12 17v4" stroke-width="1.6" stroke-linecap="round"/>',

	phone_apple:
		'<rect x="7" y="2" width="10" height="20" rx="3" stroke-width="1.6"/>' +
		'<path d="M10 5h4" stroke-width="1.4" stroke-linecap="round"/>' +
		'<circle cx="12" cy="19" r="1" fill="white" stroke="none"/>',

	phone_android:
		'<rect x="7" y="2" width="10" height="20" rx="2" stroke-width="1.6"/>' +
		'<line x1="10" y1="6" x2="14" y2="6" stroke-width="1.4" stroke-linecap="round"/>' +
		'<line x1="10" y1="18" x2="14" y2="18" stroke-width="1.4" stroke-linecap="round"/>',

	tablet:
		'<rect x="4" y="3" width="16" height="18" rx="2" stroke-width="1.6"/>' +
		'<circle cx="12" cy="19" r="1" fill="white" stroke="none"/>',

	tv:
		'<rect x="2" y="4" width="20" height="14" rx="2" stroke-width="1.6"/>' +
		'<path d="M8 20h8M12 18v2" stroke-width="1.6" stroke-linecap="round"/>' +
		'<circle cx="12" cy="11" r="3" stroke-width="1.4"/>',

	streaming:
		'<rect x="2" y="6" width="20" height="12" rx="2" stroke-width="1.6"/>' +
		'<path d="M8 20h8M12 18v2" stroke-width="1.6" stroke-linecap="round"/>' +
		'<path d="M9 11l2 2 4-4" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',

	speaker:
		'<circle cx="12" cy="12" r="9" stroke-width="1.6"/>' +
		'<circle cx="12" cy="12" r="3.5" stroke-width="1.4"/>' +
		'<path d="M6 12c0-3.31 2.69-6 6-6" stroke-width="1.4" stroke-linecap="round"/>' +
		'<path d="M18 12c0 3.31-2.69 6-6 6" stroke-width="1.4" stroke-linecap="round"/>',

	printer:
		'<path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke-width="1.6"/>' +
		'<rect x="6" y="14" width="12" height="8" rx="1" stroke-width="1.6"/>' +
		'<line x1="9" y1="17" x2="15" y2="17" stroke-width="1.3" stroke-linecap="round"/>' +
		'<line x1="9" y1="20" x2="15" y2="20" stroke-width="1.3" stroke-linecap="round"/>',

	gaming:
		'<path d="M6 9a6 6 0 0112 0v4a6 6 0 01-12 0V9z" stroke-width="1.6"/>' +
		'<line x1="10" y1="11" x2="10" y2="15" stroke-width="1.6" stroke-linecap="round"/>' +
		'<line x1="8" y1="13" x2="12" y2="13" stroke-width="1.6" stroke-linecap="round"/>' +
		'<circle cx="15" cy="11" r="0.8" fill="white" stroke="none"/>' +
		'<circle cx="17" cy="13" r="0.8" fill="white" stroke="none"/>',

	powerline:
		'<path d="M12 2v7l-3 3h6l-3-3" stroke-width="1.6" stroke-linejoin="round"/>' +
		'<rect x="7" y="12" width="10" height="8" rx="2" stroke-width="1.6"/>' +
		'<circle cx="10" cy="16" r="1.2" fill="white" stroke="none"/>' +
		'<circle cx="14" cy="16" r="1.2" fill="white" stroke="none"/>',

	nas:
		'<rect x="3" y="4" width="18" height="5" rx="1.5" stroke-width="1.6"/>' +
		'<rect x="3" y="11" width="18" height="5" rx="1.5" stroke-width="1.6"/>' +
		'<circle cx="18" cy="6.5" r="1" fill="white" stroke="none"/>' +
		'<circle cx="18" cy="13.5" r="1" fill="white" stroke="none"/>' +
		'<line x1="6" y1="6.5" x2="14" y2="6.5" stroke-width="1.2" stroke-linecap="round"/>' +
		'<line x1="6" y1="13.5" x2="14" y2="13.5" stroke-width="1.2" stroke-linecap="round"/>',

	iot:
		'<path d="M5 12.5a7 7 0 0114 0" stroke-width="1.6" stroke-linecap="round"/>' +
		'<path d="M8 14.5a4 4 0 018 0" stroke-width="1.6" stroke-linecap="round"/>' +
		'<circle cx="12" cy="17" r="1.5" fill="white" stroke="none"/>',

	ap:
		'<path d="M1.5 8.5a15 15 0 0121 0" stroke-width="1.6" stroke-linecap="round"/>' +
		'<path d="M5 12a10 10 0 0114 0" stroke-width="1.6" stroke-linecap="round"/>' +
		'<path d="M8.5 15.5a5 5 0 017 0" stroke-width="1.6" stroke-linecap="round"/>' +
		'<circle cx="12" cy="19" r="1.5" fill="white" stroke="none"/>',

	unknown:
		'<circle cx="12" cy="12" r="9" stroke-width="1.6"/>' +
		'<path d="M9.5 9a2.5 2.5 0 015 0c0 2-2.5 2.5-2.5 5" stroke-width="1.6" stroke-linecap="round"/>' +
		'<circle cx="12" cy="18" r="1" fill="white" stroke="none"/>',
};

// Brighter palette — works on dark canvas and is readable in the table
const TYPE_COLOR = {
	router:        '#5c8fa8',
	computer:      '#1e88e5',
	phone_apple:   '#78909c',
	phone_android: '#43a047',
	tablet:        '#9c27b0',
	tv:            '#ef6c00',
	streaming:     '#d81b60',
	speaker:       '#00897b',
	printer:       '#795548',
	gaming:        '#7b1fa2',
	powerline:     '#f9a825',
	nas:           '#0288d1',
	iot:           '#7cb342',
	ap:            '#1976d2',
	unknown:       '#78909c',
};

const TYPE_LABEL = {
	router:        'Router / Gateway',
	computer:      'Computer / Laptop',
	phone_apple:   'iPhone / Apple Device',
	phone_android: 'Android Phone',
	tablet:        'Tablet',
	tv:            'Smart TV',
	streaming:     'Streaming Device',
	speaker:       'Smart Speaker',
	printer:       'Printer',
	gaming:        'Games Console',
	powerline:     'Powerline Adapter',
	nas:           'NAS / Server',
	iot:           'IoT / Smart Home',
	ap:            'Access Point',
	unknown:       'Unknown',
};

// ============================================================
// CSS
// ============================================================
const CSS = `
.nm-wrap{font-family:inherit}
.nm-hdr{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem}
.nm-tb{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.nm-layout{display:flex;gap:1rem;margin-bottom:1rem;min-height:420px}
.nm-map-panel{flex:1;border:1px solid var(--border-color,#ddd);border-radius:6px;overflow:hidden;display:flex;flex-direction:column}
.nm-map-hdr{display:flex;justify-content:space-between;align-items:center;padding:.4rem .75rem;background:rgba(13,27,42,0.95);border-bottom:1px solid rgba(80,140,200,0.25);font-size:.85rem;font-weight:600;color:#90bdd8}
#nm-map-wrap{flex:1;overflow:auto;min-height:360px;background:linear-gradient(160deg,#0d1b2a 0%,#081016 100%)}
#nm-map{width:100%;min-width:480px;display:block}
.nm-detail{width:280px;border:1px solid var(--border-color,#ddd);border-radius:6px;background:var(--bg-color,#fff);display:flex;flex-direction:column;flex-shrink:0}
.nm-detail-hdr{display:flex;justify-content:space-between;align-items:center;padding:.4rem .75rem;background:var(--heading-bg,#f5f5f5);border-bottom:1px solid var(--border-color,#ddd);font-weight:600;font-size:.85rem}
.nm-detail-body{padding:.75rem;overflow-y:auto;flex:1}
.nm-detail-icon{display:flex;justify-content:center;margin-bottom:.75rem}
.nm-kv{display:grid;grid-template-columns:auto 1fr;gap:.25rem .6rem;font-size:.82rem}
.nm-kv dt{color:var(--muted-color,#888);font-weight:600;white-space:nowrap}
.nm-kv dd{margin:0;word-break:break-all}
.nm-hidden{display:none!important}
.nm-tbl-panel{border:1px solid var(--border-color,#ddd);border-radius:4px;overflow:hidden}
.nm-tbl-hdr{display:flex;justify-content:space-between;align-items:center;padding:.4rem .75rem;background:var(--heading-bg,#f5f5f5);border-bottom:1px solid var(--border-color,#ddd);font-size:.85rem;font-weight:600}
.nm-search{border:1px solid var(--border-color,#ccc);border-radius:3px;padding:.2rem .5rem;font-size:.82rem;width:240px}
.nm-tbl{width:100%;border-collapse:collapse;font-size:.83rem}
.nm-tbl th,.nm-tbl td{padding:.35rem .6rem;text-align:left;border-bottom:1px solid var(--border-color,#eee);white-space:nowrap}
.nm-tbl th{background:var(--heading-bg,#f9f9f9);cursor:pointer;user-select:none;font-size:.8rem}
.nm-tbl th:hover{background:var(--hover-bg,#efefef)}
.nm-tbl tbody tr:hover{background:var(--row-hover,#f5f8ff);cursor:pointer}
.nm-tbl .ic{width:32px;text-align:center}
.nm-btn{padding:.3rem .7rem;border:1px solid var(--border-color,#ccc);border-radius:3px;cursor:pointer;font-size:.82rem;background:var(--btn-bg,#f5f5f5);color:var(--text-color,#333)}
.nm-btn:hover{background:var(--btn-hover,#e8e8e8)}
.nm-btn-p{background:#2196f3;border-color:#1976d2;color:#fff}
.nm-btn-p:hover{background:#1976d2}
.nm-btn-s{background:#607d8b;border-color:#455a64;color:#fff}
.nm-btn-s:hover{background:#455a64}
.nm-btn-x{background:transparent;border:none;cursor:pointer;font-size:1rem;color:var(--muted-color,#888);padding:.1rem .3rem;line-height:1}
.nm-btn-x:hover{color:var(--text-color,#333)}
.nm-tgl{display:flex;align-items:center;gap:.3rem;font-size:.82rem;cursor:pointer}
.nm-st-idle{color:var(--muted-color,#888);font-size:.82rem}
.nm-st-scan{color:#f57c00;font-size:.82rem;font-weight:600}
.nm-st-ok{color:#388e3c;font-size:.82rem}
.nm-muted{color:var(--muted-color,#999);font-size:.78rem;font-weight:400}
.nm-online{color:#388e3c;font-weight:600}
.nm-offline{color:#9e9e9e}
.nm-sig{display:inline-flex;gap:2px;align-items:flex-end;height:14px;vertical-align:middle}
.nm-sig-b{width:4px;background:#ccc;border-radius:1px}
.nm-sig-b.a{background:#4caf50}.nm-sig-b.m{background:#ff9800}.nm-sig-b.w{background:#f44336}
.nm-node{cursor:pointer}
.nm-node-bg{opacity:0;transition:opacity .18s}
.nm-node:hover .nm-node-bg{opacity:.18}
.nm-sel-ring{fill:none;stroke:rgba(100,200,255,0.9);stroke-width:2.5;pointer-events:none}
`;

// ============================================================
// Utilities
// ============================================================
const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs, inner) {
	const el = document.createElementNS(SVG_NS, tag);
	Object.entries(attrs || {}).forEach(([ k, v ]) => el.setAttribute(k, v));
	if (inner) el.innerHTML = inner;
	return el;
}

function esc(s) {
	return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
		.replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtRel(iso) {
	if (!iso) return '';
	const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
	if (m < 1)  return 'just now';
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	return h < 24 ? `${h}h ago` : `${Math.floor(h/24)}d ago`;
}

function fmtDate(iso) {
	if (!iso) return '—';
	try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function sigBars(dbm) {
	if (dbm == null) return '';
	const levels = [ {h:4,min:-100}, {h:7,min:-80}, {h:10,min:-70}, {h:13,min:-60} ];
	const cls = dbm >= -60 ? 'a' : dbm >= -70 ? 'm' : 'w';
	const bars = levels.map(l =>
		`<span class="nm-sig-b${l.min <= dbm ? ' '+cls : ''}" style="height:${l.h}px"></span>`
	).join('');
	return `<span class="nm-sig" title="${dbm} dBm">${bars}</span> ${dbm} dBm`;
}

// Render icon as a coloured circle with white icon inside — used in detail panel and table
function iconSVG(type, size, color) {
	const key = ICONS[type] ? type : 'unknown';
	const c   = color || TYPE_COLOR[type] || TYPE_COLOR.unknown;
	const r   = size / 2 - 1;
	const ic  = size * 0.52;
	const io  = (size - ic) / 2;
	return `<svg xmlns="${SVG_NS}" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
		`<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="${c}"/>` +
		`<g transform="translate(${io},${io}) scale(${ic/24})" fill="none" stroke="white" stroke-opacity="0.92">` +
		ICONS[key] +
		`</g></svg>`;
}

// Build SVG <defs> block — filters and per-type gradients
function buildDefs(deviceTypes) {
	const defs = svgEl('defs');

	defs.innerHTML =
		// Node glow
		'<filter id="nm-glow" x="-50%" y="-50%" width="200%" height="200%">' +
		'  <feGaussianBlur stdDeviation="3.5" result="b"/>' +
		'  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
		'</filter>' +
		// Stronger glow for router
		'<filter id="nm-glow-r" x="-70%" y="-70%" width="240%" height="240%">' +
		'  <feGaussianBlur stdDeviation="6" result="b"/>' +
		'  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
		'</filter>' +
		// Edge glow
		'<filter id="nm-glow-e" x="-20%" y="-20%" width="140%" height="140%">' +
		'  <feGaussianBlur stdDeviation="1.5" result="b"/>' +
		'  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
		'</filter>' +
		// Platform glow beneath each node
		'<radialGradient id="nm-plat-g" cx="50%" cy="25%" r="50%">' +
		'  <stop offset="0%" stop-color="white" stop-opacity="0.35"/>' +
		'  <stop offset="100%" stop-color="white" stop-opacity="0"/>' +
		'</radialGradient>';

	// Per-type radial gradient for node fill
	const seen = new Set(deviceTypes);
	seen.add('router');
	seen.forEach(type => {
		const c  = TYPE_COLOR[type] || TYPE_COLOR.unknown;
		const id = 'nm-ng-' + type.replace(/_/g, '-');
		defs.innerHTML +=
			`<radialGradient id="${id}" cx="38%" cy="32%" r="65%">` +
			`<stop offset="0%" stop-color="${c}" stop-opacity="1"/>` +
			`<stop offset="100%" stop-color="${c}" stop-opacity="0.55"/>` +
			`</radialGradient>`;
	});

	return defs;
}

// ============================================================
// Topology renderer
// ============================================================
function renderTopology(svg, data, onSelect) {
	svg.innerHTML = '';
	const devices = data.devices   || [];
	const ifaces  = data.interfaces || [];

	// Group devices by interface
	const byIface = {};
	ifaces.forEach(i => { byIface[i.name] = []; });
	devices.forEach(d => {
		const k = d.interface || 'wired';
		(byIface[k] = byIface[k] || []).push(d);
	});

	const groups = ifaces.filter(i => i.name === 'wired' || (byIface[i.name] || []).length > 0);

	const NODE_R   = 24;
	const NODE_W   = 64;
	const NODE_H   = 82;
	const GRP_PAD  = 22;
	const COL_PAD  = 36;
	const TOP_Y    = 68;
	const GRP_Y    = 178;
	const DEV_COLS = 3;

	let totalW = COL_PAD;
	const gPos = groups.map(iface => {
		const devs = byIface[iface.name] || [];
		const cols = Math.max(1, Math.min(devs.length, DEV_COLS));
		const w    = cols * NODE_W + GRP_PAD * 2;
		const pos  = { iface, devs, x: totalW, w };
		totalW += w + COL_PAD;
		return pos;
	});

	const svgW     = Math.max(600, totalW);
	const maxRows  = Math.max(1, ...groups.map(i => Math.ceil((byIface[i.name] || []).length / DEV_COLS)));
	const svgH     = GRP_Y + 60 + maxRows * NODE_H + 36;
	const routerX  = svgW / 2;

	svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
	svg.style.height = svgH + 'px';

	// Defs
	const types = devices.map(d => d.device_type || 'unknown');
	svg.appendChild(buildDefs(types));

	// Background
	svg.appendChild(svgEl('rect', { x:0, y:0, width:svgW, height:svgH, fill:'#0d1b2a' }));

	// Subtle horizontal grid lines for depth
	for (let gy = 80; gy < svgH; gy += 60) {
		svg.appendChild(svgEl('line', {
			x1:0, y1:gy, x2:svgW, y2:gy,
			stroke:'rgba(80,130,180,0.06)', 'stroke-width':'1'
		}));
	}

	// ---- Router node ----
	const rG = svgEl('g', { class:'nm-node', 'data-mac':'__router__' });

	// Pulse halos
	[ NODE_R+18, NODE_R+11 ].forEach((r, i) => rG.appendChild(svgEl('circle', {
		cx:routerX, cy:TOP_Y, r,
		fill:'none',
		stroke:`rgba(100,180,255,${i ? '0.22' : '0.11'})`,
		'stroke-width':'1'
	})));

	// Platform glow
	rG.appendChild(svgEl('ellipse', {
		cx:routerX, cy:TOP_Y+NODE_R+3, rx:NODE_R+10, ry:5,
		fill:'url(#nm-plat-g)', opacity:'0.7'
	}));

	// Main circle
	rG.appendChild(svgEl('circle', {
		cx:routerX, cy:TOP_Y, r:NODE_R+5,
		fill:'url(#nm-ng-router)', filter:'url(#nm-glow-r)'
	}));
	rG.appendChild(svgEl('circle', {
		cx:routerX, cy:TOP_Y, r:NODE_R+5,
		fill:'none', stroke:'rgba(144,186,233,0.55)', 'stroke-width':'1.5'
	}));

	// Icon (white)
	const rIcon = svgEl('g', {
		transform:`translate(${routerX-12},${TOP_Y-12})`, fill:'none',
		stroke:'white', 'stroke-opacity':'0.95'
	});
	rIcon.innerHTML = ICONS.router;
	rG.appendChild(rIcon);

	// Label
	rG.appendChild(svgEl('text', {
		x:routerX, y:TOP_Y+NODE_R+20,
		fill:'#c0d8ee', 'text-anchor':'middle', 'font-size':'11',
		'font-family':'sans-serif', 'font-weight':'700', 'pointer-events':'none'
	}, data.meta?.router_ip || 'Gateway'));

	svg.appendChild(rG);

	// ---- Groups ----
	gPos.forEach(({ iface, devs, x, w }) => {
		const cx      = x + w / 2;
		const isWifi  = iface.type === 'wifi';
		const devRows = Math.ceil(devs.length / DEV_COLS) || 1;
		const grpH    = 38 + 50 + devRows * NODE_H + 16;
		const edgeClr = isWifi ? 'rgba(80,200,255,0.45)' : 'rgba(140,180,220,0.35)';

		// Connector: router → group
		svg.appendChild(svgEl('path', {
			d:`M${routerX},${TOP_Y+NODE_R+6} C${routerX},${GRP_Y-55} ${cx},${GRP_Y-55} ${cx},${GRP_Y-28}`,
			fill:'none', stroke:edgeClr, 'stroke-width':'1.5',
			'stroke-dasharray': isWifi ? '5 3' : 'none',
			filter:'url(#nm-glow-e)'
		}));

		// Group background card
		svg.appendChild(svgEl('rect', {
			x:x+4, y:GRP_Y-34, width:w-8, height:grpH, rx:10,
			fill: isWifi ? 'rgba(30,80,140,0.18)' : 'rgba(60,80,100,0.15)',
			stroke: isWifi ? 'rgba(80,160,240,0.2)' : 'rgba(160,180,200,0.15)',
			'stroke-width':'1', 'stroke-dasharray':'6 4'
		}));

		// Group label
		svg.appendChild(svgEl('text', {
			x:cx, y:GRP_Y-16,
			fill: isWifi ? 'rgba(140,200,255,0.85)' : 'rgba(180,200,220,0.75)',
			'text-anchor':'middle', 'font-size':'11',
			'font-family':'sans-serif', 'font-weight':'600', 'letter-spacing':'0.4',
			'pointer-events':'none'
		}, iface.display || iface.name));

		if (iface.ssid) {
			svg.appendChild(svgEl('text', {
				x:cx, y:GRP_Y-3,
				fill:'rgba(120,180,230,0.55)', 'text-anchor':'middle',
				'font-size':'9', 'font-family':'sans-serif', 'pointer-events':'none'
			}, `"${iface.ssid}"  ch${iface.channel}`));
		}

		// ---- Device nodes ----
		devs.forEach((dev, idx) => {
			const col     = idx % DEV_COLS;
			const row     = Math.floor(idx / DEV_COLS);
			const dx      = x + GRP_PAD + col * NODE_W + NODE_W / 2;
			const dy      = GRP_Y + 52 + row * NODE_H;
			const online  = dev.online !== false;
			const color   = online ? (TYPE_COLOR[dev.device_type] || TYPE_COLOR.unknown) : '#4a6070';
			const iconKey = ICONS[dev.device_type] ? dev.device_type : 'unknown';
			const gradId  = 'nm-ng-' + (dev.device_type || 'unknown').replace(/_/g, '-');
			const label   = dev.custom_name || dev.hostname || dev.mac.slice(-8);

			// Group → device connector
			svg.appendChild(svgEl('line', {
				x1:cx, y1:GRP_Y+4, x2:dx, y2:dy-NODE_R-3,
				stroke:edgeClr, 'stroke-width':'1',
				'stroke-dasharray': isWifi ? '4 3' : 'none'
			}));

			const dG = svgEl('g', { class:'nm-node', 'data-mac':dev.mac });

			// Hover highlight
			dG.appendChild(svgEl('circle', {
				cx:dx, cy:dy, r:NODE_R+8,
				fill:color, 'class':'nm-node-bg'
			}));

			// Platform glow
			if (online) {
				dG.appendChild(svgEl('ellipse', {
					cx:dx, cy:dy+NODE_R-1, rx:NODE_R+5, ry:4,
					fill:color, opacity:'0.4', filter:'url(#nm-glow)'
				}));
			}

			// Node circle
			dG.appendChild(svgEl('circle', {
				cx:dx, cy:dy, r:NODE_R,
				fill: online ? `url(#${gradId})` : '#1e3040',
				filter: online ? 'url(#nm-glow)' : 'none'
			}));

			// Border ring
			dG.appendChild(svgEl('circle', {
				cx:dx, cy:dy, r:NODE_R,
				fill:'none', stroke:color, 'stroke-width':'1.2',
				opacity: online ? '0.65' : '0.3'
			}));

			// White icon
			const ig = svgEl('g', {
				transform:`translate(${dx-12},${dy-12})`,
				fill:'none', stroke:'white',
				'stroke-opacity': online ? '0.92' : '0.35'
			});
			ig.innerHTML = ICONS[iconKey];
			dG.appendChild(ig);

			// Signal quality dot (wireless only)
			if (dev.signal != null) {
				const sc = dev.signal >= -60 ? '#4caf50' : dev.signal >= -70 ? '#ff9800' : '#f44336';
				dG.appendChild(svgEl('circle', {
					cx:dx+NODE_R-4, cy:dy-NODE_R+4, r:5,
					fill:sc, stroke:'rgba(0,0,0,0.45)', 'stroke-width':'1',
					filter:'url(#nm-glow)'
				}));
			}

			// Offline strikethrough
			if (!online) {
				dG.appendChild(svgEl('line', {
					x1:dx-10, y1:dy-10, x2:dx+10, y2:dy+10,
					stroke:'rgba(200,100,100,0.6)', 'stroke-width':'2', 'stroke-linecap':'round'
				}));
			}

			// Name label
			dG.appendChild(svgEl('text', {
				x:dx, y:dy+NODE_R+14,
				fill: online ? '#c0d8ee' : 'rgba(160,180,200,0.5)',
				'text-anchor':'middle', 'font-size':'11',
				'font-family':'sans-serif', 'pointer-events':'none'
			}, label.length > 10 ? label.slice(0,9)+'…' : label));

			// IP label
			if (dev.ip) {
				dG.appendChild(svgEl('text', {
					x:dx, y:dy+NODE_R+25,
					fill:'rgba(130,175,220,0.5)', 'text-anchor':'middle',
					'font-size':'9', 'font-family':'sans-serif', 'pointer-events':'none'
				}, dev.ip));
			}

			dG.addEventListener('click', () => onSelect(dev));
			svg.appendChild(dG);
		});
	});
}

// ============================================================
// Detail panel
// ============================================================
function renderDetail(container, dev) {
	const color   = TYPE_COLOR[dev.device_type] || TYPE_COLOR.unknown;
	const iconKey = ICONS[dev.device_type] ? dev.device_type : 'unknown';
	const label   = dev.custom_name || dev.hostname || dev.mac;

	container.innerHTML =
		`<div class="nm-detail-icon">${iconSVG(iconKey, 72, color)}</div>` +
		`<dl class="nm-kv">` +
		`<dt>Name</dt><dd>${esc(label)}</dd>` +
		`<dt>Type</dt><dd>${esc(TYPE_LABEL[dev.device_type] || dev.device_type)}</dd>` +
		`<dt>IP</dt><dd>${esc(dev.ip || '—')}</dd>` +
		`<dt>MAC</dt><dd>${esc(dev.mac)}</dd>` +
		`<dt>Vendor</dt><dd>${esc(dev.vendor || '—')}</dd>` +
		`<dt>Interface</dt><dd>${esc(dev.interface || '—')}</dd>` +
		(dev.signal  != null ? `<dt>Signal</dt><dd>${sigBars(dev.signal)}</dd>` : '') +
		(dev.tx_rate         ? `<dt>TX rate</dt><dd>${dev.tx_rate} Mbps</dd>`   : '') +
		(dev.rx_rate         ? `<dt>RX rate</dt><dd>${dev.rx_rate} Mbps</dd>`   : '') +
		(dev.os_guess        ? `<dt>OS guess</dt><dd>${esc(dev.os_guess)}</dd>` : '') +
		`<dt>Status</dt><dd class="${dev.online?'nm-online':'nm-offline'}">${dev.online?'● Online':'○ Offline'}</dd>` +
		`<dt>First seen</dt><dd>${esc(fmtDate(dev.first_seen))}</dd>` +
		`<dt>Last seen</dt><dd>${esc(fmtDate(dev.last_seen))}</dd>` +
		`</dl>`;
}

// ============================================================
// Device table
// ============================================================
function renderTable(tbody, devices, filter, sortKey, sortDir, onSelect) {
	const q = (filter || '').toLowerCase().trim();
	let rows = q
		? devices.filter(d =>
			(d.hostname+d.ip+d.mac+d.vendor+d.device_type+d.interface).toLowerCase().includes(q))
		: devices.slice();

	if (sortKey) {
		rows.sort((a, b) => {
			let av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
			if (typeof av === 'boolean') av = av ? 1 : 0;
			if (typeof bv === 'boolean') bv = bv ? 1 : 0;
			if (av < bv) return sortDir === 'asc' ? -1 : 1;
			if (av > bv) return sortDir === 'asc' ?  1 : -1;
			return 0;
		});
	}

	tbody.innerHTML = rows.map(dev => {
		const color   = TYPE_COLOR[dev.device_type] || TYPE_COLOR.unknown;
		const iconKey = ICONS[dev.device_type] ? dev.device_type : 'unknown';
		return `<tr data-mac="${esc(dev.mac)}">
			<td class="ic">${iconSVG(iconKey, 24, color)}</td>
			<td>${esc(dev.custom_name || dev.hostname || '') || '<span class="nm-muted">—</span>'}</td>
			<td>${esc(dev.ip || '—')}</td>
			<td><code>${esc(dev.mac)}</code></td>
			<td>${esc(dev.vendor || '—')}</td>
			<td>${esc(TYPE_LABEL[dev.device_type] || dev.device_type)}</td>
			<td>${esc(dev.interface || '—')}</td>
			<td>${sigBars(dev.signal)}</td>
			<td class="${dev.online?'nm-online':'nm-offline'}">${dev.online?'● Online':'○ Offline'}</td>
		</tr>`;
	}).join('');

	tbody.querySelectorAll('tr').forEach((tr, i) => {
		tr.addEventListener('click', () => onSelect(rows[i]));
	});
}

// ============================================================
// Module-level state
// ============================================================
let _data     = null;
let _selected = null;
let _sortKey  = 'hostname';
let _sortDir  = 'asc';
let _filter   = '';

// ============================================================
// View
// ============================================================
return view.extend({
	handleSaveApply: null,
	handleSave:      null,
	handleReset:     null,

	load: function() {
		return callGetDevices();
	},

	render: function(data) {
		_data = data || { meta:{}, interfaces:[], devices:[] };

		if (!document.getElementById('nm-css')) {
			const s = document.createElement('style');
			s.id = 'nm-css';
			s.textContent = CSS;
			document.head.appendChild(s);
		}

		const wrap = document.createElement('div');
		wrap.className = 'nm-wrap';
		wrap.innerHTML = `
<div class="nm-hdr">
  <div class="nm-tb">
    <span id="nm-st" class="nm-st-idle">Loading…</span>
    <button id="nm-quick" class="nm-btn nm-btn-p">&#8635; Quick Scan</button>
    <button id="nm-deep"  class="nm-btn nm-btn-s">&#128269; Deep Scan</button>
    <label class="nm-tgl"><input type="checkbox" id="nm-ar" checked><span>Auto-refresh</span></label>
  </div>
</div>
<div class="nm-layout">
  <div class="nm-map-panel">
    <div class="nm-map-hdr">
      <span>Network Topology</span>
      <span id="nm-ls" style="font-size:.8rem;opacity:.7"></span>
    </div>
    <div id="nm-map-wrap">
      <svg id="nm-map" xmlns="${SVG_NS}"></svg>
    </div>
  </div>
  <div id="nm-detail" class="nm-detail nm-hidden">
    <div class="nm-detail-hdr">
      <span id="nm-dt-title">Device</span>
      <button id="nm-dt-close" class="nm-btn-x">&#10005;</button>
    </div>
    <div id="nm-dt-body" class="nm-detail-body"></div>
  </div>
</div>
<div class="nm-tbl-panel">
  <div class="nm-tbl-hdr">
    <span>All Devices (<span id="nm-cnt">0</span>)</span>
    <input id="nm-filter" type="text" class="nm-search" placeholder="Filter by name, IP, MAC, type…">
  </div>
  <table class="nm-tbl">
    <thead><tr>
      <th></th>
      <th data-s="hostname">Name</th>
      <th data-s="ip">IP</th>
      <th data-s="mac">MAC</th>
      <th data-s="vendor">Vendor</th>
      <th data-s="device_type">Type</th>
      <th data-s="interface">Interface</th>
      <th data-s="signal">Signal</th>
      <th data-s="online">Status</th>
    </tr></thead>
    <tbody id="nm-tbody"></tbody>
  </table>
</div>`;

		const $ = id => wrap.querySelector('#' + id);

		$('nm-quick').addEventListener('click', () => this._scan('quick', wrap));
		$('nm-deep' ).addEventListener('click', () => this._scan('deep',  wrap));
		$('nm-dt-close').addEventListener('click', () => {
			$('nm-detail').classList.add('nm-hidden');
			wrap.querySelector('.nm-sel-ring')?.remove();
		});
		$('nm-filter').addEventListener('input', e => {
			_filter = e.target.value;
			this._tbl(wrap);
		});
		wrap.querySelectorAll('th[data-s]').forEach(th => {
			th.addEventListener('click', () => {
				const k = th.dataset.s;
				_sortDir = (k === _sortKey && _sortDir === 'asc') ? 'desc' : 'asc';
				_sortKey = k;
				this._tbl(wrap);
			});
		});

		this._update(wrap);

		poll.add(L.bind(function() {
			if (!wrap.querySelector('#nm-ar').checked) return;
			return callGetDevices().then(d => { _data = d; this._update(wrap); });
		}, this), 60);

		return wrap;
	},

	_selectDevice: function(dev, wrap) {
		_selected = dev;

		// Remove old selection ring
		wrap.querySelector('.nm-sel-ring')?.remove();

		// Add new selection ring around the clicked node's main circle
		const node = wrap.querySelector(`[data-mac="${CSS.escape(dev.mac)}"]`);
		if (node) {
			const circles = node.querySelectorAll('circle');
			// Third circle is the main node circle (after hover-bg and platform glow)
			const mainCircle = circles[2] || circles[circles.length - 1];
			if (mainCircle) {
				const ring = document.createElementNS(SVG_NS, 'circle');
				ring.setAttribute('cx', mainCircle.getAttribute('cx'));
				ring.setAttribute('cy', mainCircle.getAttribute('cy'));
				ring.setAttribute('r',  +mainCircle.getAttribute('r') + 5);
				ring.setAttribute('class', 'nm-sel-ring');
				node.appendChild(ring);
			}
		}

		const title = wrap.querySelector('#nm-dt-title');
		const body  = wrap.querySelector('#nm-dt-body');
		const panel = wrap.querySelector('#nm-detail');
		if (title) title.textContent = dev.custom_name || dev.hostname || dev.mac;
		if (body)  renderDetail(body, dev);
		if (panel) panel.classList.remove('nm-hidden');
	},

	_update: function(wrap) {
		if (!_data) return;
		const devices = _data.devices || [];

		const st = wrap.querySelector('#nm-st');
		if (st) { st.className = 'nm-st-ok'; st.textContent = `${devices.length} devices`; }

		const ls = wrap.querySelector('#nm-ls');
		if (ls) ls.textContent = _data.meta?.last_scan ? `Last scan: ${fmtRel(_data.meta.last_scan)}` : '';

		const cnt = wrap.querySelector('#nm-cnt');
		if (cnt) cnt.textContent = devices.length;

		const svg = wrap.querySelector('#nm-map');
		if (svg) renderTopology(svg, _data, dev => this._selectDevice(dev, wrap));

		this._tbl(wrap);

		if (_selected) {
			const fresh = devices.find(d => d.mac === _selected.mac);
			if (fresh) {
				const body = wrap.querySelector('#nm-dt-body');
				if (body) renderDetail(body, fresh);
			}
		}
	},

	_tbl: function(wrap) {
		const tbody = wrap.querySelector('#nm-tbody');
		if (tbody && _data)
			renderTable(tbody, _data.devices || [], _filter, _sortKey, _sortDir,
				dev => this._selectDevice(dev, wrap));
	},

	_scan: function(mode, wrap) {
		const st = wrap.querySelector('#nm-st');
		if (st) { st.className = 'nm-st-scan'; st.textContent = `${mode} scan running…`; }
		wrap.querySelector('#nm-quick').disabled = true;
		wrap.querySelector('#nm-deep' ).disabled = true;

		callScan(mode).then(res => {
			if (res.status === 'busy') {
				if (st) st.textContent = 'Scan already running…';
			}
			this._pollScan(wrap);
		}).catch(() => {
			if (st) { st.className = 'nm-st-idle'; st.textContent = 'Scan failed'; }
			wrap.querySelector('#nm-quick').disabled = false;
			wrap.querySelector('#nm-deep' ).disabled = false;
		});
	},

	_pollScan: function(wrap) {
		setTimeout(() => {
			callGetStatus().then(s => {
				if (s.scanning) {
					this._pollScan(wrap);
				} else {
					wrap.querySelector('#nm-quick').disabled = false;
					wrap.querySelector('#nm-deep' ).disabled = false;
					return callGetDevices().then(d => { _data = d; this._update(wrap); });
				}
			}).catch(() => {
				wrap.querySelector('#nm-quick').disabled = false;
				wrap.querySelector('#nm-deep' ).disabled = false;
			});
		}, 2500);
	},
});
