import Peer from "simple-peer"

export class PeerManger {

  peers: Map<string, Peer.Instance> = new Map();

  createPeer(id: string, initiator: boolean, stream: MediaStream | null, onSignal: (signal: any) => void) {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream: stream || undefined
    })

    peer.on('signal', (signal) => {
      onSignal(signal);
    })

    peer.on('close', () => {
      console.log('🟡 WEBRTC CLOSED:', id);
      this.peers.delete(id)
    }); 

    peer.on('error', (err) => {
      console.error('🔴 WEBRTC ERROR:', err);
      this.peers.delete(id);
    })

    peer.on('connect', () => {
      console.log('🟢 WEBRTC CONNECTED:', id);
    });

   
    console.log(id,peer);
    this.peers.set(id, peer);
    return peer;
  }

  getPeer(id: string) {
    return this.peers.get(id);
  }

  destroyAll() {
    this.peers.forEach((peer) => peer.destroy())
    this.peers.clear();
  }
}
