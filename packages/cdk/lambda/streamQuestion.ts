import { Handler } from 'aws-lambda';
import api from './utils/bedrockApi';
// import kendraApi from './utils/kendraApi';
import qaPrompt from './prompts/prompt';
import translateApi from './utils/translateApi';
import { QuestionRequest } from 'rag-avatar-demo';

declare global {
  namespace awslambda {
    function streamifyResponse(
      f: (
        event: QuestionRequest,
        responseStream: NodeJS.WritableStream
      ) => Promise<void>
    ): Handler;
  }
}

export const handler = awslambda.streamifyResponse(
  async (event, responseStream) => {
    let question = event.question;
    const systemPrompt = event.prompt
    if (event.questionLangCode !== 'ja') {
      const { TranslatedText } = await translateApi.translateText(
        event.question,
        event.questionLangCode,
        'ja'
      );
      question = TranslatedText ?? '';
    }

    // const documents = (await kendraApi.retrieve(question)).ResultItems ?? [];

    const prompt = qaPrompt.qaPrompt(systemPrompt, question);
    for await (const token of api.invokeStream(prompt)) {
      responseStream.write(token);
    }
    responseStream.end();
  }
);
