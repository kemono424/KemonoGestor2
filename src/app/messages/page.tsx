import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageHeader } from '@/components/page-header';
import { operators } from '@/lib/mock-data';
import { SendHorizonal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function MessagesPage() {
  const activeOperator = operators[0];
  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <PageHeader title="Mensajería Interna" description="Comunícate con los operadores en tiempo real." />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 border rounded-lg overflow-hidden">
        <div className="md:col-span-1 lg:col-span-1 border-r">
          <div className="p-4">
            <Input placeholder="Buscar operadores..." />
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
                    <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="person user" />
                    <AvatarFallback>{op.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{op.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      De acuerdo, en camino a la recogida...
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
                <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="person user" />
                <AvatarFallback>{activeOperator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{activeOperator.name}</p>
                <Badge variant="secondary">En línea</Badge>
              </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
              {/* Chat messages */}
               <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person user" />
                  <AvatarFallback>D</AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted p-3 max-w-xs">
                  <p className="text-sm">John, nuevo viaje asignado. Recoger en 123 Main St.</p>
                </div>
              </div>
              <div className="flex justify-end items-start gap-3">
                 <div className="rounded-lg bg-primary text-primary-foreground p-3 max-w-xs">
                  <p className="text-sm">Entendido. En camino.</p>
                </div>
                 <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person user" />
                  <AvatarFallback>J</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person user" />
                  <AvatarFallback>D</AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted p-3 max-w-xs">
                  <p className="text-sm">El nombre del cliente es Alice. Destino: 456 Oak Ave.</p>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="relative">
              <Input placeholder="Escribe un mensaje..." className="pr-12" />
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
