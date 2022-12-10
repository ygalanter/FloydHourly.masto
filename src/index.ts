import generator, { Entity, Response } from 'megalodon';
import fs from 'fs';
import { parse } from 'csv-parse/sync'

const BASE_URL: string = 'https://botsin.space'
const access_token: string = process.env.MASTO_TOKEN!

const client = generator('mastodon', BASE_URL, access_token)

class MyArray extends Array<string> {
    lyrics?: string[];
}


function loadSongs() {
    const csv: MyArray[] = parse(fs.readFileSync('./pink_floyd_lyrics.csv', 'utf-8'));
    const songs = csv.filter(song => song[3].trim() !== '') // removing songs with small lyrics
    songs.sort(() => 0.5 - Math.random()) // shuffling songs

    // splitting songs into lines
    for (let song of songs) {
        song.lyrics = song[3].replace('\n\n', '\n').split('\n').filter(line => line.trim().length > 20); // removing small lines
        song.lyrics.sort((a, b) => 0.5 - Math.random()) // shuffling lines
    }

    return songs
}

loadSongs();


function doQuote() {

    const songIndex = Math.floor(Math.random() * songs.length)
    const song = songs[songIndex];

    if (song.lyrics!.length !== 0) {

        const lineIndex = Math.floor(Math.random() * song.lyrics!.length)
        const line = song.lyrics![lineIndex];

        const toot = line + '\n\n' +
            '#' + song[1].replace(/[` .,-?!'’()]/g, '') + ' ' +
            '#' + song[0].replace(/[` .,-?!'’()]/g, '') + ' ' +
            '#PinkFloyd'

        console.log(`\n${(new Date()).toLocaleString()}: ${toot}`);

        client.postStatus(toot)
            .catch(err => console.error(err))

        song.lyrics!.splice(lineIndex, 1)
        console.log(`- ${song.lyrics!.length} lyric lines remaining in this song`)
    }

    if (song.lyrics!.length === 0) {
        songs.splice(songIndex, 1);
        console.log(`- removing song with empty lyrics, ${songs.length} songs remaining`)

        if (songs.length === 0) {
            console.log(`- reloading songs`)
            songs = loadSongs()
        }
    }

}

console.log(`${(new Date()).toLocaleString()}: ****** Floyd Quoter Started *****\n`)

let songs = loadSongs()

doQuote();

setInterval(doQuote, 60 * 60 * 1000); // 1 hour