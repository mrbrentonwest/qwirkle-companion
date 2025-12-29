'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '../ui/button';
import { Camera, Loader2, Sparkles, WandSparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { automatedScoreCalculation } from '@/ai/flows/automated-score-calculation';
import { getBestQwirkleOptions } from '@/ai/flows/best-option-helper';
import { fileToDataUri } from '@/lib/utils';
import type { TurnScore } from '@/lib/types';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

const MAX_IMAGE_WIDTH = 1024;

const resizeImageAndGetDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const aspect = img.height / img.width;
        canvas.width = Math.min(img.width, MAX_IMAGE_WIDTH);
        canvas.height = canvas.width * aspect;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // For JPEG, you can specify quality. 0.9 is a good balance.
        const dataUrl = canvas.toDataURL(file.type, 0.9);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


interface AiHelperDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddScore: (score: number, type: TurnScore['type']) => void;
}

function FileUpload({ onFileSelect, label }: { onFileSelect: (dataUri: string) => void, label: string }) {
    const { toast } = useToast();
    const [preview, setPreview] = useState<string | null>(null);
    const [view, setView] = useState<'upload' | 'camera'>('upload');
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const getCameraPermission = async () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            streamRef.current = stream;
            setHasCameraPermission(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings to use this app.',
            });
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            if(videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    }

    useEffect(() => {
        if (view === 'camera') {
            getCameraPermission();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        }
    }, [view, toast]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const dataUri = await resizeImageAndGetDataUri(file);
                onFileSelect(dataUri);
                setPreview(dataUri);
                setView('upload');
            } catch (error) {
                console.error("Image processing failed:", error);
                toast({ title: "Image processing failed.", description: "Could not read the image file. Please try another one.", variant: "destructive" });
            }
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            const aspect = video.videoHeight / video.videoWidth;
            canvas.width = Math.min(video.videoWidth, MAX_IMAGE_WIDTH);
            canvas.height = canvas.width * aspect;

            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUri = canvas.toDataURL('image/jpeg', 0.9);
                onFileSelect(dataUri);
                setPreview(dataUri);
                setView('upload');
            }
        }
    };
    
    return (
        <div className="w-full">
            <label className="text-sm font-medium text-foreground/80">{label}</label>
            {view === 'upload' && (
                <div 
                  className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
                  onClick={() => inputRef.current?.click()}
                >
                    <div className="space-y-1 text-center">
                        {preview ? (
                            <Image src={preview} alt="Preview" width={100} height={100} className="mx-auto h-24 w-24 object-cover rounded-md" />
                        ) : (
                            <Camera className="mx-auto h-12 w-12 text-foreground/50" />
                        )}
                        <p className="text-sm text-foreground/60">
                            {preview ? 'Click to change image' : 'Click to upload an image'}
                        </p>
                        <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                    </div>
                </div>
            )}
            {view === 'camera' && (
                <div className="mt-1 space-y-2">
                    <div className="w-full aspect-video rounded-md bg-black overflow-hidden relative">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        {hasCameraPermission === false && (
                            <div className='absolute inset-0 flex items-center justify-center'>
                                <Alert variant="destructive" className='w-auto'>
                                    <AlertTitle>Camera Access Required</AlertTitle>
                                    <AlertDescription>
                                        Please allow camera access to use this feature.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </div>
                    
                    <Button onClick={handleCapture} disabled={!hasCameraPermission} className="w-full">
                        <Camera className="mr-2" />
                        Take Picture
                    </Button>
                </div>

            )}
            <canvas ref={canvasRef} className="hidden" />
            <Button variant="link" onClick={() => setView(view === 'upload' ? 'camera' : 'upload')} className="w-full">
                {view === 'upload' ? 'Use Camera Instead' : 'Upload File Instead'}
            </Button>
        </div>
    );
}


export function AiHelperDialog({ isOpen, onOpenChange, onAddScore }: AiHelperDialogProps) {
  const { toast } = useToast();
  const [boardPhotoDataUri, setBoardPhotoDataUri] = useState<string | null>(null);
  const [tilesPhotoDataUri, setTilesPhotoDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoScoreResult, setAutoScoreResult] = useState<{ score: number, details: string } | null>(null);
  const [bestMoveResult, setBestMoveResult] = useState<{moveDescription: string, score: number}[] | null>(null);

  const handleAutoScore = async () => {
    if (!boardPhotoDataUri) {
        toast({ title: "Please upload a photo of the board.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setAutoScoreResult(null);
    try {
        const result = await automatedScoreCalculation({ photoDataUri: boardPhotoDataUri });
        setAutoScoreResult(result);
    } catch (error) {
        console.error(error);
        toast({ title: "Failed to calculate score.", description: "Please try again.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleBestMove = async () => {
    if (!boardPhotoDataUri || !tilesPhotoDataUri) {
        toast({ title: "Please upload photos for both board and tiles.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setBestMoveResult(null);
    try {
        const { suggestions } = await getBestQwirkleOptions({ boardPhotoDataUri, playerTilesPhotoDataUri });
        setBestMoveResult(suggestions);
    } catch (error) {
        console.error(error);
        toast({ title: "Failed to find best moves.", description: "Please try again.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const applyScore = (score: number, type: TurnScore['type']) => {
    onAddScore(score, type);
    toast({ title: "Score Added!", description: `${score} points have been added to your total.`});
    handleOpenChange(false);
  };

  const resetState = () => {
    setBoardPhotoDataUri(null);
    setTilesPhotoDataUri(null);
    setAutoScoreResult(null);
    setBestMoveResult(null);
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        resetState();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2"><WandSparkles /> AI Helpers</DialogTitle>
          <DialogDescription>
            Use AI to automate scoring or get strategic advice.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="auto-score" onValueChange={() => resetState()}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="auto-score">Auto Score</TabsTrigger>
            <TabsTrigger value="best-move">Best Move</TabsTrigger>
          </TabsList>
          <TabsContent value="auto-score" className="pt-4">
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Take a picture of the board after your turn to automatically calculate your score.</p>
                <FileUpload onFileSelect={setBoardPhotoDataUri} label="Board Photo" />
                <Button onClick={handleAutoScore} disabled={isLoading || !boardPhotoDataUri} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Calculate Score
                </Button>
                {autoScoreResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Calculated Score: {autoScoreResult.score}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{autoScoreResult.details}</p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => applyScore(autoScoreResult.score, 'auto-score')}>Add Score to Game</Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
          </TabsContent>
          <TabsContent value="best-move" className="pt-4">
             <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Take a picture of the board and your tiles to get the top 3 move suggestions.</p>
                <FileUpload onFileSelect={setBoardPhotoDataUri} label="Board Photo" />
                <FileUpload onFileSelect={setTilesPhotoDataUri} label="Your Tiles" />
                <Button onClick={handleBestMove} disabled={isLoading || !boardPhotoDataUri || !tilesPhotoDataUri} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Find Best Moves
                </Button>
                {bestMoveResult && (
                    <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                        <h3 className="font-headline text-lg">Top 3 Moves</h3>
                        {bestMoveResult.map((move, index) => (
                             <Card key={index} className="bg-secondary/50">
                                <CardHeader>
                                    <CardTitle>Option {index+1}: {move.score} Points</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{move.moveDescription}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" size="sm" onClick={() => applyScore(move.score, 'helper')}>Apply This Move</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
             </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
