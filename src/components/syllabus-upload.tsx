'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Loader2, AlertTriangle, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { deconstructSyllabusAction } from '@/app/(main)/actions';
import { useAppContext } from '@/hooks/use-app';
import { Card, CardContent } from '@/components/ui/card';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
];

const formSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than 5 MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      'Only .pdf and .txt files are accepted.'
    ),
});

export function SyllabusUpload() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { setSyllabusData, setIsSyllabusLoading } = useAppContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      form.setValue('file', file);
      form.clearErrors('file');
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setIsSyllabusLoading(true);

    const file = data.file;

    try {
      const syllabusText = await file.text();
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        const result = await deconstructSyllabusAction(dataUri);

        if (result.success && result.data?.mindMap) {
          try {
            setSyllabusData({ mindMap: result.data.mindMap, syllabusText, fileName: file.name });
            toast({
              title: 'Success!',
              description: 'Your syllabus has been deconstructed.',
            });
            router.push('/dashboard');
          } catch (e) {
             throw new Error("Failed to parse the syllabus structure. The AI may have returned an invalid format.");
          }
        } else {
            throw new Error(result.error || "An unknown error occurred during deconstruction.");
        }
      };
      reader.onerror = () => {
        throw new Error("Failed to read the file.");
      }
    } catch (error: any) {
      console.error(error);
      let description = 'Could not process the syllabus. Please try again.';
      if (error.message && error.message.includes('503 Service Unavailable')) {
        description = 'The AI model is currently overloaded. Please try again in a few moments.';
      } else if (error.message) {
        description = error.message;
      }
      
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: description,
      });
      setIsSubmitting(false);
    } finally {
        setIsSyllabusLoading(false);
    }
  };
  
  const {formState: {errors}} = form;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF or TXT (MAX. 5MB)</p>
                        </div>
                        <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept={ACCEPTED_FILE_TYPES.join(',')} />
                    </label>
                </div>
                
                {fileName && !errors.file && (
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-2 p-2 rounded-md bg-accent/50">
                        <FileText className="h-4 w-4" />
                        <span>{fileName}</span>
                    </div>
                )}
                
                <FormField
                    control={form.control}
                    name="file"
                    render={() => <FormItem><FormMessage /></FormItem>}
                />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Syllabus...
                </>
              ) : 'Start Learning'}
            </Button>

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
