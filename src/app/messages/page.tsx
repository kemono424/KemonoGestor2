import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageHeader } from '@/components/page-header';
import { operators } from '@/lib/mock-data';
import { SendHorizonal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function MessagesPage() {
  const activeOperator = operators[0];
  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <PageHeader title="Internal Messaging" description="Communicate with operators in real-time." />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 border rounded-lg overflow-hidden">
        <div className="md:col-span-1 lg:col-span-1 border-r">
          <div className="p-4">
            <Input placeholder="Search operators..." />
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="flex flex-col">
              {operators.map((op, index) => (
                <button
                  key={op.id}
                  className={`flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors ${
                    index === 0 ? 'bg-muted' : ''
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={`https://placehold.co/100x100.png?text=${op.name.charAt(0)}`} />
                    <AvatarFallback>{op.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{op.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      Okay, on my way to the pickup...
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full">
          <div className="p-4 border-b flex items-center gap-3">
             <Avatar>
                <AvatarImage src={`https://placehold.co/100x100.png?text=${activeOperator.name.charAt(0)}`} />
                <AvatarFallback>{activeOperator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{activeOperator.name}</p>
                <p className="text-sm text-green-500">Online</p>
              </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
              {/* Chat messages */}
               <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/100x100.png?text=D" />
                  <AvatarFallback>D</AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted p-3 max-w-xs">
                  <p className="text-sm">John, new trip assigned. Pickup at 123 Main St.</p>
                </div>
              </div>
              <div className="flex justify-end items-start gap-3">
                 <div className="rounded-lg bg-primary text-primary-foreground p-3 max-w-xs">
                  <p className="text-sm">Copy that. On my way.</p>
                </div>
                 <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/100x100.png?text=J" />
                  <AvatarFallback>J</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/100x100.png?text=D" />
                  <AvatarFallback>D</AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted p-3 max-w-xs">
                  <p className="text-sm">Customer name is Alice. Destination: 456 Oak Ave.</p>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="relative">
              <Input placeholder="Type a message..." className="pr-12" />
              <Button size="icon" variant="ghost" className="absolute top-1/2 right-2 -translate-y-1/2">
                <SendHorizonal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
