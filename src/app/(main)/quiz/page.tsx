
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function QuizPage() {
    return (
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
                On-Demand Quiz Engine
            </h2>

             <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="h-6 w-6" />
                        Feature Under Construction
                    </CardTitle>
                    <CardDescription>
                        This page will let you generate quizzes on selected topics with customizable difficulty and AI-powered answer explanations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Check back soon to test your knowledge!</p>
                </CardContent>
            </Card>
        </div>
    );
}
