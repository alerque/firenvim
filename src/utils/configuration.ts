import * as browser from "webextension-polyfill"; //lgtm [js/unused-local-variable]

export interface ISiteConfig {
    selector: string;
    priority: number;
    takeover: "always" | "once" | "empty" | "nonempty";
    cmdline: "neovim" | "firenvim";
}

let conf: {[key: string]: ISiteConfig} = {};

export const confReady = new Promise(resolve => {
    browser.storage.local.get().then((obj: any) => {
        conf = obj;
        resolve(true);
    });
});

browser.storage.onChanged.addListener((changes: any) => {
    Object
        .entries(changes)
        .forEach(([key, value]: [string, any]) => conf[key] = value.newValue);
});

export function getConf() {
    return getConfForUrl(document.location.href);
}

export function getConfForUrl(url: string) {
    const localSettings = conf.localSettings;
    function or1(val: number) {
        if (val === undefined) {
            return 1;
        }
        return val;
    }
    if (localSettings === undefined) {
        throw new Error("Error: your settings are undefined. Try reloading the page. If this error persists, try the troubleshooting guide: https://github.com/glacambre/firenvim/blob/master/TROUBLESHOOTING.md");
    }
    const [, result] = Array.from(Object.entries(localSettings))
        .sort((e1, e2) => (or1(e2[1].priority) - or1(e1[1].priority)))
        .find(([pat, sel]) => (new RegExp(pat)).test(url));
    return result;
}
