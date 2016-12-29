export interface Song {
    id: string;
    title: string;
    artist: string;
    votes: number;
    albumArtRef: [
        {
            url: string;
        }
    ]
    added?: boolean;
}