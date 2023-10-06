import { Server } from '@prisma/client';
import { itemTrie } from './trieSearch';
import { state } from './state';
import inGameItemNamesRaw from '../content/gameData/items.json';
const inGameItemNamesObject = inGameItemNamesRaw as InGameItemNamesType;

type InGameItemNamesType = { [key: string]: string };

export function getLogFilePath(server: Server): string {
	// Get the environment variable corresponding to the server
	const envVarName = `servers.${server}.log_file_path`;
	const logFilePath = process.env[envVarName];

	if (!logFilePath) {
		throw new Error(
			`Log file path for server ${server} is not defined in environment variables`,
		);
	}

	return logFilePath;
}

export function getMatchingItemsFromText(
	auctionText: string,
	server: Server,
): { WTB: string[]; WTS: string[] } {
	const WTB: string[] = [];
	const WTS: string[] = [];

	// Checking for matches in WTB
	for (const item of Object.keys(state.watchedItems[server])) {
		if (auctionText.includes(item)) {
			WTB.push(item);
		}
	}

	// Checking for matches in WTS
	for (const item of Object.keys(state.watchedItems[server])) {
		if (auctionText.includes(item)) {
			WTS.push(item);
		}
	}

	return {
		WTB,
		WTS,
	};
}

export function extractPotentialItemsFromText(text: string): string[] {
	const words = text.split(/\W+/); // Split by non-word characters.
	const potentialItems: string[] = [];

	for (const word of words) {
		if (itemTrie.search(word.toUpperCase())) {
			potentialItems.push(word);
		}
	}
	return potentialItems;
}

export function isFalsePositiveItemMatch(
	potentialItem: string,
	text: string,
): boolean {
	// if the potential item is not an exact item name, allow substring matches
	// for example, user could watch "banded" in hopes of getting hits on any banded armor pieces
	if (!inGameItemNamesObject[potentialItem.toUpperCase()]) {
		return false;
	}

	const potentialItems = extractPotentialItemsFromText(text);

	// Remove the potentialItem from the list to not match with itself.
	const index = potentialItems.indexOf(potentialItem);
	if (index !== -1) {
		potentialItems.splice(index, 1);
	}

	// Check if the potentialItem is part of any other valid item in the auction text.
	for (const item of potentialItems) {
		if (item.includes(potentialItem)) {
			return true; // The potentialItem is a substring of another valid item.
		}
	}
	return false; // The potentialItem is not a substring of any other valid item.
}