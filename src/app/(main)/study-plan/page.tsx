
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function StudyPlanPage() {
    return (
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
                Dynamic Study Planner
            </h2>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="h-6 w-6" />
                        Feature Under Construction
                    </CardTitle>
                    <CardDescription>
                        This page will allow you to generate a personalized study schedule based on your exam date, study hours, and preferred style.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Check back soon for this exciting feature!</p>
                </CardContent>
            </Card>
        </div>
    );
}
