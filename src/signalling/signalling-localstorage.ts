import { SignallingBase } from './signalling-base.js';

type AwEventData = RTCSessionDescriptionInit | RTCIceCandidate;
type StorageValue = { 
    from: string,
    data: AwEventData
};

export class LocalStorageSignalling extends SignallingBase {
    private peerId: string = '';

    constructor () {
        super();
        this.initializeStorageListener();
    }
    private initializeStorageListener (): void {
        window.addEventListener('storage', (event: StorageEvent) => {
            const key = event.key || '';
            const newValue = event.newValue || '';
            if (this.amIEventRecipient(key)) {
                const value = JSON.parse(newValue);
                if (this.isEventType(key, 'offer')) {
                    this.handle('offer', { peerId: value.from, offer: value.data });
                } else if (this.isEventType(key, 'answer')) {
                    this.handle('answer', { peerId: value.from, answer: value.data });
                } else if (this.isEventType(key, 'candidate')) {
                    this.handle('newCandidate', { peerId: value.from, iceCandidate: value.data });
                }
            }
        });
    }
    private amIEventRecipient (eventKey: string): boolean {
        return eventKey.includes('-to-' + this.peerId);
    }
    private isEventType (eventKey: string, type: string): boolean {
        return eventKey.includes(type + '-to-');
    }

    public registerPeer (peerId: string): void {
        this.peerId = peerId;
        const peerList = this.getCurrentPeerList();
        if (!peerList.includes(peerId)) {
            peerList.push(peerId);
            this.setCurrentPeerList(peerList);
            this.handle('peerList', { peerList });
        }
    }
    private getCurrentPeerList (): string[] {
        const peerListJSON = window.localStorage.getItem('peerList');
        let peerList;
        if (peerListJSON) {
            peerList = JSON.parse(peerListJSON);
        } else {
            peerList = [];
        }
        return peerList;
    }
    private setCurrentPeerList (peerList: string[]): void {
        const updatedPeerListJSON = JSON.stringify(peerList);
        window.localStorage.setItem('peerList', updatedPeerListJSON);
    }

    public sendOfferToRemotePeer (peerId: string, offer: RTCSessionDescriptionInit): void {
        this.sendDataToRemotePeer('offer', peerId, offer);
    }
    public sendAnswerToRemotePeer (peerId: string, answer: RTCSessionDescriptionInit): void {
        this.sendDataToRemotePeer('answer', peerId, answer);
    }
    public sendNewCandidateToRemotePeer (peerId: string, candidate: RTCIceCandidate): void {
        this.sendDataToRemotePeer('candidate', peerId, candidate);
    }
    private sendDataToRemotePeer (type: string, peerId: string, data: AwEventData): void {
        const value = this.buildStorageValue(this.peerId, data);
        const storageKey = this.encodeToStorageKeyValue(type, peerId);
        const jsonValue = JSON.stringify(value);
        window.localStorage.setItem(storageKey, jsonValue);
    }
    private buildStorageValue (from: string, data: AwEventData): StorageValue {
        return { from, data };
    }
    private encodeToStorageKeyValue (type: string, to: string): string {
        return type + '-to-' + to;
    }
}