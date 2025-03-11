
import { Configuration, OpenAIApi } from 'openai';

// This handler will connect to OpenAI API for processing chat messages
export class OpenAIHandler {
  private openai: OpenAIApi | null = null;
  private isConfigured: boolean = false;
  
  constructor(apiKey?: string) {
    if (apiKey) {
      this.configure(apiKey);
    }
  }
  
  configure(apiKey: string): void {
    try {
      const configuration = new Configuration({
        apiKey: apiKey,
      });
      
      this.openai = new OpenAIApi(configuration);
      this.isConfigured = true;
      console.log('OpenAI configuration successful');
    } catch (error) {
      console.error('Error configuring OpenAI:', error);
      this.isConfigured = false;
      this.openai = null;
    }
  }
  
  async processChatMessage(
    message: string, 
    previousMessages: Array<{ role: 'user' | 'assistant' | 'system', content: string }> = []
  ) {
    if (!this.isConfigured || !this.openai) {
      throw new Error('OpenAI is not configured. Please provide a valid API key.');
    }
    
    try {
      // Create a system message defining the bot's role
      const systemMessage = {
        role: 'system' as const,
        content: 
          'You are a helpful support assistant for CosmicLink, a web proxy service. ' +
          'Provide concise and accurate answers to user questions about premium features, ' + 
          'account management, and technical issues. If you are unsure or the question ' +
          'requires human intervention, suggest escalating to a human support agent.'
      };
      
      // Combine previous messages with the new message
      const messages = [
        systemMessage,
        ...previousMessages,
        { role: 'user' as const, content: message }
      ];
      
      // Call OpenAI API
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });
      
      // Extract and return the assistant's response
      const assistantMessage = response.data.choices[0]?.message?.content || 
        'I apologize, but I am having trouble processing your request. Please try again or contact a human support agent.';
      
      return {
        message: assistantMessage,
        shouldEscalate: this.shouldEscalateToHuman(message, assistantMessage)
      };
    } catch (error) {
      console.error('Error processing message with OpenAI:', error);
      throw new Error('Failed to process message with AI. Please try again later.');
    }
  }
  
  // Determine if the conversation should be escalated to a human
  private shouldEscalateToHuman(userMessage: string, aiResponse: string): boolean {
    const userMessageLower = userMessage.toLowerCase();
    const aiResponseLower = aiResponse.toLowerCase();
    
    // Keywords in user message that might indicate complex issues
    const complexIssueKeywords = [
      'bug', 'broken', 'not working', 'error', 'problem', 'can\'t access', 
      'payment failed', 'refund', 'cancel subscription', 'security', 'hacked',
      'compromised', 'contact', 'speak to human', 'real person', 'agent'
    ];
    
    // Check if AI response indicates uncertainty
    const uncertaintyPhrases = [
      'i\'m not sure', 'i don\'t know', 'i cannot', 'i can\'t', 
      'beyond my capabilities', 'human agent', 'support team',
      'cannot assist', 'unable to help', 'need more information'
    ];
    
    // Check for complex issues in user message
    const hasComplexIssue = complexIssueKeywords.some(keyword => 
      userMessageLower.includes(keyword)
    );
    
    // Check if AI is uncertain
    const aiIsUncertain = uncertaintyPhrases.some(phrase => 
      aiResponseLower.includes(phrase)
    );
    
    // If the message is very long, it might be a complex issue
    const isLongMessage = userMessage.length > 200;
    
    return hasComplexIssue || aiIsUncertain || isLongMessage;
  }
  
  // Check if OpenAI is properly configured
  isReady(): boolean {
    return this.isConfigured && this.openai !== null;
  }
}

// Create a singleton instance
const openAIHandler = new OpenAIHandler();

export default openAIHandler;
