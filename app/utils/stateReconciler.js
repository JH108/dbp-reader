export default (incoming, original, reducedState) => {
	const finalState = reducedState;
	const incomingId = incoming.profile.userId;
	const originalId = original.profile.userId;

	if (originalId && !incomingId) {
		finalState.profile.userId = originalId;
	}

	return finalState;
};
