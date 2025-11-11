import React, { useState, useRef, useEffect } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shadow } from "fabric";
import { fontFamilies } from "@/utils/fontFamily";

interface Props {
  activeTextObject: any | null;
  allTextObjects: { id: string; object: any }[];
  onTextStyleChange: (style: any) => void;
  onAddText: () => void;
  onDeleteText?: () => void;
}

const TextStyles: React.FC<Props> = ({
  activeTextObject,
  allTextObjects,
  onTextStyleChange,
  onAddText,
  onDeleteText,
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const shadowColorInputRef = useRef<HTMLInputElement>(null);
  const outlineColorInputRef = useRef<HTMLInputElement>(null);

  const [fontSize, setFontSize] = useState(50);
  const [fontFamily, setFontFamily] = useState("Impact");
  const [fontStyle, setFontStyle] = useState("bold");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">("center");

  const [mode, setMode] = useState<"shadow" | "outline">("shadow");

  // Separate states for shadow and outline
  const [shadowColor, setShadowColor] = useState("#FFD700"); // yellow default
  const [shadowBlur, setShadowBlur] = useState(2);
  const [shadowOffsetX, setShadowOffsetX] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(2);

  const [outlineColor, setOutlineColor] = useState("#FF0000"); // red default
  const [outlineWidth, setOutlineWidth] = useState(1);

  const [textFields, setTextFields] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    const newFields = allTextObjects.map(({ id, object }) => ({
      id,
      text: object?.text || "",
    }));
    setTextFields(newFields);
  }, [allTextObjects]);

  useEffect(() => {
    if (!activeTextObject) return;
    const obj = activeTextObject;

    setFontSize(obj.fontSize ?? 50);
    setFontFamily(obj.fontFamily ?? "Impact");
    setTextAlign(obj.textAlign ?? "center");

    if (obj.fontWeight === "bold" && obj.fontStyle === "italic") setFontStyle("bold-italic");
    else if (obj.fontWeight === "bold") setFontStyle("bold");
    else if (obj.fontStyle === "italic") setFontStyle("italic");
    else setFontStyle("normal");

    // Load shadow values if exist
    if (obj.shadow) {
      setShadowColor(obj.shadow.color ?? "#FFD700");
      setShadowBlur(obj.shadow.blur ?? 2);
      setShadowOffsetX(obj.shadow.offsetX ?? 2);
      setShadowOffsetY(obj.shadow.offsetY ?? 2);
    }

    // Load outline values if exist
    if (obj.strokeWidth && obj.strokeWidth > 0) {
      setOutlineColor(obj.stroke ?? "#FF0000");
      setOutlineWidth(obj.strokeWidth);
    }

    setMode(obj.shadow ? "shadow" : obj.strokeWidth ? "outline" : "shadow");
  }, [activeTextObject]);

  // --- Apply effects to the active object ---
  const updateEffects = () => {
    if (!activeTextObject) return;

    if (mode === "shadow") {
      const shadow = new Shadow({
        color: shadowColor,
        blur: shadowBlur,
        offsetX: shadowOffsetX,
        offsetY: shadowOffsetY,
        affectStroke: true,
        nonScaling: true,
      });
      onTextStyleChange({ shadow, strokeWidth: 0 });
    } else {
      onTextStyleChange({ stroke: outlineColor, strokeWidth: outlineWidth, shadow: null });
    }
  };

  const handleTextChange = (id: string, value: string) => {
    setTextFields((prev) => prev.map((t) => (t.id === id ? { ...t, text: value } : t)));
    if (activeTextObject?.id === id) {
      onTextStyleChange({ text: value });
    } else {
      const found = allTextObjects.find((t) => t.id === id);
      if (found) {
        found.object.set({ text: value });
        found.object.canvas?.requestRenderAll();
      }
    }
  };

  const handleFocusSelect = (id: string) => {
    const target = allTextObjects.find((t) => t.id === id);
    if (target && target.object && target.object.canvas) {
      target.object.canvas.setActiveObject(target.object);
      target.object.canvas.requestRenderAll();
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-lg">Text Styles</h3>
        <div className="flex items-center space-x-2">
          {activeTextObject && (
            <Button
              onClick={onDeleteText}
              size="icon-sm"
              variant="outline"
              className="rounded-full border-2 border-red-500 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
          <Button
            onClick={onAddText}
            size="icon-sm"
            variant="outline"
            className="rounded-full border-2 border-black hover:bg-white cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        {textFields.length === 0 && (
          <div className="text-sm text-gray-500">No text fields yet — press + to add.</div>
        )}

        {textFields.map((field, index) => (
          <div key={field.id} className="space-y-1">
            <Label
              className={`text-sm font-medium ${
                activeTextObject?.id === field.id ? "text-blue-600" : "text-gray-700"
              }`}
            >
              Text {index + 1}
            </Label>

            <Input
              value={field.text}
              onChange={(e) => handleTextChange(field.id, e.target.value)}
              onFocus={() => handleFocusSelect(field.id)}
              placeholder="Enter text"
              className={`w-full ${
                activeTextObject?.id === field.id ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"
              }`}
            />
          </div>
        ))}
      </div>

      {activeTextObject && (
        <>
          <Separator className="my-3" />

          {/* Font Family & Style */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-sm font-medium">Font Family</Label>
              <Select
                value={fontFamily}
                onValueChange={(v) => {
                  setFontFamily(v);
                  onTextStyleChange({ fontFamily: v });
                }}
              >
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-1">
              <Label className="text-sm font-medium">Style</Label>
              <Select
                value={fontStyle}
                onValueChange={(v) => {
                  setFontStyle(v);
                  if (!activeTextObject) return;

                  let updates: any = {};

                  switch (v) {
                    case "normal":
                      updates.fontWeight = "normal";
                      updates.fontStyle = "normal";
                      updates.text = activeTextObject.text;
                      break;
                    case "bold":
                      updates.fontWeight = "bold";
                      updates.fontStyle = "normal";
                      updates.text = activeTextObject.text;
                      break;
                    case "italic":
                      updates.fontWeight = "normal";
                      updates.fontStyle = "italic";
                      updates.text = activeTextObject.text;
                      break;
                    case "bold-italic":
                      updates.fontWeight = "bold";
                      updates.fontStyle = "italic";
                      updates.text = activeTextObject.text;
                      break;
                    case "all-caps":
                      updates.fontWeight = "normal";
                      updates.fontStyle = "normal";
                      updates.text = activeTextObject.text?.toUpperCase();
                      break;
                  }

                  onTextStyleChange(updates);
                }}
              >
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="italic">Italic</SelectItem>
                  <SelectItem value="bold-italic">Bold Italic</SelectItem>
                  <SelectItem value="all-caps">All Caps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">Font Size</Label>
              <span className="text-sm text-gray-500">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={(v) => {
                setFontSize(v[0]);
                onTextStyleChange({ fontSize: v[0] });
              }}
              min={12}
              max={120}
            />
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Text Color</Label>
            <div className="flex items-center space-x-2 relative">
              <div
                className="w-8 h-8 border rounded cursor-pointer"
                style={{ background: activeTextObject?.fill || "#000" }}
                onClick={() => colorInputRef.current?.click()}
              />
              <input
                ref={colorInputRef}
                type="color"
                value={activeTextObject?.fill || "#000000"}
                onChange={(e) => onTextStyleChange({ fill: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Text Alignment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Text Alignment</Label>
            <Tabs
              value={textAlign}
              onValueChange={(value) => {
                const alignValue = value as "left" | "center" | "right" | "justify";
                setTextAlign(alignValue);
                onTextStyleChange({ textAlign: alignValue });
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="left" className="p-2">
                  <AlignLeft className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="center" className="p-2">
                  <AlignCenter className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="right" className="p-2">
                  <AlignRight className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="justify" className="p-2">
                  <AlignJustify className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Effect Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Effect Type</Label>
            <RadioGroup
              value={mode}
              onValueChange={(v: "shadow" | "outline") => {
                setMode(v);
                updateEffects();
              }}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shadow" id="shadow" />
                <Label htmlFor="shadow">Shadow</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="outline" id="outline" />
                <Label htmlFor="outline">Outline</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Effect Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{mode === "shadow" ? "Shadow" : "Outline"} Color</Label>
            <div className="flex items-center space-x-3 relative">
              <div
                className="w-8 h-8 rounded border cursor-pointer"
                style={{ background: mode === "shadow" ? shadowColor : outlineColor }}
                onClick={() => (mode === "shadow" ? shadowColorInputRef.current?.click() : outlineColorInputRef.current?.click())}
              />
              <input
                ref={mode === "shadow" ? shadowColorInputRef : outlineColorInputRef}
                type="color"
                value={mode === "shadow" ? shadowColor : outlineColor}
                onChange={(e) => {
                  if (mode === "shadow") setShadowColor(e.target.value);
                  else setOutlineColor(e.target.value);
                  updateEffects();
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Shadow / Outline sliders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{mode === "shadow" ? "Shadow Blur" : "Outline Width"}</Label>
              <span className="text-sm text-gray-600">{mode === "shadow" ? shadowBlur : outlineWidth}px</span>
            </div>
            <Slider
              value={[mode === "shadow" ? shadowBlur : outlineWidth]}
              onValueChange={(value) => {
                if (mode === "shadow") setShadowBlur(value[0]);
                else setOutlineWidth(value[0]);
                updateEffects();
              }}
              min={0}
              max={50}
            />
          </div>

          {mode === "shadow" && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Shadow Offset X</Label>
                  <span className="text-sm text-gray-600">{shadowOffsetX}px</span>
                </div>
                <Slider
                  value={[shadowOffsetX]}
                  onValueChange={(value) => {
                    setShadowOffsetX(value[0]);
                    updateEffects();
                  }}
                  min={-50}
                  max={50}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Shadow Offset Y</Label>
                  <span className="text-sm text-gray-600">{shadowOffsetY}px</span>
                </div>
                <Slider
                  value={[shadowOffsetY]}
                  onValueChange={(value) => {
                    setShadowOffsetY(value[0]);
                    updateEffects();
                  }}
                  min={-50}
                  max={50}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TextStyles;
