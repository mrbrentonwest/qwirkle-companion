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
import { Camera, Loader2, Sparkles, WandSparkles, SwitchCamera, X, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { automatedScoreCalculation } from '@/ai/flows/automated-score-calculation';
import { getBestQwirkleOptions, type BestQwirkleOptionsOutput, type Tile, type BoardLine } from '@/ai/flows/best-option-helper';
import type { TurnScore } from '@/lib/types';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { QwirkleShape } from '@/components/icons';
import { cn } from '@/lib/utils';

const MAX_IMAGE_WIDTH = 800;
const JPEG_QUALITY = 0.7;

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
        
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- DEPTH UTILITIES ---
const depthStyles = {
    raised: "bg-white shadow-[inset_0_1px_0_0_rgba(255,255,255,1.0),0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-gray-200",
    recessed: "bg-gray-100 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.06)] border-b border-white",
    buttonPrimary: "bg-orange-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_4px_6px_rgba(194,65,12,0.4),0_2px_4px_rgba(0,0,0,0.1)] text-white border border-orange-700/20 active:translate-y-1 active:shadow-inner",
    buttonPurple: "bg-purple-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_4px_6px_rgba(126,34,206,0.4),0_2px_4px_rgba(0,0,0,0.1)] text-white border border-purple-700/20 active:translate-y-1 active:shadow-inner",
};

const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const;
const SHAPES = ['circle', 'square', 'diamond', 'star', 'clover', 'starburst'] as const;

function EditableTileChip({
  tile,
  onUpdate,
  size = 'normal'
}: {
  tile: Tile,
  onUpdate: (newTile: Tile) => void,
  size?: 'normal' | 'small'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editColor, setEditColor] = useState(tile.color);
  const [editShape, setEditShape] = useState(tile.shape);

  const handleSave = () => {
    onUpdate({ color: editColor, shape: editShape });
    setIsEditing(false);
  };

  const iconSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
  const textSize = size === 'small' ? 'text-[10px]' : 'text-xs';

  if (isEditing) {
    return (
      <div className={cn("rounded-2xl p-3 space-y-3 z-50", depthStyles.raised)}>
        <div className="flex gap-1.5 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setEditColor(c)}
              className={cn(
                "w-7 h-7 rounded-full border-2 transition-all",
                editColor === c ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent opacity-70'
              )}
              style={{ backgroundColor: c === 'purple' ? '#9333ea' : c === 'orange' ? '#ea580c' : c === 'yellow' ? '#ca8a04' : c === 'green' ? '#16a34a' : c === 'blue' ? '#2563eb' : '#dc2626' }}
            />
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {SHAPES.map(s => (
            <button
              key={s}
              onClick={() => setEditShape(s)}
              className={cn(
                "p-1.5 rounded-xl border-2 transition-all",
                editShape === s ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-100 bg-gray-50 opacity-70'
              )}
            >
              <QwirkleShape shape={s} className="w-5 h-5" style={{ color: editColor === 'purple' ? '#9333ea' : editColor === 'orange' ? '#ea580c' : editColor === 'yellow' ? '#ca8a04' : editColor === 'green' ? '#16a34a' : editColor === 'blue' ? '#2563eb' : '#dc2626' }} />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-1 text-xs font-black bg-green-600 text-white rounded-xl py-2 shadow-sm active:scale-95 transition-transform">
            SAVE
          </button>
          <button onClick={() => setIsEditing(false)} className="flex-1 text-xs font-bold bg-gray-100 text-gray-500 rounded-xl py-2 active:scale-95 transition-transform">
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setEditColor(tile.color);
        setEditShape(tile.shape);
        setIsEditing(true);
      }}
      className={cn(
        "flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-all active:scale-95",
        depthStyles.raised,
        "hover:border-purple-300"
      )}
    >
      <QwirkleShape 
        shape={tile.shape} 
        className={iconSize} 
        style={{ color: tile.color === 'purple' ? '#9333ea' : tile.color === 'orange' ? '#ea580c' : tile.color === 'yellow' ? '#ca8a04' : tile.color === 'green' ? '#16a34a' : tile.color === 'blue' ? '#2563eb' : '#dc2626' }} 
      />
      <span className={`${textSize} font-black uppercase tracking-tight text-gray-700`}>{tile.color}</span>
    </button>
  );
}

function MoveVisualizer({ tiles }: { tiles: any[] }) {
    if (!tiles || tiles.length === 0) return null;

    const xs = tiles.map(t => t.x);
    const ys = tiles.map(t => t.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    const cellSize = width > 4 || height > 4 ? 32 : 40;
    const iconSize = width > 4 || height > 4 ? 'w-6 h-6' : 'w-8 h-8';

    return (
        <div className="flex justify-center my-2 overflow-x-auto">
             <div className="grid gap-1 p-3 bg-gray-100 rounded-2xl shadow-inner border-b border-white" style={{
                gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${height}, ${cellSize}px)`
            }}>
                {tiles.map((tile, i) => (
                    <div key={i} className="flex items-center justify-center relative bg-white rounded-lg shadow-sm border border-gray-100" style={{
                        gridColumn: tile.x - minX + 1,
                        gridRow: tile.y - minY + 1,
                        width: cellSize,
                        height: cellSize,
                    }}>
                    <QwirkleShape 
                        shape={tile.shape} 
                        className={iconSize} 
                        style={{ color: tile.color === 'purple' ? '#9333ea' : tile.color === 'orange' ? '#ea580c' : tile.color === 'yellow' ? '#ca8a04' : tile.color === 'green' ? '#16a34a' : tile.color === 'blue' ? '#2563eb' : '#dc2626' }} 
                    />
                    {tile.type === 'new' && (
                        <div className="absolute inset-0 border-2 border-orange-400 rounded-lg animate-pulse" />
                    )}
                    </div>
                ))}
            </div>
        </div>
    )
}

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
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const getCameraPermission = async () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            streamRef.current = stream;
            setHasCameraPermission(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error: any) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);

            let errorMessage = 'Please enable camera permissions in your browser settings.';
            if (error?.name === 'NotAllowedError') {
                errorMessage = 'Camera permission was denied. Please allow camera access and try again.';
            } else if (error?.name === 'NotFoundError') {
                errorMessage = 'No camera found on this device.';
            } else if (error?.name === 'NotReadableError') {
                errorMessage = 'Camera is already in use by another app.';
            } else if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
                errorMessage = 'Camera requires HTTPS. Please use the ngrok URL instead of HTTP.';
            }

            toast({
                variant: 'destructive',
                title: 'Camera Access Error',
                description: errorMessage,
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
    }, [view, facingMode]);

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

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
                const dataUri = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
                onFileSelect(dataUri);
                setPreview(dataUri);
                setView('upload');
            }
        }
    };
    
    return (
        <div className="w-full space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{label}</label>
            {view === 'upload' && (
                <div 
                  className={cn(
                    "relative flex justify-center items-center px-6 pt-8 pb-10 border-2 border-dashed rounded-[2rem] cursor-pointer hover:border-orange-400 transition-all group",
                    preview ? "border-orange-200 bg-orange-50/30" : "border-gray-200 bg-gray-50/50"
                  )}
                  onClick={() => inputRef.current?.click()}
                >
                    <div className="space-y-3 text-center">
                        {preview ? (
                            <div className="relative mx-auto h-28 w-28 shadow-xl rounded-2xl overflow-hidden border-4 border-white rotate-2 group-hover:rotate-0 transition-transform">
                                <Image src={preview} alt="Preview" fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                <Camera className="h-8 w-8 text-gray-400 group-hover:text-orange-500 transition-colors" />
                            </div>
                        )}
                        <p className="text-sm font-bold text-gray-500 group-hover:text-gray-700">
                            {preview ? 'TAP TO CHANGE' : 'UPLOAD PHOTO'}
                        </p>
                        <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                    </div>
                </div>
            )}
            {view === 'camera' && (
                <div className="space-y-3">
                    {hasCameraPermission === false ? (
                        <div className="space-y-3">
                            <Alert className="border-orange-200 bg-orange-50 rounded-2xl">
                                <AlertTitle className="text-orange-700 font-black uppercase text-xs tracking-wider">Use Native Camera</AlertTitle>
                                <AlertDescription className="text-orange-600 font-medium">
                                    Browser camera blocked. Tap below to open your camera app instead.
                                </AlertDescription>
                            </Alert>
                            <Button
                                onClick={() => cameraInputRef.current?.click()}
                                className={cn("w-full h-16 rounded-2xl text-lg font-black", depthStyles.buttonPrimary)}
                            >
                                <Camera className="mr-2 h-6 w-6" />
                                OPEN CAMERA
                            </Button>
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="sr-only"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="w-full aspect-[4/3] rounded-[2rem] bg-gray-900 overflow-hidden relative shadow-2xl border-4 border-white">
                                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                {hasCameraPermission === null && (
                                    <div className='absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm'>
                                        <Loader2 className="w-10 h-10 animate-spin text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button 
                                    onClick={handleCapture} 
                                    disabled={!hasCameraPermission} 
                                    className={cn("flex-1 h-16 rounded-2xl text-lg font-black", depthStyles.buttonPrimary)}
                                >
                                    <Camera className="mr-2 h-6 w-6" />
                                    TAKE PHOTO
                                </Button>
                                <Button 
                                    onClick={toggleCamera} 
                                    disabled={!hasCameraPermission} 
                                    variant="outline" 
                                    className="h-16 w-16 rounded-2xl border-2 border-gray-200 bg-white"
                                >
                                    <SwitchCamera className="h-6 w-6 text-gray-600" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}
            <Button 
                variant="ghost" 
                onClick={() => setView(view === 'upload' ? 'camera' : 'upload')} 
                className="w-full font-black text-[10px] tracking-widest text-gray-400 hover:text-orange-500 uppercase py-1"
            >
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
  const [loadingMessage, setLoadingMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [autoScoreResult, setAutoScoreResult] = useState<{ score: number, details: string } | null>(null);
  const [bestMoveResult, setBestMoveResult] = useState<BestQwirkleOptionsOutput | null>(null);

  const [editedPlayerTiles, setEditedPlayerTiles] = useState<Tile[]>([]);
  const [editedBoardLines, setEditedBoardLines] = useState<BoardLine[]>([]);
  const [tilesWereEdited, setTilesWereEdited] = useState(false);

  const updatePlayerTile = (index: number, newTile: Tile) => {
    setEditedPlayerTiles(prev => prev.map((t, i) => i === index ? newTile : t));
    setTilesWereEdited(true);
  };

  const updateBoardLineTile = (lineIndex: number, tileIndex: number, newTile: Tile) => {
    setEditedBoardLines(prev => prev.map((line, li) =>
      li === lineIndex
        ? { ...line, tiles: line.tiles.map((t, ti) => ti === tileIndex ? newTile : t) }
        : line
    ));
    setTilesWereEdited(true);
  };

  const startProgressSimulation = (message: string) => {
    setLoadingMessage(message);
    setProgress(0);
    setIsLoading(true);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 90) currentProgress = 90;
      setProgress(currentProgress);
    }, 500);

    return () => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    };
  };

  const handleRecalculate = async () => {
    if (!boardPhotoDataUri || !tilesPhotoDataUri) return;

    const completeProgress = startProgressSimulation('RECALCULATING...');
    setTilesWereEdited(false);
    try {
      const result = await getBestQwirkleOptions({ boardPhotoDataUri, playerTilesPhotoDataUri: tilesPhotoDataUri });
      setBestMoveResult(result);
      setEditedPlayerTiles(result.playerTiles || []);
      setEditedBoardLines(result.boardLines || []);
      toast({ title: "Updated!", description: "New moves calculated." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Try again.", variant: "destructive" });
    } finally {
      completeProgress();
    }
  };

  const handleAutoScore = async () => {
    if (!boardPhotoDataUri) {
        toast({ title: "Upload board photo first!", variant: "destructive" });
        return;
    }
    const completeProgress = startProgressSimulation('CALCULATING...');
    setAutoScoreResult(null);
    try {
        const result = await automatedScoreCalculation({ photoDataUri: boardPhotoDataUri });
        setAutoScoreResult(result);
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Try again.", variant: "destructive" });
    } finally {
        completeProgress();
    }
  };

  const handleBestMove = async () => {
    if (!boardPhotoDataUri || !tilesPhotoDataUri) {
        toast({ title: "Upload both photos!", variant: "destructive" });
        return;
    }
    const completeProgress = startProgressSimulation('ANALYZING...');
    setBestMoveResult(null);
    setTilesWereEdited(false);
    try {
        const result = await getBestQwirkleOptions({ boardPhotoDataUri, playerTilesPhotoDataUri: tilesPhotoDataUri });
        setBestMoveResult(result);
        setEditedPlayerTiles(result.playerTiles || []);
        setEditedBoardLines(result.boardLines || []);
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Try again.", variant: "destructive" });
    } finally {
        completeProgress();
    }
  };

  const applyScore = (score: number, type: TurnScore['type']) => {
    onAddScore(score, type);
    handleOpenChange(false);
  };

  const resetState = () => {
    setBoardPhotoDataUri(null);
    setTilesPhotoDataUri(null);
    setAutoScoreResult(null);
    setBestMoveResult(null);
    setEditedPlayerTiles([]);
    setEditedBoardLines([]);
    setTilesWereEdited(false);
    setIsLoading(false);
    setProgress(0);
    setLoadingMessage('');
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        resetState();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-0 bg-[#F3F4F6] [&>button]:hidden">
        <div className="p-6 space-y-6">
            <DialogHeader className="relative">
                <button 
                    onClick={() => handleOpenChange(false)}
                    className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-gray-900 border border-gray-100 z-10"
                >
                    <X className="h-5 w-5" />
                </button>
                <DialogTitle className="font-headline font-black text-3xl flex items-center gap-3 text-purple-600 drop-shadow-sm">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-purple-100">
                        <WandSparkles className="text-purple-500 h-7 w-7" /> 
                    </div>
                    AI Helper
                </DialogTitle>
                <DialogDescription className="font-black text-[10px] tracking-[0.2em] text-gray-400 uppercase mt-2">
                    SMART ADVICE • EASY SCORING
                </DialogDescription>
            </DialogHeader>

            {isLoading && (
              <div className={cn("p-6 rounded-[2rem] space-y-4 animate-in zoom-in duration-300", depthStyles.raised)}>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <WandSparkles className="h-12 w-12 text-purple-500 animate-bounce" />
                    <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <p className="font-black text-purple-700 text-center uppercase tracking-widest text-xs">{loadingMessage}</p>
                  <div className="w-full space-y-2">
                    <div className={cn("h-4 w-full rounded-full overflow-hidden p-1", depthStyles.recessed)}>
                        <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Tabs defaultValue="best-move" onValueChange={() => resetState()} className="space-y-6">
                <TabsList className={cn("grid w-full grid-cols-2 p-1.5 rounded-[1.5rem] h-16", depthStyles.recessed)}>
                    <TabsTrigger value="best-move" className="rounded-[1.25rem] data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-600 font-black text-[11px] tracking-widest uppercase text-gray-400 transition-all">Best Move</TabsTrigger>
                    <TabsTrigger value="auto-score" className="rounded-[1.25rem] data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-orange-600 font-black text-[11px] tracking-widest uppercase text-gray-400 transition-all">Auto Score</TabsTrigger>
                </TabsList>
                
                <TabsContent value="best-move" className="space-y-6 m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {!bestMoveResult ? (
                    <div className="space-y-6">
                        <FileUpload onFileSelect={setBoardPhotoDataUri} label="Step 1: SNAP THE BOARD" />
                        <FileUpload onFileSelect={setTilesPhotoDataUri} label="Step 2: SNAP YOUR TILES" />
                        <Button 
                            onClick={handleBestMove} 
                            disabled={isLoading || !boardPhotoDataUri || !tilesPhotoDataUri} 
                            className={cn("w-full h-20 rounded-[1.5rem] text-xl font-black tracking-tight", depthStyles.buttonPurple)}
                        >
                            {isLoading ? <Loader2 className="mr-3 h-7 w-7 animate-spin" /> : <Sparkles className="mr-3 h-7 w-7" />}
                            FIND BEST MOVES
                        </Button>
                    </div>
                    ) : (
                        <div className="space-y-6 pb-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="font-headline font-black text-xl text-gray-800 tracking-tight">Top Suggestions</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setBestMoveResult(null)} className="font-bold text-gray-400 hover:text-purple-600">
                                        START OVER
                                    </Button>
                                </div>

                                {/* Board preview */}
                                {boardPhotoDataUri && (
                                    <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-xl rotate-1">
                                        <Image src={boardPhotoDataUri} alt="Board" width={400} height={300} className="w-full h-auto object-contain max-h-48" />
                                    </div>
                                )}

                                {/* Board Lines Correcting */}
                                <div className={cn("p-5 rounded-[2rem] space-y-4", depthStyles.raised)}>
                                    <div className="flex items-center justify-between">
                                        <p className="font-black text-purple-600 uppercase tracking-[0.15em] text-[10px]">CORRECT THE BOARD</p>
                                        <div className="h-[1px] flex-1 bg-purple-100 mx-4" />
                                    </div>
                                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {editedBoardLines.map((line, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 shrink-0">
                                                    {line.direction === 'horizontal' ? '→' : '↓'}
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {line.tiles.map((tile, j) => (
                                                        <EditableTileChip
                                                            key={j}
                                                            tile={tile}
                                                            size="small"
                                                            onUpdate={(newTile) => updateBoardLineTile(i, j, newTile)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Hand Correcting */}
                                <div className={cn("p-5 rounded-[2rem] space-y-4", depthStyles.raised)}>
                                    <div className="flex items-center justify-between">
                                        <p className="font-black text-purple-600 uppercase tracking-[0.15em] text-[10px]">CORRECT YOUR TILES</p>
                                        <div className="h-[1px] flex-1 bg-purple-100 mx-4" />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {editedPlayerTiles.map((tile, i) => (
                                            <EditableTileChip
                                                key={i}
                                                tile={tile}
                                                onUpdate={(newTile) => updatePlayerTile(i, newTile)}
                                            />
                                        ))}
                                    </div>
                                    {/* Toggle to show hand photo */}
                                    {tilesPhotoDataUri && (
                                        <details className="group mt-3">
                                            <summary className="text-[10px] font-black text-purple-400 uppercase tracking-widest cursor-pointer hover:text-purple-600 flex items-center gap-1">
                                                <span className="group-open:rotate-90 transition-transform">▶</span>
                                                View Hand Photo
                                            </summary>
                                            <div className="mt-2 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                                                <Image src={tilesPhotoDataUri} alt="Your tiles" width={300} height={200} className="w-full h-auto object-contain" />
                                            </div>
                                        </details>
                                    )}
                                </div>

                                {tilesWereEdited && (
                                    <Button
                                        onClick={handleRecalculate}
                                        disabled={isLoading}
                                        className={cn("w-full h-14 rounded-2xl text-lg font-black", depthStyles.buttonPrimary)}
                                    >
                                        REFRESH SUGGESTIONS
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {bestMoveResult.suggestions.map((move, index) => (
                                    <div key={index} className={cn("rounded-[2.5rem] overflow-hidden", depthStyles.raised)}>
                                        <div className="bg-purple-50/50 p-5 flex justify-between items-center border-b border-purple-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center font-black text-purple-600 shadow-sm">
                                                    {index+1}
                                                </div>
                                                <span className="font-black text-gray-800 tracking-tight uppercase text-sm">Best Option</span>
                                            </div>
                                            <div className="bg-white px-4 py-1.5 rounded-full border border-purple-200 shadow-sm font-black text-purple-600 text-lg">
                                                {move.score} <span className="text-[10px] text-purple-400">PTS</span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6 space-y-5">
                                            {/* Indicators */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className={cn("p-3 rounded-2xl", depthStyles.recessed)}>
                                                    <p className="text-[9px] font-black text-purple-400 uppercase mb-2 tracking-widest">Play These</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {move.tilesToPlay.map((tile, i) => (
                                                            <QwirkleShape 
                                                                key={i} 
                                                                shape={tile.shape} 
                                                                className="w-6 h-6" 
                                                                style={{ color: tile.color === 'purple' ? '#9333ea' : tile.color === 'orange' ? '#ea580c' : tile.color === 'yellow' ? '#ca8a04' : tile.color === 'green' ? '#16a34a' : tile.color === 'blue' ? '#2563eb' : '#dc2626' }} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className={cn("p-3 rounded-2xl flex flex-col justify-center", depthStyles.recessed)}>
                                                     <p className="text-[9px] font-black text-purple-400 uppercase mb-1 tracking-widest">Where</p>
                                                     <p className="text-[10px] font-bold text-gray-700 leading-tight line-clamp-2">{move.placement}</p>
                                                </div>
                                            </div>

                                            <p className="text-xs font-bold text-gray-500 leading-relaxed italic border-l-4 border-purple-100 pl-4">{move.reasoning}</p>
                                            
                                            <Button 
                                                className={cn("w-full h-14 rounded-2xl text-lg font-black", depthStyles.buttonPurple)}
                                                onClick={() => applyScore(move.score, 'helper')}
                                            >
                                                CHOOSE THIS
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="auto-score" className="space-y-6 m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {!autoScoreResult ? (
                    <div className="space-y-6">
                        <FileUpload onFileSelect={setBoardPhotoDataUri} label="Step 1: SNAP THE BOARD" />
                        <Button 
                            onClick={handleAutoScore} 
                            disabled={isLoading || !boardPhotoDataUri} 
                            className={cn("w-full h-20 rounded-[1.5rem] text-xl font-black tracking-tight", depthStyles.buttonPrimary)}
                        >
                            {isLoading ? <Loader2 className="mr-3 h-7 w-7 animate-spin" /> : <Sparkles className="mr-3 h-7 w-7" />}
                            CALCULATE SCORE
                        </Button>
                    </div>
                    ) : (
                        <div className="space-y-4">
                            <div className={cn("rounded-[2.5rem] overflow-hidden", depthStyles.raised)}>
                                <div className="bg-orange-50 p-8 text-center border-b border-orange-100">
                                    <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em] mb-2 block">YOUR SCORE</span>
                                    <div className="text-7xl font-black text-orange-600 tracking-tighter drop-shadow-sm">{autoScoreResult.score}</div>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 shrink-0">
                                            <ChevronRight className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-600 leading-relaxed italic">{autoScoreResult.details}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => setAutoScoreResult(null)} 
                                            className="flex-1 h-14 rounded-2xl font-black text-xs tracking-widest text-gray-400 border-2 border-gray-100 uppercase"
                                        >
                                            RETRY
                                        </Button>
                                        <Button 
                                            className={cn("flex-[2] h-14 rounded-2xl text-lg font-black", depthStyles.buttonPrimary)}
                                            onClick={() => applyScore(autoScoreResult.score, 'auto-score')}
                                        >
                                            ADD POINTS
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}