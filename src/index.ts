import generator from 'megalodon';
import fs from 'fs';
import { parse } from 'csv-parse/sync'

const BASE_URL: string = 'https://botsin.space'
const access_token: string = process.env.MASTO_TOKEN!

const mastodon = generator('mastodon', BASE_URL, access_token)

class Song {
    readonly album: string;
    readonly title: string;
    readonly lyrics: string[]

    constructor(rawSong: string[]) {
        this.album = rawSong[0];
        this.title = rawSong[1];
        this.lyrics = rawSong[3].replace('\n\n', '\n').split('\n').filter(line => line.trim().length > 20); // removing small lines
    }
}

function sanitize(str: string): string {
    return str.replace(/[` .,-?'’()]/g, '')
}


function loadSongs() {
    const csv: string[][] = parse(fs.readFileSync('./pink_floyd_lyrics.csv', 'utf-8')); // reading and parsing CSV file
    const rawSongs = csv.filter(row => row[3].trim() != '') // removing songs with empty lyrics (instrumentals)
    const songs = rawSongs.map(rawSong => new Song(rawSong))

    return songs
}


function doQuote(songs: Song[]) {

    const songIndex = Math.floor(Math.random() * songs.length)
    const song = songs[songIndex];

    if (song.lyrics.length != 0) {

        const lineIndex = Math.floor(Math.random() * song.lyrics.length)
        const line = song.lyrics[lineIndex];

        const toot = line + '\n\n' + '#' + sanitize(song.title) + ' ' + '#' + sanitize(song.album) + ' ' + '#PinkFloyd'

        console.log(`\n${(new Date()).toLocaleString()}: ${toot}`);

        mastodon.postStatus(toot)
            .catch(err => console.error(err))

        song.lyrics.splice(lineIndex, 1)
        console.log(`- ${song.lyrics.length} lyric lines remaining in this song`)
    }

    if (song.lyrics.length === 0) {
        songs.splice(songIndex, 1);
        console.log(`- removing song with empty lyrics, ${songs.length} songs remaining`)
    }

    return songs.length

}

console.log(`${(new Date()).toLocaleString()}: ****** Floyd Quoter Started *****\n`)

let songs = loadSongs()

doQuote(songs);

setInterval(() => {
    const sonCount = doQuote(songs);
    if (sonCount === 0) {
        console.log(`- reloading songs`)
        songs = loadSongs()
    }
}, 60 * 60 * 1000); // 1 hour

// Mastodon Verification
// <a rel="me" href="https://botsin.space/@PinkFloydHourly">Mastodon</a>
