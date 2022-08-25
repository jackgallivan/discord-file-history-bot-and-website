// References:
// [1]	How to Make a Discord Bot: an Overview and Tutorial
//		https://www.toptal.com/chatbot/how-to-make-a-discord-bot
// [2]	Documentation for Eris
//		https://abal.moe/Eris/docs/
// [3]	JavaScript Reference
//		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference

const ServerDataHandler = require("./init-handler");
const queries = require("./mysql-queries");

const eris = require("eris");
const credentials = require("../credentials");

const PREFIX = "hist!";
const WEB_DOMAIN = "http://localhost:3000/history";

const bot = new eris.CommandClient(
  credentials.bot_token,
  {},
  {
    description:
      "Provides a web interface to view file uploads to your server.",
    prefix: PREFIX,
    owner: "",
  }
);

/* Action performed when 'ready' event emitted */

bot.on("ready", () => {
  console.log("Discord Bot connected and ready.");
});

/* Action performed when 'error' event emitted */

bot.on("error", (err) => {
  console.error(err);
});

/* Register init command */

bot.registerCommand(
  "init",
  async (msg) => {
    // Command generator

    // Command can only be run if guild info not yet in database
    // Verify command has not been run before by searching for guild id in database
    try {
      const result = await queries.guildExists(msg.guildID);
      if (result) {
        return (
          "Data already logged. Command can only be run once.\nUse " +
          PREFIX +
          "help to view other commands."
        );
      }
    } catch (err) {
      console.error(err);
      return "Error checking database for guild info.";
    }

    // Send message on channel indicating that the command is in progress
    try {
      await msg.channel.createMessage("Saving server data. Please wait...");
    } catch (err) {
      console.error(err);
      return;
    }

    /* Use a ServerDataHandler instance to get the server data needed */

    const guild = bot.guilds.find((guild) => guild.id == msg.guildID);
    const serverData = new ServerDataHandler(msg, guild);
    try {
      await serverData.init();
    } catch (err) {
      console.error(err);
      return serverData.errorMsg;
    }

    /* Add all gathered info to database */

    try {
      // Add guild info to database
      await queries.addGuild(serverData.getGuild());

      // Add channel info to database (only text channels)
      await queries.addChannels(serverData.getChannels());

      // Add member info to database (only members who have created a message with an attachment)
      await queries.addMembers(serverData.getMembers());

      // Add message info to database (only messages containing attachments)
      await queries.addMessages(serverData.getMessages());

      // Add attachment info to database
      await queries.addAttachments(serverData.getAttachments());
    } catch (errMsg) {
      return errMsg;
    }

    const response =
      "Initialization complete. Server data logged and ready for web view.\n" +
      "View server upload history using the following link:\n\n" +
      WEB_DOMAIN +
      "/" +
      serverData.getGuild().shortID;

    return response;
  },
  {
    // Command options
    description:
      "One-time command used to save server data and past uploads. " +
      "Required to enable bot functionality.",
    fullDescription:
      "Saves server information and file upload information to a database.",
    requirements: {
      permissions: {
        administrator: true,
      },
    },
  }
);

/* Register url command */

bot.registerCommand(
  "url",
  async (msg) => {
    // Returns URL for server's upload history

    const guildId = msg.guildID;

    // Get shortId from database
    try {
      let result = await queries.getShortID(guildId, WEB_DOMAIN, PREFIX);
      return result;
    } catch (errMsg) {
      return errMsg;
    }
  },
  {
    // Command options
    argsRequired: false,
    description:
      "Get the URL to the webpage hosting your server's file upload history.",
  }
);

/* Perform action when 'messageCreate' event emitted */

bot.on("messageCreate", async (msg) => {
  // Look for a message attachment and adds it to database.

  // Ignore messages without attachments
  if (msg.attachments.length < 1) return;

  const member = getMemberFromMsg(msg);
  const message = getMsgInfo(msg);
  const attachments = getAttachmentsFromMsg(msg);

  try {
    // See if member info is in database and add them if not
    await queries.getThenAddMember(member);

    // Add message info to database
    await queries.addMessages([message]);

    // Add attachment info to database
    await queries.addAttachments(attachments);
  } catch (err) {
    console.error(err);
    return;
  }
});

function getMemberFromMsg(msg) {
  return {
    userID: msg.author.id,
    guildID: msg.guildID,
    userName: msg.author.username,
    userNick: msg.member.nick || null,
  };
}

function getMsgInfo(msg) {
  const time = new Date(msg.timestamp);
  return {
    messageID: msg.id,
    channelID: msg.channel.id,
    guildID: msg.guildID,
    userID: msg.author.id,
    messageDate: time.toISOString(),
  };
}

function getAttachmentsFromMsg(msg) {
  const attachments = [];
  for (const attachment of msg.attachments) {
    attachments.push({
      attachmentID: attachment.id,
      messageID: msg.id,
      attType: attachment.content_type,
      attName: attachment.filename,
      attURL: attachment.url,
    });
  }
  return attachments;
}

/* Connect bot */

bot.connect();
