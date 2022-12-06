import generator, { Entity, Response } from 'megalodon'

const BASE_URL: string = 'https://botsin.space'
const access_token: string = '...'
const toot: string = 'test toot'

const client = generator('mastodon', BASE_URL, access_token)

client.postStatus(toot)
    .then((res: Response<Entity.Status>) => {
        console.log(res.data)
    })