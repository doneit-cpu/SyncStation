
export interface Fileinfo{
  id:string
  name:string;
  size:number;
  type:string;
  sender:string; // username and socket.id combination , but after user gone , it would shown upload or treat it as uniqe id okay 
  downloadlink:string,
}

export function getDeviceInfo() { // fix this bit like we at least need to know os or device correct 
  const ua = navigator.userAgent;
  let os = "Unknown OS";
  let device = "Desktop";

  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) { os = "Android"; device = "Mobile"; }
  else if (/iphone|ipad|ipod/i.test(ua)) { os = "iOS"; device = "Mobile"; }
  else if (/linux/i.test(ua)) os = "Linux";

  return { os, device };
}

export function getPlatform() {
  //used this frist to know about user platfrom
  if (window.electronAPI) return "electron";

  if (window.matchMedia("(display-mode: standalone)").matches)
    return "pwa";

  return "browser";
}

export function genRoomcode() {

  const code = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");

  return code;

}

export async function isSamelan(hostLanIp: string) {

  const controller = new AbortController(); // read this 
  const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 sec timeout
  console.log("it's reached here")
  try {
    const response = await fetch(`http://${hostLanIp}:3000/api/ping`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if(response.ok){
      return true; // Returns true if on the same local router!
    }
    return false;
  } catch (err) {
    console.log("errors", err)
    return false; // Failed or timed out -> different network
  }
}