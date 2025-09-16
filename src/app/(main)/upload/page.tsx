
import { SyllabusUpload } from '@/components/syllabus-upload';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function UploadPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background/50 p-4">
      <div className="container z-10 flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
            Upload Your Syllabus
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
            Transform your syllabus into a dynamic study plan. Get personalized quizzes, AI tutoring, and master every concept.
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <SyllabusUpload />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <FeatureCard title="Syllabus Deconstructor" description="Instantly create an interactive mind map from your syllabus." />
          <FeatureCard title="Dynamic Study Planner" description="Get a personalized schedule tailored to your exam date and study style." />
          <FeatureCard title="On-Demand Quiz Engine" description="Test your knowledge with custom quizzes and AI-powered explanations." />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
