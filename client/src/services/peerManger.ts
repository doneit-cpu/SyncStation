import Peer from "simple-peer"

export class PeerManger {

  peers: Map<string, Peer.Instance> = new Map();

  createPeer(id: string,initiator: boolean,stream: MediaStream | null,onSignal: (signal: any) => void){
    const peer = new Peer({
      initiator,
      trickle: false,
      stream: stream || undefined
    })
    
    peer.on('signal', (signal) => {
      onSignal(signal);
    })

    peer.on('close', () => this.peers.delete(id));
    peer.on('error', (err) => {
      console.error('peer errors:', err);
      this.peers.delete(id);
    })

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
