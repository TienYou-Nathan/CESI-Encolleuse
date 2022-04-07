const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config()

function takePicture(filepath){
  return new Promise((resolve, reject)=>{
    exec("libcamera-jpeg -o "+filepath, function(error, stdout, stderr) {
      if(error) reject(error)
      resolve(stdout, stderr)
    })
  })
}
const commands = [{
  name: 'ping',
  description: 'Replies with Pong!'
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

  if (interaction.commandName === 'ping') {
    let currDate = new Date().toISOString()
    let filePath = "/tmp/"+currDate+".png"
    await takePicture(filePath)
    const fileembed = new MessageAttachment(filePath);
    const embed = new MessageEmbed().setTitle(currDate).setImage('attachment://encolleuse.png');
    await interaction.reply({ embeds: [embed], files: [fileembed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
