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

  const [fontSize, setFontSize] = useState<number>(24);
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [fontStyle, setFontStyle] = useState<string>("normal");
  const [mode, setMode] = useState<"shadow" | "outline">("shadow");
  const [globalColor, setGlobalColor] = useState<string>("#000000");
  const [shadowBlur, setShadowBlur] = useState<number>(0);
  const [shadowOffsetX, setShadowOffsetX] = useState<number>(0);
  const [shadowOffsetY, setShadowOffsetY] = useState<number>(0);
  const [outlineWidth, setOutlineWidth] = useState<number>(0);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">("left");

  const [textFields, setTextFields] = useState<{ id: string; text: string }[]>([]);

  <Select
    value={fontFamily}
    onValueChange={(value) => {
      setFontFamily(value);
      onTextStyleChange({ fontFamily: value });
    }}
  >
    <SelectTrigger className="w-full bg-[#f0f0f0]">
      <SelectValue placeholder="Select font" />
    </SelectTrigger>
    <SelectContent>
      {fontFamilies.map((font) => (
        <SelectItem
          key={font}
          value={font}
          style={{ fontFamily: font }}
          className="cursor-pointer"
        >
          {font}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  useEffect(() => {
    const newFields = allTextObjects.map(({ id, object }) => ({
      id,
      text: (object?.text as string) || "",
    }));
    setTextFields(newFields);
  }, [allTextObjects]);

  useEffect(() => {
    if (!activeTextObject) return;
    const obj = activeTextObject;

    setFontSize(obj.fontSize ?? 24);
    setFontFamily(obj.fontFamily ?? "Arial");
    setTextAlign(obj.textAlign ?? "left");

    if (obj.fontWeight === "bold" && obj.fontStyle === "italic") setFontStyle("bold-italic");
    else if (obj.fontWeight === "bold") setFontStyle("bold");
    else if (obj.fontStyle === "italic") setFontStyle("italic");
    else setFontStyle("normal");

    const shadow = obj.shadow;
    if (shadow) {
      setMode("shadow");
      setGlobalColor(shadow.color ?? "#000000");
      setShadowBlur(shadow.blur ?? 0);
      setShadowOffsetX(shadow.offsetX ?? 0);
      setShadowOffsetY(shadow.offsetY ?? 0);
    } else if (obj.strokeWidth > 0) {
      setMode("outline");
      setGlobalColor(obj.stroke ?? "#000000");
      setOutlineWidth(obj.strokeWidth ?? 0);
    } else {
      // reset to defaults when no effect
      setMode("shadow");
      setGlobalColor(obj.fill ?? "#000000");
      setShadowBlur(0);
      setShadowOffsetX(0);
      setShadowOffsetY(0);
      setOutlineWidth(0);
    }
  }, [activeTextObject]);

  // --- Apply effects to the active object ---
  const updateEffects = () => {
    if (!activeTextObject) return;

    if (mode === "shadow") {
      const shadow = new Shadow({
        color: globalColor,
        blur: shadowBlur,
        offsetX: shadowOffsetX,
        offsetY: shadowOffsetY,
        affectStroke: false,
        nonScaling: true,
      });
      onTextStyleChange({ shadow, strokeWidth: 0, stroke: null });
    } else {
      onTextStyleChange({ stroke: globalColor, strokeWidth: outlineWidth, shadow: null });
    }
  };

  // --- Handle per-input text change; if the field is active, update canvas text too ---
  const handleTextChange = (id: string, value: string) => {
    setTextFields((prev) => prev.map((t) => (t.id === id ? { ...t, text: value } : t)));
    if (activeTextObject?.id === id) {
      onTextStyleChange({ text: value });
    } else {
      // If it's not active, directly set object's text so sidebar stays in sync.
      const found = allTextObjects.find((t) => t.id === id);
      if (found) {
        found.object.set({ text: value });
        found.object.canvas?.requestRenderAll();
      }
    }
  };

  // --- When user focuses an input, select that textbox on canvas ---
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
              size={"icon-sm"}
              variant="outline"
              className="rounded-full border-2 border-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
          <Button
            onClick={onAddText}
            size={"icon-sm"}
            variant="outline"
            className="rounded-full border-2 border-black hover:bg-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* --- Textbox Inputs (initially empty until user adds via +) --- */}
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

      {/* --- Style panel: only visible when a textbox is selected --- */}
      {activeTextObject && (
        <>
          <Separator className="my-3" />

          {/* Font Family */}
          <div className="space-y-2">
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
          

          {/* Text Alignment (restored as requested) */}
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

          {/* Effect Mode */}
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
            <Label className="text-sm font-medium">
              {mode === "shadow" ? "Shadow" : "Outline"} Color
            </Label>
            <div className="flex items-center space-x-3 relative">
              <div
                className="w-8 h-8 rounded border cursor-pointer"
                style={{ background: globalColor }}
                onClick={() => shadowColorInputRef.current?.click()}
              />
              <input
                ref={shadowColorInputRef}
                type="color"
                value={globalColor}
                onChange={(e) => {
                  setGlobalColor(e.target.value);
                  updateEffects();
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Shadow Blur / Outline Width */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{mode === "shadow" ? "Shadow Blur" : "Outline Width"}</Label>
              <span className="text-sm text-gray-600">{mode === "shadow" ? shadowBlur : outlineWidth}px</span>
            </div>
            <Slider
              value={[mode === "shadow" ? shadowBlur : outlineWidth]}
              onValueChange={(value) => {
                const newValue = value[0];
                if (mode === "shadow") {
                  setShadowBlur(newValue);
                } else {
                  setOutlineWidth(newValue);
                }
                updateEffects();
              }}
              min={0}
              max={50}
            />
          </div>

          {/* Shadow Offsets (only when shadow mode) */}
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
