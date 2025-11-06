import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-10 gap-8">

      <h1 className="text-4xl font-bold">Acadlyst</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Choose what you want to do today 👇
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        
        <Link href="/qna/pdf">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Chat With PDFs</h2>
            <p className="text-sm text-muted-foreground">
              Ask questions from your study notes using RAG
            </p>
          </Card>
        </Link>

        <Link href="/summarizer/pdf">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Summarize PDF</h2>
            <p className="text-sm text-muted-foreground">
              Get a short summary of any PDF topic instantly
            </p>
          </Card>
        </Link>

        <Link href="/quiz">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">generate quiz</h2>
            <p className="text-sm text-muted-foreground">
              Get a short quiz to test your knowledge on any topic
            </p>
          </Card>
        </Link>


      </div>
    </main>
  );
}
