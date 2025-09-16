
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function TutorPage() {
    return (
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
                Context-Aware Concept Tutor
            </h2>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="h-6 w-6" />
                        Feature Under Construction
                    </CardTitle>
                    <CardDescription>
                        This page will feature an AI chatbot to answer your syllabus-related questions with explanations, examples, and comparisons.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Your personal AI tutor is coming soon!</p>
                </CardContent>
            </Card>
        </div>
    );
}
