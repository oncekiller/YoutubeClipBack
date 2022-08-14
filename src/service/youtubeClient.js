import fs from "fs"
import readline from "readline"
import google  from 'googleapis'



export default class YoutubeClient{
    client_id = ""
    client_secret = ""
    redirect_uris = ""
    oauth2Client
    service
    youtubeApiClient = google.google.youtube('v3')
    refresh_token = "1//03bRD0iNSe4iZCgYIARAAGAMSNwF-L9IrPAz0FgC7byk0iA9aPEiD8E91_7a7GYnW7fP5pY5h1f1m9K7eSwVK4keaJ1XAAt_ztpc"

    constructor(clientId, clientSecret, redirectUrl){
        this.clientId = clientId
        this.clientSecret = clientSecret
        this.redirectUrl = redirectUrl
        this.oauth2Client  = new google.google.auth.OAuth2(clientId , clientSecret , redirectUrl) 
        this.oauth2Client.setCredentials({ refresh_token : this.refresh_token})
    }

    async getRefreshToken(code){
        return await this.oauth2Client.getToken(code)
    }

    async getToken(){
        return await this.oauth2Client.getAccessToken()
    }

    async  getAuthorizeUrl(){
        var SCOPES = ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube'];

         const authorizeUrl = this.oauth2Client.generateAuthUrl({
             access_type: 'offline',
             scope: SCOPES,
             prompt : 'consent',
           });
         return authorizeUrl; 
    }

    async postVideo( videoFile , title , tags , description , thumbnailUrl)  {
        this.youtubeApiClient.videos.insert({
            auth: this.oauth2Client,
            part: ['snippet','status'],
            requestBody:{
                snippet:{
                    title: title,
                      tags:tags,
                      description:description
                  },
                  status: {
                      privacyStatus: "private",
                    },
                },
                media:{ 
                  body : videoFile
                }
            })
            .finally(err => console.log("finally"))
            .catch(err => console.log("err " + err)) 
    }

    async getYoutubeChannelVideo(channelId){
        try {
            return await this.youtubeApiClient.search.list({
                auth: this.this.oauth2Client,
                channelId : channelId,
                order : 'viewCount',
                part:['snippet'],
            }).then(res => res.data)
            .then(res => res.items)
        } catch (error) {
            return error
        }
    }

}