module.exports = {
  getGuildName,
  getGuildData,
};

const mysql = require("./dbcon");

async function getGuildName(shortID) {
  const selectGuildName = "SELECT guildName FROM guilds WHERE shortID = ?";
  const [guildResults] = await mysql.pool.query(selectGuildName, [shortID]);
  if (guildResults.length < 1) {
    throw new Error("Guild with corresponding shortID not found in database.");
  }
  return guildResults[0].guildName;
}

async function getGuildData(shortID) {
  const selectData =
    "SELECT ch.channelName AS channel, IF(mem.userNick IS NULL, mem.userName, " +
    'mem.userNick) AS username, DATE_FORMAT(msg.messageDate, "%Y-%m-%d %T") AS date, ' +
    "att.attType AS contentType, att.attName AS filename, att.attURL AS url " +
    "FROM attachments att " +
    "JOIN messages msg ON att.messageID = msg.messageID " +
    "JOIN members mem ON msg.userID = mem.userID " +
    "JOIN channels ch ON msg.channelID = ch.channelID " +
    "JOIN guilds g ON msg.guildID = g.guildID " +
    "WHERE g.shortID = ?";
  const [dataResults] = await mysql.pool.query(selectData, [shortID]);
  return dataResults;
}
