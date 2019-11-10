// @ts-nocheck

/** 1x1 black image */
const defaultImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgADNjd8qAAAAABJRU5ErkJggg==";

async function createProfile() {
    const appName = document.getElementById("app-name").value;
    if (!appName) {
        alert("Error: Must enter an app name");
        return;
    }

    const appIconImage = (document.getElementById("app-icon-image").files || [])[0];
    let appIconImageBase64;
    if (appIconImage) {
        appIconImageBase64 = await base64(appIconImage);
    } else {
        appIconImageBase64 = defaultImageBase64;
    }
    
    const numberOfIcons = parseInt(document.getElementById("number-of-icons").value);
    if (!numberOfIcons || numberOfIcons < 1) {
        alert("Error: Must enter a valid number of icons greater than 0");
        return;
    }

    const appLink = document.getElementById("app-link").value || "about:blank";

    const profileText = generateProfile(appName, appIconImageBase64, numberOfIcons, appLink);
    download(profileText, `${appName.replace(/\s/g, "-")}-icons.mobileconfig`, "application/x-apple-aspen-config");
}

function generateProfile(appName, appIconImageBase64, numberOfIcons, appLink) {
    let result = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>HasRemovalPasscode</key>
\t<false/>
\t<key>PayloadContent</key>
\t<array>`;

    for (let i = 0; i < numberOfIcons; i++) {
        const uuid = uuidv4();
        result += `
\t\t<dict>
\t\t\t<key>FullScreen</key>
\t\t\t<true/>
\t\t\t<key>Icon</key>
\t\t\t<data>
${chunk(appIconImageBase64, 52).map(s => "\t\t\t" + s).join("\n")}
\t\t\t</data>
\t\t\t<key>IsRemovable</key>
\t\t\t<true/>
\t\t\t<key>Label</key>
\t\t\t<string>${appName}</string>
\t\t\t<key>PayloadDescription</key>
\t\t\t<string>Configures settings for a web clip</string>
\t\t\t<key>PayloadDisplayName</key>
\t\t\t<string>Web Clip</string>
\t\t\t<key>PayloadIdentifier</key>
\t\t\t<string>com.apple.webClip.managed.${uuid}</string>
\t\t\t<key>PayloadType</key>
\t\t\t<string>com.apple.webClip.managed</string>
\t\t\t<key>PayloadUUID</key>
\t\t\t<string>${uuid}</string>
\t\t\t<key>PayloadVersion</key>
\t\t\t<integer>1</integer>
\t\t\t<key>Precomposed</key>
\t\t\t<true/>
\t\t\t<key>URL</key>
\t\t\t<string>${appLink}</string>
\t\t</dict>`;
    }

    result += `
\t</array>
\t<key>PayloadDisplayName</key>
\t<string>Icons for “${appName}”</string>
\t<key>PayloadIdentifier</key>
\t<string>wg-3.${uuidv4()}</string>
\t<key>PayloadRemovalDisallowed</key>
\t<false/>
\t<key>PayloadType</key>
\t<string>Configuration</string>
\t<key>PayloadUUID</key>
\t<string>${uuidv4()}</string>
\t<key>PayloadVersion</key>
\t<integer>1</integer>
</dict>
</plist>`;

    return result;
}

async function base64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = (e) => {
            if (e.target.error) {
                reject(e.target.error);
            } else {
                resolve(e.target.result.replace("data:image/png;base64,", ""));
            }
        }
        reader.readAsDataURL(file);
    });
}

function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        var r = Math.random() * 16 | 0,
            v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}

function chunk(str, chunkSize) {
    return str.match(new RegExp(`.{1,${chunkSize}}`, "g"));
}

function download(text, filename, mimeType) {
    var element = document.createElement("a");
    element.setAttribute("href", `data:${mimeType};charset=utf-8,` + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
