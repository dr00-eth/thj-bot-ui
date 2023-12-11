
export function getSimplifiedState(context) {
    return {
        messages: context.messageManager.messages,
        displayMessages: context.state.displayMessages,
        context_id: context.state.context_id,
        walletAddress: context.state.walletAddress,
        gptModel: context.state.gptModel,
        deletedMsgs: context.state.deletedMsgs,
        currentConversation: context.state.currentConversation
    };
}
