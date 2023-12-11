import { showLoading, hideLoading } from './helpers';
import { waitForIncomingChatToFinish } from './helpers';
import { getKv, storeKv } from "./kv.utils";
import { createConversation } from "./conversation-utils/createConversation";
import { updateConversation } from "./conversation-utils/updateConversation";
import { writingStyleOptions, toneOptions, targetAudienceOptions, formatOptions, languageOptions } from './vibes';
import { IntercomProvider } from 'react-use-intercom';


function adjustVibe(userMessage) {
    const { messageInput } = userMessage;
    let vibedMessage = messageInput;

    const allOptions = {
        tone: toneOptions,
        writingStyle: writingStyleOptions,
        targetAudience: targetAudienceOptions,
        format: formatOptions,
        language: languageOptions
    };

    Object.entries(allOptions).forEach(([key, options]) => {
        const selectedOption = options.find((option) => option.value === userMessage[key]);
        if (selectedOption) {
            vibedMessage += selectedOption.vibeString;
        }
    });

    return vibedMessage;
}

export async function sendMessage(context) {
    const { displayMessages, connection_id, context_id, gptModel, userMessage, currentConversation } = context.state;

    if (userMessage.messageInput && userMessage.messageInput !== '') {
        if (userMessage.writingStyle || userMessage.tone || userMessage.targetAudience || userMessage.format || userMessage.language) {
            userMessage.vibedMessage = adjustVibe(userMessage);
        }
        const messageId = context.messageManager.addMessage("user", userMessage.vibedMessage !== '' ? userMessage.vibedMessage : userMessage.messageInput);
        const updatedDisplayMessages = [...displayMessages, {
            role: 'user',
            content: userMessage.messageInput,
            id: messageId,
            isFav: false,
            tone: userMessage.tone,
            writingStyle: userMessage.writingStyle,
            targetAudience: userMessage.targetAudience,
            format: userMessage.format,
            language: userMessage.language,
        }];
        //We push this ASAP before hitting /api/chat to avoid appening GPT response to previous response
        await context.setStateAsync({ displayMessages: updatedDisplayMessages });

        if (currentConversation !== '') {
            await updateConversation(context);
        } else {
            await createConversation(context, userMessage.messageInput.slice(0, 30));
        }


        const requestBody = {
            user_id: connection_id,
            context_id: context_id
        }

        if (gptModel !== null) {
            requestBody.model = gptModel;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        };
        await fetch(`${context.apiServerUrl}/api/chat`, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send message');
                }
            })
            .catch(error => console.error(error));


        const tokenChkBody = {
            messages: context.messageManager.getMessagesSimple(),
            model: gptModel
        }

        const tokenChkReq = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tokenChkBody)
        };

        await fetch(`${context.apiServerUrl}/api/gettokencount`, tokenChkReq)
            .then(async response => await response.json())
            .then(async (data) => {
                if (data.tokencounts > 3000) {
                    await context.messageManager.checkThresholdAndMove(context, data.tokencounts);
                    updateConversation(context);
                    await context.setStateAsync({ messagesTokenCount: data.tokencounts });
                }
            })
            .catch(error => console.error(error));

        const newUserMessage = { ...userMessage, messageInput: "", vibedMessage: "", tone: "", writingStyle: "", targetAudience: "", format: "", language: "" };
        await context.setStateAsync({ userMessage: newUserMessage });
    }
}

export async function addMessage(context, role, message, isFav = false) {
    try {
        context.messageManager.addMessage(role, message, isFav);
        await context.setStateAsync({ messages: context.messageManager.messages })
    } catch (error) {
        console.error('Error in addMessage:', error);
    }
}