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
import { Camera, Loader2, Sparkles, WandSparkles, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { automatedScoreCalculation } from '@/ai/flows/automated-score-calculation';
import { getBestQwirkleOptions } from '@/ai/flows/best-option-helper';
import { fileToDataUri } from '@/lib/utils';
import type { TurnScore } from '@/lib/types';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

interface AiHelperDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddScore: (score: number, type: TurnScore['type']) => void;
}

function FileUpload({ onFileSelect, label }: { onFileSelect: (file: File) => void, label: string }) {
    const { toast } = useToast();
    const [preview, setPreview] = useState<string | null>(null);
    const [view, setView] = useState<'upload' | 'camera'>('upload');
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (view === 'camera' && hasCameraPermission === null) {
            const getCameraPermission = async () => {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({video: true});
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
            getCameraPermission();
        }

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [view, hasCameraPermission, toast]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setView('upload');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                        onFileSelect(file);
                        setPreview(canvas.toDataURL('image/jpeg'));
                        setView('upload');
                    }
                }, 'image/jpeg');
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
                    <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
                    {hasCameraPermission === false && (
                        <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access to use this feature. You may need to change permissions in your browser settings.
                            </AlertDescription>
                        </Alert>
                    )}
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
  const [boardPhoto, setBoardPhoto] = useState<File | null>(null);
  const [tilesPhoto, setTilesPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoScoreResult, setAutoScoreResult] = useState<{ score: number, details: string } | null>(null);
  const [bestMoveResult, setBestMoveResult] = useState<{moveDescription: string, score: number}[] | null>(null);

  const handleAutoScore = async () => {
    if (!boardPhoto) {
        toast({ title: "Please upload a photo of the board.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setAutoScoreResult(null);
    try {
        const photoDataUri = await fileToDataUri(boardPhoto);
        const result = await automatedScoreCalculation({ photoDataUri });
        setAutoScoreResult(result);
    } catch (error) {
        console.error(error);
        toast({ title: "Failed to calculate score.", description: "Please try again.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleBestMove = async () => {
    if (!boardPhoto || !tilesPhoto) {
        toast({ title: "Please upload photos for both board and tiles.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setBestMoveResult(null);
    try {
        const boardPhotoDataUri = await fileToDataUri(boardPhoto);
        const playerTilesPhotoDataUri = await fileToDataUri(tilesPhoto);
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
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setBoardPhoto(null);
    setTilesPhoto(null);
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
                <FileUpload onFileSelect={setBoardPhoto} label="Board Photo" />
                <Button onClick={handleAutoScore} disabled={isLoading || !boardPhoto} className="w-full">
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
                <FileUpload onFileSelect={setBoardPhoto} label="Board Photo" />
                <FileUpload onFileSelect={setTilesPhoto} label="Your Tiles" />
                <Button onClick={handleBestMove} disabled={isLoading || !boardPhoto || !tilesPhoto} className="w-full">
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
