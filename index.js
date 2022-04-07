const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
var {MessageAttachment, MessageEmbed } = require('discord.js')
const { exec } = require('child_process');
const fs = require('fs')
require('dotenv').config()

function deleteFile(filepath){
  try {
    fs.unlinkSync(filepath)
    //file removed
  } catch(err) {
    console.error(err)
  }
}

function takePicture(filepath){
  return new Promise((resolve, reject)=>{
    exec("libcamera-jpeg -o "+filepath, function(error, stdout, stderr) {
      if(error) reject(error)
      resolve(stdout, stderr)
    })
  })
}
const commands = [{
  name: 'shoot',
  description: 'Take a beautiful picture'
}]; 

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'shoot') {
    let currDate = new Date().toISOString()
    let filePath = "/tmp/"+currDate+".png"
    await interaction.deferReply();
    await takePicture(filePath)
    const file = new MessageAttachment(filePath);
    await interaction.editReply({ files: [file] })
    deleteFile(filePath)
  }
});

client.login(process.env.DISCORD_TOKEN);
