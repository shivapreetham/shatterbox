import getConversationById from '@/app/actions/getConversationById';
import getMessages from '@/app/actions/getMessages';
import EmptyState from '@/components/chat/EmptyState';
import Header from './components/Header';
import Body from './components/Body';
import Form from './components/Form';



const ConversationId = async ( params :any) => {
  const cparams= await params;
  const  conversationId = cparams.conversationId;
  const conversation = await getConversationById(conversationId);
  const messages = await getMessages(conversationId);

  if (!conversation) {
    return (
      <div className="lg:pl-60 h-full">
        <div className="h-full flex flex-col bg-background theme-transition">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pl-60 h-full">
      <div className="h-full flex flex-col bg-background theme-transition">
        <div className="shadow-sm">
          <Header conversation={conversation} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <Body initialMessages={messages} conversation={conversation as any} />
        </div>
        <div className="border-t border-border shadow-card">
          <Form />
        </div>
      </div>
    </div>
  );
};

export default ConversationId;