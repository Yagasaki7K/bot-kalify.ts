// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js"
import { Player, useMainPlayer } from 'discord-player';

const token = process.env.API_TOKEN

interface MediaInteractionProps {
   member: 
   { 
      voice: { 
         channel: any;
      }; 
   }; 
   
   reply: (arg0: string) => any; 
   options: { 
      getString: (arg0: string, arg1: boolean) => any; 
   }; 
   deferReply: () => any; 
   followUp: (arg0: string) => any;
}

interface MediaQueueProps {
   metadata: 
   { channel: 
      { 
         send: (arg0: string) => void; 
      }; 
   };
}

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

const player = new Player(client);
await player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');

player.events.on('playerStart', (queue: MediaQueueProps, track: { title: string; }) => {
   // we will later define queue.metadata object while creating the queue
   queue.metadata.channel.send(`Started playing **${track.title}**!`);
});

export async function execute(interaction: MediaInteractionProps) {
   const player = useMainPlayer();
   const channel = interaction.member.voice.channel;
   if (!channel) return interaction.reply('You are not connected to a voice channel!'); // make sure we have a voice channel
   const query = interaction.options.getString('query', true); // we need input/query to play

   // let's defer the interaction as things can take time to process
   await interaction.deferReply();

   try {
       const { track } = await player.play(channel, query, {
           nodeOptions: {
               // nodeOptions are the options for guild node (aka your queue in simple word)
               metadata: interaction // we can access this metadata object using queue.metadata later on
           }
       });

       return interaction.followUp(`**${track.title}** enqueued!`);
   } catch (e) {
       // let's return error if something failed
       return interaction.followUp(`Something went wrong: ${e}`);
   }
}

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