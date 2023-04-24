const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const perms = require('../permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a command.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command to reload.'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!perms.owner(interaction)) return;
        const commandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);
        if (!command) { //all commands
            //collect commands
            const commands = [];
            client.commands = new Collection();
            const commandsPath = path.join(__dirname, 'commands');
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                    console.log(`/${file} loaded`)
                } else {
                    console.log(`/${file} couldn't load`);
                }
            }
            //register commands
            const rest = new REST().setToken(token);
            (async () => {
                rest.put(Routes.applicationCommands(clientid), {body:commands})
                .then(data => console.log(`Reloaded ${data.length} commands`))
                .catch(e => console.log(e))
            })();
            return;
        }
        //single command
        delete require.cache[require.resolve(`./${command.data.name}.js`)];
        try {
            interaction.client.commands.delete(command.data.name);
            const newCommand = require(`./${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply({content: `\`${newCommand.data.name}\` reloaded`, ephemeral: true});
        } catch (error) {
            console.error(error);
            await interaction.reply({content: `\`/${command.data.name}\` couldn't load:\`\`\`${error.message}\`\`\``, ephemeral: true});
        }
    }
};