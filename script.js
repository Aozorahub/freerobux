// 情報セット用ユーティリティ
const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
};

// 基本情報の取得
const setBasicInfo = () => {
    setText('user-agent', navigator.userAgent);
    setText('current-time', new Date().toLocaleString());
    setText('screen-resolution', `${window.screen.width} × ${window.screen.height} (${window.screen.colorDepth}bit)`);
    setText('language', navigator.language || navigator.userLanguage);
    setText('platform', navigator.platform);
    setText('cookies-enabled', navigator.cookieEnabled ? '有効' : '無効');

    setText('device-memory', 'deviceMemory' in navigator ? `${navigator.deviceMemory} GB` : '情報なし');
    setText('cpu-cores', 'hardwareConcurrency' in navigator ? navigator.hardwareConcurrency : '情報なし');
    setText('touch-support', ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 'サポートあり' : 'サポートなし');

    // デバイスタイプの判定
    const ua = navigator.userAgent;
    let deviceType = 'デスクトップ';
    if (/Mobi|Android/i.test(ua)) {
        deviceType = 'モバイル';
    } else if (/Tablet|iPad/i.test(ua)) {
        deviceType = 'タブレット';
    }
    setText('device-type', deviceType);

    // タイムゾーンの取得
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '取得不可';
    setText('timezone', timezone);

    // ブラウザビット数の判定
    let browserBit = '不明';
    if (ua.includes("WOW64") || ua.includes("Win64") || ua.includes("x86_64") || ua.includes("x64") || ua.includes("amd64")) {
        browserBit = "64bit";
    } else if (ua.includes("i686") || ua.includes("x86")) {
        browserBit = "32bit";
    }
    setText('browser-bits', browserBit);
};

// ブラウザ & OS 情報の解析
const detectBrowser = () => {
    const ua = navigator.userAgent;
    let browser = '不明なブラウザ';
    let version = '不明';

    const matchers = [
        { name: 'Firefox', regex: /Firefox\/(\d+)/ },
        { name: 'Edge', regex: /Edg\/(\d+)/ },
        { name: 'Chrome', regex: /Chrome\/(\d+)/ },
        { name: 'Safari', regex: /Version\/(\d+)/ },
        { name: 'Opera', regex: /OPR\/(\d+)/ }
    ];

    for (const { name, regex } of matchers) {
        const match = ua.match(regex);
        if (match) {
            browser = name;
            version = match[1];
            break;
        }
    }

    let os = '不明なOS';
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";

    setText('browser-name', browser);
    setText('browser-version', version);
    setText('operating-system', os);
};

// バッテリー情報の取得
const getBatteryStatus = () => {
    if (!('getBattery' in navigator)) {
        return setText('battery-status', 'APIが利用できません');
    }

    navigator.getBattery().then(battery => {
        const status = `充電中: ${battery.charging ? 'はい' : 'いいえ'}, ` +
                       `残量: ${Math.floor(battery.level * 100)}%, ` +
                       `充電時間: ${battery.chargingTime > 0 ? battery.chargingTime + '秒' : '不明'}`;
        setText('battery-status', status);
    });
};

// IP情報の取得
const fetchIPInfo = () => {
    fetch('https://ipinfo.io/json?token=bae8ad21518657')
        .then(res => {
            if (!res.ok) throw new Error('ネットワーク応答が正常ではありません');
            return res.json();
        })
        .then(data => {
            setText('ip-address', data.ip);
            document.getElementById('ip-address').className = 'success';

            setText('country', `${data.country} (${data.country_name || ''})`);
            setText('region', data.region || '');
            setText('city', data.city || '');
            setText('postal', data.postal || '');
            setText('isp', data.org || '');

            if (data.loc) {
                const [lat, lon] = data.loc.split(',');
                document.getElementById('location').innerHTML =
                    `<a href="https://maps.google.com/?q=${lat},${lon}" target="_blank">緯度: ${lat}, 経度: ${lon}</a>`;
            }
        })
        .catch(err => {
            console.error('IP情報の取得に失敗しました:', err);
            const el = document.getElementById('ip-address');
            el.className = 'error';
            el.textContent = '取得失敗';
        });
};

// ネットワーク情報の取得
const getNetworkInfo = () => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (!conn) {
        // 各項目がなくても「情報なし」として表示
        setText('connection-type', '情報なし');
        setText('effective-connection-type', '情報なし');
        setText('downlink-speed', '情報なし');
        setText('rtt', '情報なし');
        return;
    }

    setText('connection-type', conn.type || '情報なし');
    setText('effective-connection-type', conn.effectiveType || '情報なし');
    setText('downlink-speed', conn.downlink ? `${conn.downlink} Mbps` : '情報なし');
    setText('rtt', conn.rtt ? `${conn.rtt} ms` : '情報なし');
};


// 全ての情報を一括取得
window.addEventListener('DOMContentLoaded', () => {
    setBasicInfo();
    detectBrowser();
    getBatteryStatus();
    fetchIPInfo();
    getNetworkInfo();
    setText('page-url', window.location.href);
});

