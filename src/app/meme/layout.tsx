"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, FabricImage, Textbox, FabricText, FabricObject, Shadow } from "fabric";
import ImageSelector from "@/components/memes/ImageSelector";
import TextStyles from "@/components/memes/TextStyles";
import ImageControls from "@/components/memes/ImageControls";
import Stickers from "@/components/memes/Stickers";
import Header from "@/components/memes/Header";
import { Footer } from "@/sections/Footer";
import { useParams, useRouter } from "next/navigation";
import { useGetTemplateByIdOrSlugQuery } from "@/redux/services/template";
import { v4 as uuidv4 } from "uuid";
import { useAppDispatch } from "@/redux/store";
import { setTemplateId } from "@/redux/slices/template";
import { MemeCarousel } from "@/components/memes/MemeCarousel";

interface LayoutProps {
  children: React.ReactNode;
}

interface MemeObject extends FabricObject {
  id?: string;
}
type LayerItem = { id: string; type: string; object: FabricObject };

const getCanvasLayers = (canvas: Canvas): LayerItem[] => {
  return canvas.getObjects()
    .filter((obj): obj is FabricObject & { id: string } => {
      return 'id' in obj && typeof (obj as any).id === 'string' && (obj as any).id !== 'background-image';
    })
    .map((obj) => ({
      id: (obj as any).id,
      type: obj.type || 'unknown',
      object: obj,
    }));
};

export default function MemeLayout({ children }: LayoutProps) {
  const canvasRef = useRef<Canvas | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [activeObject, setActiveObject] = useState<Textbox | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const backgroundImageRef = useRef<FabricImage | null>(null);
  const [firstVisit, setFirstVisit] = useState(true);
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [hasCanvasObjects, setHasCanvasObjects] = useState(false);
  const [layers, setLayers] = useState<{ id: string; type: string; object: any }[]>([]);

  const router = useRouter();
  const params = useParams();
  const currentSlug = (params as any)?.slug as string;
  const dispatch = useAppDispatch();
  const { data: templateData, isLoading, error } = useGetTemplateByIdOrSlugQuery(currentSlug, {
    skip: !currentSlug,
  });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

    canvas.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj) return;
      keepObjectInBounds(obj, canvas);
    });
    
    canvas.on("object:scaling", (e) => {
      const obj = e.target;
      if (!obj) return;
      obj.scaleY = obj.scaleX; 
      const scaleClamped = keepObjectInBounds(obj, canvas);
      if (scaleClamped) {
        obj.setControlsVisibility({
          mt: false, mb: false, ml: false, mr: false, 
          tr: false, tl: false, br: false, bl: false
      });
        obj.hasControls = false;
        } else {
          obj.hasControls = true;
          obj.setControlsVisibility({
            mt: true, mb: true, ml: true, mr: true, 
            tr: true, tl: true, br: true, bl: true
          });
        }
    });
  
    return () => {
      canvas.dispose();
      canvasRef.current = null;
      setCanvasReady(false);
    };
  }, []);

  const loadBackgroundImage = useCallback(
    (imageUrl: string, currentZoom: number, currentRotation: number, config?: any) => {
      const canvas = canvasRef.current;
      if (!canvas || !imageUrl || !canvasReady) return;

      setBackgroundImageLoaded(false);

      const canvasWrapper = document.getElementById("meme-canvas")?.parentElement;
      const canvasWidth = canvasWrapper?.clientWidth || 600;
      const canvasHeight = canvasWrapper?.clientHeight || 600;

      canvas.setWidth(canvasWidth);
      canvas.setHeight(canvasHeight);
      canvas.backgroundImage = undefined;
      canvas.backgroundColor = config?.background || "#e5e7eb";

      canvas.getObjects().forEach((obj) => {
        if (obj !== backgroundImageRef.current) canvas.remove(obj);
      });

      setLayers([]);
      setActiveObject(null);

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
          canvas.backgroundColor = config?.background || "black";

          (config?.objects || []).forEach((obj: any) => {
            if (obj.type === "Textbox") {
              const defaultProps = {
                text: obj.text || "Text",
                left: obj.left || canvasWidth / 2,
                top: obj.top || canvasHeight / 2,
                width: obj.width || 200,
                fontSize: obj.fontSize || 40,
                fontWeight: obj.fontWeight || "bold",
                fontFamily: obj.fontFamily || "Impact",
                fill: obj.fill || "#FFD700",
                stroke: obj.stroke || "#FF0000",
                strokeWidth: obj.strokeWidth || 1,
                textAlign: obj.textAlign || "center",
                shadow: obj.shadow
                  ? new Shadow(obj.shadow)
                  : new Shadow({ color: "rgba(0,0,0,1)", blur: 2, offsetX: 2, offsetY: 2 }),
                editable: true,
                lockUniScaling: true,
                originX: "center",
                originY: "center",
              };

              const textContent = obj.text;
              const { type, text, ...savedProps } = obj;
              const finalProps = { ...defaultProps, ...savedProps };
              const textObject = new Textbox(textContent || "Text", finalProps);

              textObject.set("id", uuidv4());

              canvas.add(textObject);
              canvas.bringObjectToFront(textObject);
            }
          });

          const finalLayers = getCanvasLayers(canvas);
          setLayers(finalLayers);

          if (finalLayers.length > 0) {
            const firstTextbox = finalLayers.find((l) => l.type === "textbox")?.object as Textbox;
            if (firstTextbox) {
              setActiveObject(firstTextbox);
              canvas.setActiveObject(firstTextbox);
            }
          }

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

  const keepObjectInBounds = (obj: FabricObject, canvas: Canvas): boolean => {
      const el = canvas.getElement();
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      
      let scaleClamped = false;
      const boundBeforeScaleCheck = obj.getBoundingRect(); 
      if (boundBeforeScaleCheck.width > cw || boundBeforeScaleCheck.height > ch) {
          const maxScaleX = cw / (obj.width || 1);
          const maxScaleY = ch / (obj.height || 1);
          const maxScale = Math.min(maxScaleX, maxScaleY); 
  
          if (obj.scaleX > maxScale) {
              obj.scaleX = maxScale;
              obj.scaleY = maxScale;
              scaleClamped = true;
          }
      }
      if (scaleClamped) {
          obj.setControlsVisibility({
              mt: false, mb: false, ml: false, mr: false, 
              tr: false, tl: false, br: false, bl: false,
              mtr: false 
          });
          obj.hasControls = false; 
      } else {
          obj.hasControls = true;
          obj.setControlsVisibility({
              mt: true, mb: true, ml: true, mr: true, 
              tr: true, tl: true, br: true, bl: true,
              mtr: true 
          });
      }
      const objHalfWidth = obj.getScaledWidth() / 2;
      const objHalfHeight = obj.getScaledHeight() / 2;
      const maxLeft = cw - objHalfWidth; 
      const minLeft = objHalfWidth;
      const maxTop = ch - objHalfHeight;
      const minTop = objHalfHeight;
      
      const currentLeft = obj.left || 0;
      const currentTop = obj.top || 0;
  
      const newLeft = Math.max(minLeft, Math.min(maxLeft, currentLeft));
      const newTop = Math.max(minTop, Math.min(maxTop, currentTop));
  
      const positionClamped = (newLeft !== currentLeft || newTop !== currentTop);
      if (positionClamped) {
          obj.set({
              left: newLeft,
              top: newTop,
          });
      }
      if (positionClamped || scaleClamped) {
          obj.setCoords();
          canvas.requestRenderAll();
      }
      return scaleClamped;
  };

  useEffect(() => {
    if (selectedImage) {
      loadBackgroundImage(selectedImage, zoom, rotation);
    }
  }, [selectedImage, zoom, rotation, loadBackgroundImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!currentSlug || !canvasReady || !canvas || !templateData) return;
    setSelectedImage(templateData.data.config.backgroundImage.src);
    setSelectedImageId(templateData.data.id);
    setSelectedTemplate(templateData.data.config || null);
  }, [templateData, canvasReady, currentSlug]);

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

  const addTextBox = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const text = new Textbox("New Text", {
      left: 250,
      top: 250,
      originX: "center",
      originY: "center",
      width: 200,
      fontSize: 50,
      fontWeight: "bold",
      fontFamily: "Impact",
      fill: "#FFD700",
      stroke: "#FF0000",
      strokeWidth: 1,
      shadow: new Shadow({
        color: "rgba(0, 0, 0, 1)",
        blur: 2,
        offsetX: 2,
        offsetY: 2,
        affectStroke: true,
        nonScaling: true,
      }),
      editable: true,
      lockUniScaling: true,
      textAlign: "center",
    });

    text.set("id", uuidv4());
    text.on("scaling", () => {
      text.scaleY = text.scaleX;
    });

    canvas.add(text);
    canvas.bringObjectToFront(text);

    setLayers(getCanvasLayers(canvas));

    setActiveObject(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();

    enforceLayerOrder();
    updateCanvasObjectsState();
  };

  const updateActiveText = (updates: Partial<Textbox>) => {
    if (activeObject && canvasRef.current) {
      activeObject.set(updates);
      canvasRef.current.renderAll();

      setLayers(getCanvasLayers(canvasRef.current));
    }
  };

  const deleteActiveText = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeObject) return;
    canvas.remove(activeObject);

    setLayers(getCanvasLayers(canvas));

    setActiveObject(null);
    canvas.renderAll();
    updateCanvasObjectsState();
  };

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

    setLayers(getCanvasLayers(canvas));

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
      const scale = Math.min(maxStickerWidth / img.width!, maxStickerHeight / img.height!, 1);

      img.set({
        scaleX: scale,
        scaleY: scale,
        left:
          Math.random() * (canvasWidth - img.width! * scale) + (img.width! * scale) / 2,
        top:
          Math.random() * (canvasHeight - img.height! * scale) + (img.height! * scale) / 2,
        selectable: true,
        hasControls: true,
        originX: "center",
        originY: "center",
      });

      img.set("id", uuidv4());

      canvas.add(img);
      canvas.bringObjectToFront(img);

      setLayers(getCanvasLayers(canvas));

      canvas.setActiveObject(img);
      canvas.requestRenderAll();
      enforceLayerOrder();
      updateCanvasObjectsState();
    });
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas reference is missing!");
      return;
    }
    canvas.getObjects().forEach((obj) => {
      if (obj !== canvas.backgroundImage) canvas.remove(obj);
    });
    canvas.renderAll();
    setActiveObject(null);
    setHasCanvasObjects(false);
    setLayers([]);
  };

  const handleImageSelect = (imageUrl: string, imageId?: string) => {
    setSelectedImage(imageUrl);
    setSelectedImageId(imageId || null);
  };

  const handleTemplateSelect = (template: any) => {
    dispatch(setTemplateId(template.id));
    if (template.previewUrl) {
      setSelectedImage(template.previewUrl);
      setSelectedImageId(template.id);
    }
    setFirstVisit(false);
    setSelectedTemplate(template?.config ? { ...template.config } : null);
    if (template.slug && template.slug !== currentSlug) {
      router.push(`/meme/${template.slug}`);
      return;
    }
  };

  useEffect(() => {
    if (!selectedImage || !selectedTemplate) return;
    loadBackgroundImage(selectedImage, zoom, rotation, selectedTemplate);
  }, [selectedImage, selectedTemplate, zoom, rotation, loadBackgroundImage]);

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
          templateId={templateData?.data?.id}
        />

        <div className="flex flex-1 flex-col md:flex-row relative overflow-hidden items-stretch">
          <div className="order-1 md:order-none z-10 w-full md:w-88 border-b md:border-b-0 md:border-r border-gray-200 bg-white md:overflow-y-auto">
            <ImageSelector
              onSelect={handleImageSelect}
              onTemplateSelect={(template) => handleTemplateSelect(template)}
              selectedImage={selectedImage}
              onBeforeSelect={resetCanvas}
            />
          </div>

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

            {!hasCanvasObjects &&
              !selectedImage &&
              !backgroundImageLoaded &&
              firstVisit && (
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

          <div className="order-3 md:order-none z-10 w-full md:w-88 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 p-4 md:overflow-y-auto">
            <div className="flex flex-col gap-4 pb-8">
              <TextStyles
                activeTextObject={activeObject}
                allTextObjects={layers.filter((l) => l.type === "textbox")}
                onTextStyleChange={updateActiveText}
                onAddText={addTextBox}
                onDeleteText={deleteActiveText}
              />

              <ImageControls
                zoom={zoom}
                rotation={rotation}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onResetImage={resetImage}
              />

              <Stickers
                onStickerSelect={addSticker}
                onImageUpload={addImageSticker}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center bg-gray-50 py-12">
        {templateData?.data?.id && (
          <div className="w-full px-4">
            <MemeCarousel
                templateIds={[templateData.data.id]}
              />
          </div>
        )}
      </div>
      
      
      <Footer />
      {children}
    </>
  );
}
