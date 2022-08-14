import express from "express"
import YoutubeClient from "./service/youtubeClient.js"
import twitchClient from "./service/twitchClient.js"

const youtubeClient = new YoutubeClient(
    "917174766102-72nlq81pahvd0sngcdhh87u24117bim0.apps.googleusercontent.com",
    "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",
    "http://localhost:8080"
)

const app = express()
app.get('/', (req, res)=> {
  res.send('Hello from Express!')
})
app.get('/token', async (req, res) => {
    res.send(await youtubeClient.getToken())
})
app.get('/authorize', async (req, res) => {
    res.send(await youtubeClient.getAuthorizeUrl())
})
app.get('/youtube/youtubeChannelVideo/:channelId', async (req, res) => {
    const channelId = req.params.channelId
    res.send(await youtubeClient.getYoutubeChannelVideo(channelId))
})
app.get('/twitch/getClipById/:clipId', async (req, res) => {
    const clipId = req.params.clipId
    res.send(await twitchClient.getClipById(clipId))
}) 
app.get('/twitch/postClipTwitchToYoutube/:clipId', async (req, res) => {
    const clipId = req.params.clipId
    try {
        twitchClient.postClipTwitchToYoutube(clipId, youtubeClient)
        res.send(true)
    } catch (error) {
        res.send(error)
    }
}) 
app.listen(3000, () => {
  console.log('Listening on port 3000')
})
