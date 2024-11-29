const ragPrompt = {
  qaPrompt: (
    systemPrompt: string,
    question: string
  ) => {
    return `
    ${systemPrompt}
    
    ${question}
    `;
  },
};

export default ragPrompt;
