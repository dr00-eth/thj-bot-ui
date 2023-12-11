import { getKv } from '../kv.utils';


export async function fetchConversation(context, conversationId) {
    const { walletAddress } = context.state;

    const states = await getKv(context, walletAddress); // eslint-disable-line no-unused-vars
    const conversation = states.find((conversationState) => conversationState.id === conversationId);
    if (conversation) {
        const { state } = conversation;
        context.messageManager.messages = state.messages;
        await context.setStateAsync({
            messages: context.messageManager.messages,
            displayMessages: state.displayMessages,
            context_id: state.context_id,
            walletAddress: state.walletAddress,
            gptModel: state.gptModel,
            deletedMsgs: state.deletedMsgs,
            currentConversation: state.currentConversation === "" ? conversation.id : state.currentConversation
        });
    }
}
