import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getThemeColor } from '../../../functions';
import { SlashCommand } from '../../../types';

// This is an example command file for reference - filenames starting with "_" are not imported.
// These command files should contain the config for the command and not much else.
const command: SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('exampleCommand') // the display + machine name of the command - can't be duplicated, contain spaces, or capital letters
		.setDescription('Demonstrates an example command'),
	execute: (interaction) => {
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: 'TunnelQuestBot' })
					.setDescription(
						'This is an example of a command description}',
					)
					.setColor(getThemeColor('text')),
			],
			ephemeral: true,
		});
	},
	cooldown: 10,
};

export default command;
