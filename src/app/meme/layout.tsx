"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, FabricImage, Textbox, FabricText, FabricObject } from "fabric";
import ImageSelector from "@/components/memes/ImageSelector";
import TextStyles from "@/components/memes/TextStyles";
import ImageControls from "@/components/memes/ImageControls";
import Stickers from "@/components/memes/Stickers";
import Header from "@/components/layout/Header";
import { Footer } from "@/sections/Footer";
import { useParams, useRouter } from "next/navigation";
import { loadCanvasObjects, getTemplateBySlug } from "@/utils/templateUtils";
import { v4 as uuidv4 } from "uuid";

interface LayoutProps {
  children: React.ReactNode;
}

interface MemeObject extends FabricObject {
  id?: string;
}

export default function MemeLayout({ children }: LayoutProps) {
  const canvasRef = useRef<Canvas | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [activeObject, setActiveObject] = useState<Textbox | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const backgroundImageRef = useRef<FabricImage | null>(null);

  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);
  const [templateObjects, setTemplateObjects] = useState<any[] | null>(null);
  const [hasCanvasObjects, setHasCanvasObjects] = useState(false);
  const [layers, setLayers] = useState<
    { id: string; type: string; object: any }[]
  >([]);

  const router = useRouter();
  const params = useParams();
  const currentSlug = (params as any)?.slug as string | undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- Initialize Canvas ---
  useEffect(() => {
    if (canvasRef.current) return;
    const canvasElement = document.getElementById("meme-canvas");
    if (!canvasElement) return;

    const canvas = new Canvas("meme-canvas", {
      width: 500,
      height: 500,
      backgroundColor: "#f8fafc",
      preserveObjectStacking: true,
    });
    canvasRef.current = canvas;
    setCanvasReady(true);

    const handleSelection = (e: any) => {
      const selected = e.selected;
      if (selected && selected.length > 0 && selected[0] instanceof Textbox) {
        setActiveObject(selected[0]);
      } else {
        setActiveObject(null);
      }
    };
    const handleClear = () => setActiveObject(null);

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleClear);

    return () => {
      canvas.dispose();
      canvasRef.current = null;
      setCanvasReady(false);
    };
  }, []);

  // --- Load Background ---
  const loadBackgroundImage = useCallback(
    (imageUrl: string, currentZoom: number, currentRotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !imageUrl || !canvasReady) return;

      setBackgroundImageLoaded(false);
      const canvasWrapper = document.getElementById("meme-canvas")?.parentElement;
      const canvasWidth = canvasWrapper?.clientWidth || 600;
      const canvasHeight = canvasWrapper?.clientHeight || 600;

      canvas.setWidth(canvasWidth);
      canvas.setHeight(canvasHeight);
      canvas.backgroundImage = undefined;
      canvas.backgroundColor = "#e5e7eb";
      canvas.renderAll();

      FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" })
        .then((img) => {
          const scaleX = canvasWidth / img.width!;
          const scaleY = canvasHeight / img.height!;
          const scale = Math.min(scaleX, scaleY) * currentZoom;

          img.set({
            scaleX: scale,
            scaleY: scale,
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            angle: currentRotation,
            selectable: false,
            originX: "center",
            originY: "center",
          });

          backgroundImageRef.current = img;
          canvas.backgroundImage = img;
          canvas.backgroundColor = "black";
          canvas.renderAll();

          setBackgroundImageLoaded(true);
        })
        .catch((error) => {
          console.error("Failed to load Fabric background image:", error);
          setBackgroundImageLoaded(false);
        });
    },
    [canvasReady]
  );

  useEffect(() => {
    if (selectedImage) {
      loadBackgroundImage(selectedImage, zoom, rotation);
    }
  }, [selectedImage, zoom, rotation, loadBackgroundImage]);

  // --- Template Loading ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!currentSlug || !canvasReady || !canvas) return;

    const templateData = getTemplateBySlug(currentSlug);
    if (templateData) {
      canvas.getObjects().forEach((obj) => {
        if (obj !== canvas.backgroundImage) canvas.remove(obj);
      });
      canvas.renderAll();

      setSelectedImage(templateData.previewUrl);
      setSelectedImageId(templateData.id);
      setTemplateObjects(templateData.config?.objects || null);
    }
  }, [currentSlug, canvasReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !templateObjects || !backgroundImageLoaded) return;
    loadCanvasObjects(canvas, templateObjects);
    setTemplateObjects(null);
    setBackgroundImageLoaded(false);
  }, [templateObjects, backgroundImageLoaded]);

  // --- Layer Utilities (Fabric v6-safe) ---
  const enforceLayerOrder = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const texts = canvas.getObjects().filter((o) => o.type === "textbox");
    const others = canvas
      .getObjects()
      .filter((o) => o.type !== "textbox" && o !== canvas.backgroundImage);

    others.forEach((o) => canvas.moveObjectTo(o, 1));
    texts.forEach((o) => canvas.bringObjectToFront(o));
    canvas.renderAll();
  };

  const updateCanvasObjectsState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects().filter((obj) => obj !== canvas.backgroundImage);
    setHasCanvasObjects(objects.length > 0);
  };

  // --- Add Textbox ---
  const addTextBox = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const text = new Textbox("New Text", {
      left: 250,
      top: 250,
      originX: "center",
      originY: "center",
      width: 200,
      fontSize: 28,
      fill: "#000",
      fontFamily: "Arial",
      editable: true,
      lockUniScaling: true,
    });

    text.set("id", uuidv4());
    text.on("scaling", () => (text.scaleY = text.scaleX));
    canvas.add(text);
    canvas.bringObjectToFront(text);

    setLayers((prev) => [...prev, { id: text.get("id") as string, type: "textbox", object: text }]);
    setActiveObject(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();

    enforceLayerOrder();
    updateCanvasObjectsState();
  };

  // --- Update and Delete Text ---
  const updateActiveText = (updates: Partial<Textbox>) => {
    if (activeObject && canvasRef.current) {
      activeObject.set(updates);
      canvasRef.current.renderAll();
    }
  };

  const deleteActiveText = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeObject) return;
    canvas.remove(activeObject);
    setLayers((prev) => prev.filter((l) => l.id !== activeObject.get("id")));
    setActiveObject(null);
    canvas.renderAll();
    updateCanvasObjectsState();
  };

  // --- Add Sticker (Text or Image) ---
  const addSticker = (sticker: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const stickerText = new FabricText(sticker, {
      left: Math.random() * 300 + 100,
      top: Math.random() * 300 + 100,
      fontSize: 40,
      selectable: true,
      hasControls: true,
    });

    stickerText.set("id", uuidv4());

    canvas.add(stickerText);
    canvas.bringObjectToFront(stickerText);
    setLayers((prev) => [...prev, { id: stickerText.get("id") as string, type: "sticker", object: stickerText }]);
    canvas.setActiveObject(stickerText);
    canvas.requestRenderAll();
    enforceLayerOrder();
    updateCanvasObjectsState();
  };

  const addImageSticker = (imageUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" }).then((img) => {
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      const maxStickerWidth = 150;
      const maxStickerHeight = 150;
      const scale = Math.min(
        maxStickerWidth / img.width!,
        maxStickerHeight / img.height!,
        1
      );

      img.set({
        scaleX: scale,
        scaleY: scale,
        left:
          Math.random() * (canvasWidth - img.width! * scale) +
          (img.width! * scale) / 2,
        top:
          Math.random() * (canvasHeight - img.height! * scale) +
          (img.height! * scale) / 2,
        selectable: true,
        hasControls: true,
        originX: "center",
        originY: "center",
      });

      img.set("id", uuidv4());

      canvas.add(img);
      canvas.bringObjectToFront(img);
      setLayers((prev) => [...prev, { id: img.get("id") as string, type: "sticker-image", object: img }]);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
      enforceLayerOrder();
      updateCanvasObjectsState();
    });
  };

  // --- Reset Canvas ---
  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getObjects().forEach((obj) => {
      if (obj !== canvas.backgroundImage) canvas.remove(obj);
    });
    canvas.renderAll();
    setActiveObject(null);
    setHasCanvasObjects(false);
    setLayers([]);
  };

  // --- Template & Image Handlers ---
  const handleImageSelect = (imageUrl: string, imageId?: string) => {
    setSelectedImage(imageUrl);
    setSelectedImageId(imageId || null);
    setTemplateObjects(null);
  };

  const handleTemplateSelect = (template: any) => {
    if (template.slug && template.slug !== currentSlug) {
      router.push(`/meme/${template.slug}`);
      return;
    }
    if (template.previewUrl) {
      setSelectedImage(template.previewUrl);
      setSelectedImageId(template.id);
    }
    setTemplateObjects(template.config?.objects || null);
  };

  const resetImage = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <>
      <div className="h-screen flex flex-col bg-gray-50">
        <Header
          canvasRef={canvasRef}
          onReset={resetCanvas}
          backgroundImageId={selectedImageId}
        />

        <div className="flex flex-1 flex-col md:flex-row relative overflow-hidden items-stretch">
          {/* Left Sidebar */}
          <div className="order-1 md:order-none z-10 w-full md:w-88 border-b md:border-b-0 md:border-r border-gray-200 bg-white md:overflow-y-auto">
            <ImageSelector
              onSelect={handleImageSelect}
              onTemplateSelect={handleTemplateSelect}
              selectedImage={selectedImage}
            />
          </div>

          {/* Canvas Area */}
          <div className="order-2 md:order-none z-0 flex justify-center items-center bg-gray-50 relative overflow-hidden p-4 flex-1 min-h-0">
            <div
              className="relative bg-white rounded-lg shadow-lg p-1 border-2 border-black flex-shrink-0 
              w-[90vw] sm:w-[80vw] md:w-[60vw] lg:w-[512px] 
              aspect-square 
              max-w-[600px] max-h-[600px]"
            >
              <canvas
                id="meme-canvas"
                width={600}
                height={600}
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>

            {!hasCanvasObjects && !selectedImage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 pointer-events-none p-4 z-20 bg-gray-50/80">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-3xl sm:text-4xl md:text-5xl">🖼️</span>
                  </div>
                  <p className="text-center text-sm sm:text-base md:text-lg max-w-xs sm:max-w-md">
                    Select a template from the left to get started
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="order-3 md:order-none z-10 w-full md:w-88 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 p-4 md:overflow-y-auto">
            <div className="flex flex-col gap-4 pb-8">
              <TextStyles
                activeTextObject={activeObject}
                allTextObjects={layers.filter((l) => l.type === "textbox")}
                onTextStyleChange={updateActiveText}
                onAddText={addTextBox}
                onDeleteText={deleteActiveText}
              />

              {selectedImage && (
                <ImageControls
                  zoom={zoom}
                  rotation={rotation}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onResetImage={resetImage}
                />
              )}

              <Stickers
                onStickerSelect={addSticker}
                onImageUpload={addImageSticker}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
      {children}
    </>
  );
}
