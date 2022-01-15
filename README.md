# A Discord File History Bot and Website

The purpose of this project is to provide Discord users an easier way to view the history of files (attachments) uploaded in their server's text channels.

> As the Discord app currently stands, although it is possible to search for and find files, the small search interface is small and cumbersome.

The project requires operation of a discord bot, a website, and a database.  
- The bot automatically records info to a database, for each file uploaded to your discord server. It also supplies a website URL, with a unique path, for your discord server.
- The website contains a simple table interface, with filter and sorting options, to view your server's file uploads.

> Note: The current project iteration integrates two now-defunct microservices previously hosted by my peers. One service generated UUIDs so that the bot could provide each discord server a unique path for its website URL, and the other service was an image processer that resized and cropped images for previewing on the website. Both of these functions can easily be replaced.

## Preview

### Demo: https://youtu.be/lQe4rczHhVA

#### Discord Interface

![Discord Interface](images/discord_bot_preview.png)

#### Website Interface

![Website Interface](images/website_preview.png)
