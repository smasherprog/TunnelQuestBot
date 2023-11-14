import { SlashCommand } from '../types';
import { getInteractionArgs } from '../lib/helpers/helpers';
import { collectButtonInteractionAndReturnResponse } from '../lib/content/buttons/buttonInteractionCollector';
import {
	MessageTypes,
	buttonRowBuilder,
} from '../lib/content/buttons/buttonRowBuilder';
import { getWatchesByItemName } from '../prisma/dbExecutors';
import { watchFilterOptions } from '../lib/content/commandOptions/commandOptions';
import { InteractionResponse, SlashCommandBuilder } from 'discord.js';
import { watchCommandResponseBuilder } from '../lib/content/messages/messageBuilder';
import { messageCopy } from '../lib/content/copy/messageCopy';

const command: SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('watches')
		.setDescription('show watches')
		.addStringOption(watchFilterOptions) as unknown as SlashCommandBuilder, //chaining commands confuses typescript...
	execute: async (interaction) => {
		// defer reply immediately as it may take a while to send watches
		await interaction.deferReply();
		const args = getInteractionArgs(interaction, [], ['filter']);

		const data = await getWatchesByItemName(
			interaction.user.id,
			args?.filter?.value as string,
		);

		let lastDmChannelId = '';

		await Promise.all(
			data.map(async (watch) => {
				const embeds = [watchCommandResponseBuilder(watch)];
				const components = buttonRowBuilder(MessageTypes.watch);

				const message = await interaction.user.send({
					embeds,
					components,
				});

				lastDmChannelId = message.channelId;
				await collectButtonInteractionAndReturnResponse(
					message as unknown as InteractionResponse<boolean>,
					watch,
				);
			}),
		);

		// If the command was executed from a DM don't link to DM
		if (!interaction.inGuild()) {
			return await interaction.editReply('Here you go...');
		}

		const response = await interaction.editReply(
			messageCopy.watchesHaveBeenDeliveredViaDm(
				data.length,
				lastDmChannelId,
			),
		);

		// Set a timeout to delete the reply after 10 seconds
		return setTimeout(async () => {
			await response.delete();
		}, 10000);
	},
	cooldown: 10,
};

export default command;
