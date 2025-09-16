
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { useAppContext } from '@/hooks/use-app';
import { useMemo } from 'react';
import type { SyllabusSubTopic, SyllabusTopic } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookCopy, CalendarDays, FileQuestion, Bot, NotebookText } from 'lucide-react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Topic
              </span>
              <span className="font-bold text-foreground">{data.fullName}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Weightage
              </span>
              <span className="font-bold text-muted-foreground">
                {data.weightage}
              </span>
            </div>
          </div>
        </div>
      );
    }
  
    return null;
};

export default function DashboardPage() {
  const { mindMap, fileName } = useAppContext();

  const { chartData, totalTopics, averageWeightage } = useMemo(() => {
    if (!mindMap?.topics) {
      return { chartData: [], totalTopics: 0, averageWeightage: 0 };
    }

    const data = mindMap.topics
      .filter((topic): topic is SyllabusTopic => !!topic && !!topic.topic)
      .map((topic) => ({
        name: topic.topic.length > 15 ? `${topic.topic.substring(0, 12)}...` : topic.topic,
        fullName: topic.topic,
        weightage: topic.weightage,
      }))
      .sort((a, b) => b.weightage - a.weightage);
      
    const countTopics = (topics: (SyllabusTopic | string)[]): number => {
        return topics.reduce((acc, topic) => {
            if (typeof topic === 'string') {
                return acc + 1;
            }
            if (!topic || !topic.topic) return acc;
            return acc + 1 + (topic.subtopics ? countTopics(topic.subtopics) : 0);
        }, 0);
    };
    
    const total = countTopics(mindMap.topics);
    
    const validTopics = mindMap.topics.filter((t): t is SyllabusTopic => !!t && t.weightage !== undefined);
    const totalWeightage = validTopics.reduce((sum, t) => sum + t.weightage, 0);
    const avg = validTopics.length > 0 ? totalWeightage / validTopics.length : 0;

    return { chartData: data, totalTopics: total, averageWeightage: parseFloat(avg.toFixed(1)) };
  }, [mindMap]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
            Welcome to your Dashboard
            </h2>
            <p className="text-muted-foreground">
                Here's an overview of your syllabus: {fileName}
            </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <QuickLinkCard href="/syllabus" icon={BookCopy} title="View Syllabus" description="Explore your syllabus mind map."/>
        <QuickLinkCard href="/study-plan" icon={CalendarDays} title="Create Plan" description="Generate your study schedule."/>
        <QuickLinkCard href="/quiz" icon={FileQuestion} title="Start Quiz" description="Test your knowledge."/>
        <QuickLinkCard href="/flashcards" icon={NotebookText} title="Flashcards" description="Review key concepts."/>
        <QuickLinkCard href="/tutor" icon={Bot} title="Ask Tutor" description="Get help with concepts."/>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Topic Weightage</CardTitle>
            <CardDescription>
              A visual breakdown of the most important topics in your syllabus.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  domain={[0, 10]}
                />
                <Tooltip
                    cursor={{fill: "hsl(var(--accent))", opacity: 0.5}}
                    content={<CustomTooltip />}
                />
                <Bar dataKey="weightage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="col-span-4 lg:col-span-3 grid grid-cols-1 grid-rows-2 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
                    <BookCopy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalTopics}</div>
                    <p className="text-xs text-muted-foreground">
                    topics and sub-topics identified
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Importance</CardTitle>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                    >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{averageWeightage} / 10</div>
                    <p className="text-xs text-muted-foreground">
                    average weightage across main topics
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

function QuickLinkCard({href, icon: Icon, title, description} : {href: string, icon: React.ElementType, title: string, description: string}) {
    return (
        <Card className="hover:bg-accent/50 transition-colors">
            <Link href={href} className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">{description}</p>
                <div className="text-primary text-xs font-semibold flex items-center mt-4">
                    Go <ArrowRight className="h-3 w-3 ml-1"/>
                </div>
            </CardContent>
            </Link>
        </Card>
    )
}

    
