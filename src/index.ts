// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, CommandInteraction } from "discord.js"
const token = process.env.API_TOKEN

// Create a new client instance
const client = new Client({
   intents: [GatewayIntentBits.Guilds]
})

client.on('interactionCreate', async (interaction) => {
   if (!interaction.isCommand()) return;

   const command = interaction.commandName;

   if (command === 'ping') {
      const start = Date.now();
      const end = Date.now();
      const ping = end - start;
      await interaction.reply({ content: `Pong! ${ping}ms`, fetchReply: true });
   }

   if (command === 'server') {
      await interaction.reply(`Server name: ${interaction.guild?.name}\nTotal members: ${interaction.guild?.memberCount}`);
   }
});

const rest = new REST({ version: '10' }).setToken(token ? token : '');

const commands = [
   new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with Pong!'),

   new SlashCommandBuilder()
      .setName('server')
      .setDescription('Replies with server info!'),
];

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async client => {
	console.log(`Ready! Logged in as ${client.user.tag}`)

   try {
      console.log('Started refreshing application (/) commands.');
    
      await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
})

// Log in to Discord with your client's token
client.login(token)