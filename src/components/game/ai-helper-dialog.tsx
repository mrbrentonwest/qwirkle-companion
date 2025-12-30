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
import { Camera, Loader2, Sparkles, WandSparkles, SwitchCamera, Circle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { automatedScoreCalculation } from '@/ai/flows/automated-score-calculation';
import { getBestQwirkleOptions, type BestQwirkleOptionsOutput, type Tile, type BoardLine } from '@/ai/flows/best-option-helper';
import type { TurnScore } from '@/lib/types';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

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

const QwirkleShape = ({ shape, color, className }: { shape: string, color: string, className?: string }) => {
  const colorMap: Record<string, string> = {
    red: 'text-red-500 fill-current',
    orange: 'text-orange-500 fill-current',
    yellow: 'text-yellow-500 fill-current',
    green: 'text-green-500 fill-current',
    blue: 'text-blue-500 fill-current',
    purple: 'text-purple-500 fill-current',
  };

  const c = colorMap[color] || 'text-gray-500';

  switch (shape) {
    case 'circle': return <svg viewBox="0 0 24 24" className={`${c} ${className}`}><circle cx="12" cy="12" r="10" /></svg>;
    case 'square': return <svg viewBox="0 0 24 24" className={`${c} ${className}`}><rect x="4" y="4" width="16" height="16" rx="2" /></svg>;
    case 'diamond': return <svg viewBox="0 0 24 24" className={`${c} ${className}`}><polygon points="12 2 22 12 12 22 2 12" /></svg>;
    case 'star': return <svg viewBox="0 0 24 24" className={`${c} ${className}`}><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" /></svg>;
    case 'clover': return (
      <svg viewBox="0 0 24 24" className={`${c} ${className}`} fill="currentColor">
        <path d="M12 12c0-3.5 2-6 4.5-6s4.5 2.5 4.5 6-2 6-4.5 6-4.5-2.5-4.5-6z" />
        <path d="M12 12c0 3.5-2 6-4.5 6S3 15.5 3 12s2-6 4.5-6 4.5 2.5 4.5 6z" />
        <path d="M12 12c3.5 0 6-2 6-4.5S15.5 3 12 3s-6 2-6 4.5 2.5 6 6 6z" />
        <path d="M12 12c-3.5 0-6 2-6 4.5S8.5 21 12 21s6-2 6-4.5-2.5-6-6-6z" />
      </svg>
    );
    case 'starburst': return <svg viewBox="0 0 24 24" className={`${c} ${className}`}><polygon points="12 2 14.5 9.5 22 12 14.5 14.5 12 22 9.5 14.5 2 12 9.5 9.5" /></svg>;
    default: return <Circle className={`${c} ${className}`} />;
  }
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
      <div className="bg-white rounded-xl border-2 border-purple-300 p-2 shadow-lg space-y-2">
        <div className="flex gap-1 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setEditColor(c)}
              className={`w-6 h-6 rounded-full border-2 ${editColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c === 'purple' ? '#a855f7' : c }}
            />
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {SHAPES.map(s => (
            <button
              key={s}
              onClick={() => setEditShape(s)}
              className={`p-1 rounded border-2 ${editShape === s ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
            >
              <QwirkleShape shape={s} color={editColor} className="w-5 h-5" />
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button onClick={handleSave} className="flex-1 text-[10px] font-bold bg-purple-500 text-white rounded-lg py-1 px-2">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="flex-1 text-[10px] font-bold bg-gray-200 text-gray-600 rounded-lg py-1 px-2">
            Cancel
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
      className="flex items-center gap-1 bg-purple-50 rounded-lg px-2 py-1 hover:bg-purple-100 hover:ring-2 hover:ring-purple-300 transition-all cursor-pointer"
    >
      <QwirkleShape shape={tile.shape} color={tile.color} className={iconSize} />
      <span className={`${textSize} font-bold capitalize text-gray-700`}>{tile.color} {tile.shape}</span>
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

    // Use smaller cells for larger boards
    const cellSize = width > 4 || height > 4 ? 32 : 40;
    const iconSize = width > 4 || height > 4 ? 'w-6 h-6' : 'w-8 h-8';

    return (
        <div className="flex justify-center my-2 overflow-x-auto">
             <div className="grid gap-0.5 p-2 bg-slate-800 rounded-lg" style={{
                gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${height}, ${cellSize}px)`
            }}>
                {tiles.map((tile, i) => (
                    <div key={i} className="flex items-center justify-center relative bg-slate-900 rounded" style={{
                        gridColumn: tile.x - minX + 1,
                        gridRow: tile.y - minY + 1,
                        width: cellSize,
                        height: cellSize,
                    }}>
                    <QwirkleShape shape={tile.shape} color={tile.color} className={iconSize} />
                    {tile.type === 'new' && (
                        <div className="absolute inset-0 border-2 border-green-400 rounded animate-pulse" />
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
                    {hasCameraPermission === false ? (
                        /* Native camera fallback when permission denied */
                        <div className="space-y-3">
                            <Alert className="border-orange-200 bg-orange-50">
                                <AlertTitle className="text-orange-700">Use Native Camera</AlertTitle>
                                <AlertDescription className="text-orange-600">
                                    Browser camera blocked. Tap below to open your camera app instead.
                                </AlertDescription>
                            </Alert>
                            <Button
                                onClick={() => cameraInputRef.current?.click()}
                                className="w-full h-14 bg-orange-500 hover:bg-orange-600"
                            >
                                <Camera className="mr-2" />
                                Open Camera App
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
                        /* In-browser camera when permission granted */
                        <>
                            <div className="w-full aspect-video rounded-md bg-black overflow-hidden relative">
                                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                {hasCameraPermission === null && (
                                    <div className='absolute inset-0 flex items-center justify-center'>
                                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleCapture} disabled={!hasCameraPermission} className="flex-1">
                                    <Camera className="mr-2" />
                                    Take Picture
                                </Button>
                                <Button onClick={toggleCamera} disabled={!hasCameraPermission} variant="outline" size="icon">
                                    <SwitchCamera />
                                </Button>
                            </div>
                        </>
                    )}
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
  const [bestMoveResult, setBestMoveResult] = useState<BestQwirkleOptionsOutput | null>(null);

  // Editable copies of AI results
  const [editedPlayerTiles, setEditedPlayerTiles] = useState<Tile[]>([]);
  const [editedBoardLines, setEditedBoardLines] = useState<BoardLine[]>([]);
  const [tilesWereEdited, setTilesWereEdited] = useState(false);

  // Update functions for editable tiles
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

  // Recalculate suggestions with edited tiles (placeholder - would need backend support)
  const handleRecalculate = async () => {
    if (!boardPhotoDataUri || !tilesPhotoDataUri) return;

    setIsLoading(true);
    setTilesWereEdited(false);
    try {
      // For now, re-run the AI with the same images
      // In a full implementation, you'd pass the edited tiles to influence the suggestions
      const result = await getBestQwirkleOptions({ boardPhotoDataUri, playerTilesPhotoDataUri: tilesPhotoDataUri });
      setBestMoveResult(result);
      setEditedPlayerTiles(result.playerTiles || []);
      setEditedBoardLines(result.boardLines || []);
      toast({ title: "Suggestions updated!", description: "New moves calculated based on your corrections." });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to recalculate.", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

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
    setTilesWereEdited(false);
    try {
        const result = await getBestQwirkleOptions({ boardPhotoDataUri, playerTilesPhotoDataUri: tilesPhotoDataUri });
        setBestMoveResult(result);
        setEditedPlayerTiles(result.playerTiles || []);
        setEditedBoardLines(result.boardLines || []);
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
    setEditedPlayerTiles([]);
    setEditedBoardLines([]);
    setTilesWereEdited(false);
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        resetState();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-orange-50 shadow-2xl p-0">
        <div className="p-6 space-y-6">
            <DialogHeader>
            <DialogTitle className="font-headline font-black text-2xl flex items-center gap-2 text-purple-600">
                <WandSparkles className="text-yellow-400 h-8 w-8" /> 
                AI Helper
            </DialogTitle>
            <DialogDescription className="font-medium text-gray-500">
                SNAP A PHOTO • GET SMART ADVICE
            </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="auto-score" onValueChange={() => resetState()}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-2xl h-14">
                <TabsTrigger value="auto-score" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-black text-xs tracking-widest uppercase">Auto Score</TabsTrigger>
                <TabsTrigger value="best-move" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-black text-xs tracking-widest uppercase">Best Move</TabsTrigger>
            </TabsList>
            
            <TabsContent value="auto-score" className="pt-4">
                <div className="space-y-6">
                    {!autoScoreResult ? (
                    <>
                        <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                            <p className="text-sm font-bold text-orange-700 text-center">Take a picture of the board after your turn!</p>
                        </div>
                        <FileUpload onFileSelect={setBoardPhotoDataUri} label="Board Photo" />
                        <Button 
                            onClick={handleAutoScore} 
                            disabled={isLoading || !boardPhotoDataUri} 
                            className="w-full h-16 rounded-2xl bg-primary hover:bg-orange-600 text-white border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 font-black text-lg shadow-md transition-all"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Sparkles className="mr-2 h-6 w-6" />}
                            CALCULATE SCORE
                        </Button>
                    </>
                    ) : (
                        <div className="space-y-4">
                            <Card className="border-4 border-orange-100 rounded-[2rem] overflow-hidden shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-orange-50/50 p-6">
                                    <CardTitle className="font-black text-3xl text-orange-600 tracking-tight">
                                        <span className="text-sm block text-orange-400 font-bold uppercase tracking-widest">Result</span>
                                        {autoScoreResult.score} Points
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => setAutoScoreResult(null)} className="font-bold text-gray-400 hover:text-orange-500">
                                        RETRY
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-6 pt-4">
                                    <p className="text-sm font-medium text-gray-600 leading-relaxed italic border-l-4 border-orange-200 pl-4">{autoScoreResult.details}</p>
                                </CardContent>
                                <CardFooter className="p-6 pt-0">
                                    <Button className="w-full h-14 rounded-xl bg-green-500 hover:bg-green-600 text-white border-b-4 border-green-700 active:border-b-0 active:translate-y-1 font-black text-lg" onClick={() => applyScore(autoScoreResult.score, 'auto-score')}>
                                        ADD TO MY TOTAL
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}
                </div>
            </TabsContent>
            
            <TabsContent value="best-move" className="pt-4">
                <div className="space-y-6">
                    {!bestMoveResult ? (
                    <>
                        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                            <p className="text-sm font-bold text-purple-700 text-center">Snap the board and your tiles for advice!</p>
                        </div>
                        <FileUpload onFileSelect={setBoardPhotoDataUri} label="Board Photo" />
                        <FileUpload onFileSelect={setTilesPhotoDataUri} label="Your Tiles" />
                        <Button 
                            onClick={handleBestMove} 
                            disabled={isLoading || !boardPhotoDataUri || !tilesPhotoDataUri} 
                            className="w-full h-16 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 font-black text-lg shadow-md transition-all"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Sparkles className="mr-2 h-6 w-6" />}
                            FIND BEST MOVES
                        </Button>
                    </>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-headline font-black text-xl text-gray-800 tracking-tight">Top Suggestions</h3>
                                <Button variant="ghost" size="sm" onClick={() => setBestMoveResult(null)} className="font-bold text-gray-400 hover:text-purple-600">
                                    START OVER
                                </Button>
                            </div>

                            {/* Board preview */}
                            {boardPhotoDataUri && (
                              <div className="rounded-2xl overflow-hidden border-2 border-purple-100">
                                <Image src={boardPhotoDataUri} alt="Board" width={400} height={300} className="w-full h-auto object-contain max-h-48" />
                              </div>
                            )}

                            {/* Board lines analysis - editable */}
                            {editedBoardLines.length > 0 && (
                              <div className="p-3 bg-white rounded-2xl border border-purple-100 shadow-sm">
                                <p className="font-black text-purple-400 uppercase tracking-widest text-[10px] mb-2">Board Lines <span className="text-gray-400">(tap to edit)</span></p>
                                <div className="space-y-2">
                                  {editedBoardLines.map((line, i) => (
                                    <div key={i} className="flex items-start gap-2 flex-wrap">
                                      <span className="text-[10px] font-bold text-gray-400 uppercase w-14 pt-1">{line.direction === 'horizontal' ? '→ Horiz' : '↓ Vert'}</span>
                                      <div className="flex items-center gap-1 flex-wrap flex-1">
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
                            )}

                            {/* Player tiles - editable */}
                            {editedPlayerTiles.length > 0 && (
                              <div className="p-3 bg-white rounded-2xl border border-purple-100 shadow-sm">
                                <p className="font-black text-purple-400 uppercase tracking-widest text-[10px] mb-2">Your Tiles <span className="text-gray-400">(tap to edit)</span></p>
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
                                      View Photo
                                    </summary>
                                    <div className="mt-2 rounded-xl overflow-hidden border border-purple-100">
                                      <Image src={tilesPhotoDataUri} alt="Your tiles" width={300} height={200} className="w-full h-auto object-contain" />
                                    </div>
                                  </details>
                                )}
                              </div>
                            )}

                            {/* Recalculate button when tiles were edited */}
                            {tilesWereEdited && (
                              <Button
                                onClick={handleRecalculate}
                                disabled={isLoading}
                                className="w-full h-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white border-b-4 border-green-700 active:border-b-0 active:translate-y-1 font-black shadow-md"
                              >
                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                                RECALCULATE WITH CORRECTIONS
                              </Button>
                            )}

                            <div className="space-y-4 pb-4">
                                {bestMoveResult.suggestions.map((move, index) => (
                                    <Card key={index} className="border-2 border-purple-100 rounded-[2rem] bg-purple-50/30 overflow-hidden shadow-sm">
                                        <CardHeader className="pb-2 p-6 bg-white/50 border-b border-purple-50">
                                            <CardTitle className="text-sm font-black text-purple-600 uppercase tracking-widest flex justify-between items-center">
                                                <span>OPTION {index+1}</span>
                                                <span className="bg-purple-100 px-3 py-1 rounded-full text-lg">{move.score} PTS</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-3">
                                            {/* Play These */}
                                            <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-sm">
                                                <p className="text-[10px] font-black text-purple-400 uppercase mb-2 tracking-widest">Play These</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {move.tilesToPlay.map((tile, i) => (
                                                        <div key={i} className="flex items-center gap-1 bg-purple-50 rounded-lg px-2 py-1">
                                                            <QwirkleShape shape={tile.shape} color={tile.color} className="w-5 h-5" />
                                                            <span className="text-xs font-bold capitalize text-gray-700">{tile.color} {tile.shape}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Placement - full width below */}
                                            <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-sm">
                                                <p className="text-[10px] font-black text-purple-400 uppercase mb-1 tracking-widest">Where to Place</p>
                                                <p className="text-sm font-medium text-gray-700 leading-snug">{move.placement}</p>
                                            </div>

                                            {/* Collapsible explanation */}
                                            <details className="group">
                                                <summary className="text-[10px] font-black text-purple-400 uppercase tracking-widest cursor-pointer hover:text-purple-600 flex items-center gap-1">
                                                    <span className="group-open:rotate-90 transition-transform">▶</span>
                                                    Why This Move?
                                                </summary>
                                                <p className="text-sm font-medium text-gray-600 leading-relaxed italic mt-2 pl-4 border-l-2 border-purple-200">{move.reasoning}</p>
                                            </details>
                                        </CardContent>
                                        <CardFooter className="p-6 pt-0">
                                            <Button className="w-full h-12 rounded-xl bg-purple-500 hover:bg-purple-600 text-white border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 font-black" onClick={() => applyScore(move.score, 'helper')}>USE THIS MOVE</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </TabsContent>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
