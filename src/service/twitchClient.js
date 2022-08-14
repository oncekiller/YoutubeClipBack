import twitchAuthCredentials from "../assets/twitchAuthCredentials.js"
import mcache from "memory-cache"
import fetch from "node-fetch"
import axios from "axios"
import * as util from 'util'
import fs from "fs"
const baseUrl="https://api.twitch.tv/"

export default {
  get(url) {
    return this.request("get",`${baseUrl}${url}`)
  },
  post(url, data) {
    return this.request("post",`${baseUrl}${url}`, data)
  },
  put(url, data) {
    return this.request("put",`${baseUrl}${url}`, data)
  },
  delete(url) {
      return this.request("delete",`${baseUrl}${url}`)
  },
  async request(method, url, body, compt=0) {
    if(compt <= 1){
        const header = await this.getHeader()
        const response = await (await fetch(url, {
            method: method,
            headers: header,
            body: body,
        })).json();
        if(response.status === 401){
            console.log("refresh token")
            await this.getToken()
            return await this.request(method, url, body, compt + 1)
        }
        return response;
    }
    throw ("error access token")
  },
  async getHeader(){
    const token = mcache.get("twitchAccessToken")
    return {
      Authorization: `Bearer ${token}`,
      'Client-Id': twitchAuthCredentials.clientId
    }
  },
  async getToken(){
    const url = `https://id.twitch.tv/oauth2/token?client_id=${twitchAuthCredentials.clientId}&client_secret=${twitchAuthCredentials.clientSecret}&grant_type=client_credentials`
    const response = await (await fetch(url, {method: "post"})).json()
    mcache.put("twitchAccessToken" , response?.access_token)
  },
  async getClipById(clipId){
    return await this.get(`helix/clips?id=${clipId}`)
  },
  async postClipTwitchToYoutube(clipId, youtubeClient){
    try{
      const twitchClip = await this.getClipById(clipId)
      const downloadUrl = twitchClip.data[0]?.thumbnail_url?.replace(/-preview-.+$/, '.mp4');  
      const mp4 = await axios.get(downloadUrl, {
        responseType: 'arraybuffer'
      })  
      let writeFile = util.promisify(fs.writeFile)    
      let removeFile = util.promisify(fs.unlink)    
      await writeFile(`./src/assets/videos/clip_${clipId}.mp4`, mp4.data, {
          encoding: 'binary'
      })
      console.log("video downloaded")
      const videoFile = fs.createReadStream(`./src/assets/videos/clip_${clipId}.mp4`)
      //await youtubeClient.postVideo( videoFile , "title" , "tags" , "description" , "thumbnailUrl")
      console.log("clip posted")
      await removeFile(`./src/assets/videos/clip_${clipId}.mp4`)
      console.log("file deleted")
    } catch (error) {
      console.log(error)
    }
  }
} 