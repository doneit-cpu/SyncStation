
export function getDeviceInfo() { // fix this bit like we at least need to know os or device correct 
  const ua = navigator.userAgent;
  let os = "Unknown OS";
  let device = "Desktop";

  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) { os = "Android"; device = "Mobile"; }
  else if (/iphone|ipad|ipod/i.test(ua)) { os = "iOS"; device = "Mobile"; }
  else if (/linux/i.test(ua)) os = "Linux" ;

  return { os, device };
}

export function getPlatform() {
  //used this frist to know about user platfrom
  if (window.electronAPI) return "electron";

  if (window.matchMedia("(display-mode: standalone)").matches)
    return "pwa";

  return "browser";
}

export function genRoomcode(){
  
  const code = Math.floor(Math.random() * 1_000_000)
  .toString()
  .padStart(6, "0");

  return code;

}

