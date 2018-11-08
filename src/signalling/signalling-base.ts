import { Signalling, AwEventHandler, AwEvent, AwOfferEvent, AwAnswerEvent, AwNewCandidateEvent, AwPeerListEvent } from 'awrtc';

export type AwEventName = 'offer' | 'answer' | 'newCandidate' | 'peerList';

export abstract class SignallingBase implements Signalling {
    private eventHandlers: { [eventName: string]: AwEventHandler<AwEvent>[] } = {};

    public abstract registerPeer (peerId: string): void;
    public abstract sendOfferToRemotePeer (peerId: string, offer: RTCSessionDescriptionInit): void;
    public abstract sendAnswerToRemotePeer (peerId: string, answer: RTCSessionDescriptionInit): void;
    public abstract sendNewCandidateToRemotePeer (peerId: string, candidate: RTCIceCandidate): void;

    public on (eventName: 'offer', handlerCallback: AwEventHandler<AwOfferEvent>): void;
    public on (eventName: 'answer', handlerCallback: AwEventHandler<AwAnswerEvent>): void;
    public on (eventName: 'newCandidate', handlerCallback: AwEventHandler<AwNewCandidateEvent>): void;
    public on (eventName: 'peerList', handlerCallback: AwEventHandler<AwPeerListEvent>): void; 
    public on (eventName: AwEventName, handlerCallback: AwEventHandler<any>): void {
        this.eventHandlers[eventName] = this.eventHandlers[eventName] || [];
        this.eventHandlers[eventName].push(handlerCallback);
    }

    protected dispatch (eventName: AwEventName, event: AwEvent): void {
        this.eventHandlers[eventName].forEach((handlerCallback) => handlerCallback(event));
    }
}