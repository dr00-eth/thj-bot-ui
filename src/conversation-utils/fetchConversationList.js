import { getKv } from '../kv.utils';


export async function fetchConversationList(context) {
    const { walletAddress } = context.state;

    const states = await getKv(context, walletAddress);
    const modifiedStates = states.map(({ id, name }) => ({ id, name }));
    return modifiedStates;
}
