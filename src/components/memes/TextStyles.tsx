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

interface Props {
  activeTextObject: any;
  onTextStyleChange: (style: any) => void;
  onAddText: () => void;
  onDeleteText?: () => void;
}

const TextStyles: React.FC<Props> = ({
  activeTextObject,
  onTextStyleChange,
  onAddText,
  onDeleteText,
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const shadowColorInputRef = useRef<HTMLInputElement>(null);
  const [localText, setLocalText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontStyle, setFontStyle] = useState("normal");
  const [mode, setMode] = useState<"shadow" | "outline">("shadow");
  const [shadowBlur, setShadowBlur] = useState(0);
  const [outlineWidth, setOutlineWidth] = useState(0);
  const [globalWidth, setGlobalWidth] = useState(0);
  const [globalColor, setGlobalColor] = useState("#000000");
  const [shadowOffsetX, setShadowOffsetX] = useState(0);
  const [shadowOffsetY, setShadowOffsetY] = useState(0);
  const [textAlign, setTextAlign] = useState<
    "left" | "center" | "right" | "justify"
  >("left");

  const fontFamilies = [
    { value: "Impact", label: "Impact" },
    { value: "Arial", label: "Arial" },
    { value: "Comic Sans MS", label: "Comic Sans MS" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Times", label: "Times" },
    { value: "Courier New", label: "Courier New" },
    { value: "Courier", label: "Courier" },
    { value: "Verdana", label: "Verdana" },
    { value: "Georgia", label: "Georgia" },
    { value: "Palatino", label: "Palatino" },
    { value: "Garamond", label: "Garamond" },
    { value: "Bookman", label: "Bookman" },
    { value: "Trebuchet MS", label: "Trebuchet MS" },
    { value: "Arial Black", label: "Arial Black" },
  ];

  useEffect(() => {
    if (activeTextObject?.text !== undefined) {
      setLocalText(activeTextObject.text);
      setFontSize(activeTextObject.fontSize || 24);
      setFontFamily(activeTextObject.fontFamily || "Arial");
      setTextAlign(activeTextObject.textAlign || "left");

      const weight = activeTextObject.fontWeight;
      const style = activeTextObject.fontStyle;
      const text = activeTextObject.text || "";
      const isUppercase =
        text === text.toUpperCase() && text !== text.toLowerCase();

      if (weight === "bold" && style === "italic") setFontStyle("bold-italic");
      else if (weight === "bold") setFontStyle("bold");
      else if (style === "italic") setFontStyle("italic");
      else if (isUppercase) setFontStyle("uppercase");
      else setFontStyle("normal");

      const shadow = activeTextObject.shadow;
      if (shadow) {
        setMode("shadow");
        setShadowBlur(shadow.blur || 0);
        setGlobalWidth(shadow.blur || 0);
        setGlobalColor(shadow.color || "#000000");
        setShadowOffsetX(shadow.offsetX || 0);
        setShadowOffsetY(shadow.offsetY || 0);
      } else if (activeTextObject.strokeWidth && activeTextObject.strokeWidth > 0) {
        setMode("outline");
        setOutlineWidth(activeTextObject.strokeWidth);
        setGlobalWidth(activeTextObject.strokeWidth);
        setGlobalColor((activeTextObject.stroke as string) || "#000000");
      }
    }
  }, [activeTextObject]);

  useEffect(() => {
    if (activeTextObject) {
      setGlobalWidth(mode === "shadow" ? shadowBlur : outlineWidth);
    }
  }, [mode, shadowBlur, outlineWidth]);

  const updateEffects = () => {
    if (!activeTextObject) return;

    if (mode === "shadow") {
      const shadow = new Shadow({
        color: globalColor,
        blur: globalWidth,
        offsetX: shadowOffsetX,
        offsetY: shadowOffsetY,
        affectStroke: false,
        nonScaling: true,
      });
      onTextStyleChange({ shadow, strokeWidth: 0 });
    } else {
      onTextStyleChange({
        stroke: globalColor,
        strokeWidth: globalWidth,
        shadow: null,
      });
    }
  };

  const handleWidthChange = (value: number) => {
    setGlobalWidth(value);
    if (mode === "shadow") setShadowBlur(value);
    else setOutlineWidth(value);
  };

  return (
    <>
      <div className="flex items-center justify-between p-1">
        <h3 className="font-semibold text-gray-800 text-lg">Text Styles</h3>
        <div className="flex items-center space-x-2">
          {activeTextObject && (
            <Button
              onClick={onDeleteText}
              size={"icon-sm"}
              variant="outline"
              className="rounded-full border-2 border-red-500 hover:bg-red-50 hover:border-red-200 cursor-pointer"
              title="Delete text"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
          <Button
            onClick={onAddText}
            size={"icon-sm"}
            variant="outline"
            className="rounded-full border-2 border-black hover:bg-white hover:border-gray-400 cursor-pointer"
            title="Add new text"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Always show editor UI (no conditional rendering) */}
      <div className="p-4 space-y-4">
        {/* Text Content */}
        <div className="space-y-2">
          <Label htmlFor="text-content" className="text-sm font-medium">
            Text Content
          </Label>
          <Input
            id="text-content"
            type="text"
            value={localText}
            onChange={(e) => {
              const newText = e.target.value;
              setLocalText(newText);
              onTextStyleChange({ text: newText });
            }}
            placeholder="Edit Text"
            className="w-full bg-[#f0f0f0]"
          />
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Font Family</Label>
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
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                  className="cursor-pointer"
                >
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Style */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Font Style</Label>
          <Select
            value={fontStyle}
            onValueChange={(value) => {
              setFontStyle(value);
              switch (value) {
                case "normal":
                  onTextStyleChange({
                    fontWeight: "normal",
                    fontStyle: "normal",
                  });
                  break;
                case "bold":
                  onTextStyleChange({
                    fontWeight: "bold",
                    fontStyle: "normal",
                  });
                  break;
                case "italic":
                  onTextStyleChange({
                    fontWeight: "normal",
                    fontStyle: "italic",
                  });
                  break;
                case "bold-italic":
                  onTextStyleChange({
                    fontWeight: "bold",
                    fontStyle: "italic",
                  });
                  break;
                case "uppercase":
                  const upperText = activeTextObject?.text?.toUpperCase() || "";
                  setLocalText(upperText);
                  onTextStyleChange({ text: upperText });
                  break;
              }
            }}
          >
            <SelectTrigger className="w-full bg-[#f0f0f0]">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold" style={{ fontWeight: "bold" }}>
                Bold
              </SelectItem>
              <SelectItem value="italic" style={{ fontStyle: "italic" }}>
                Italic
              </SelectItem>
              <SelectItem
                value="bold-italic"
                style={{ fontWeight: "bold", fontStyle: "italic" }}
              >
                Bold Italic
              </SelectItem>
              <SelectItem
                value="uppercase"
                style={{ textTransform: "uppercase" }}
              >
                ALL CAPS
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Font Size</Label>
            <span className="text-sm text-gray-600">{fontSize}px</span>
          </div>
          <Slider
            value={[fontSize]}
            onValueChange={(value) => {
              const newSize = value[0];
              setFontSize(newSize);
              onTextStyleChange({ fontSize: newSize });
            }}
            min={12}
            max={120}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>12px</span>
            <span>120px</span>
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Text Color</Label>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
                style={{
                  backgroundColor: activeTextObject?.fill || "#000000",
                }}
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
            <span className="text-sm text-gray-600 font-mono">
              {activeTextObject?.fill || "#000000"}
            </span>
          </div>
        </div>

        {/* Effect Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Effect Type</Label>
          <RadioGroup
            value={mode}
            onValueChange={(value: "shadow" | "outline") => {
              setMode(value);
              updateEffects();
            }}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="shadow" id="shadow" />
              <Label htmlFor="shadow" className="text-sm cursor-pointer">
                Shadow
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="outline" id="outline" />
              <Label htmlFor="outline" className="text-sm cursor-pointer">
                Outline
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Effect Color */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {mode === "shadow" ? "Shadow" : "Outline"} Color
          </Label>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
                style={{ backgroundColor: globalColor }}
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
            <span className="text-sm text-gray-600 font-mono">{globalColor}</span>
          </div>
        </div>

        {/* Shadow Blur / Outline Width */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {mode === "shadow" ? "Shadow Blur" : "Outline Width"}
            </Label>
            <span className="text-sm text-gray-600">{globalWidth}px</span>
          </div>
          <Slider
            value={[globalWidth]}
            onValueChange={(value) => {
              const newValue = value[0];
              handleWidthChange(newValue);
              updateEffects();
            }}
            min={0}
            max={20}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>20</span>
          </div>
        </div>

        {/* Shadow Offsets */}
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
                  const newValue = value[0];
                  setShadowOffsetX(newValue);
                  updateEffects();
                }}
                min={-50}
                max={50}
                step={1}
                className="w-full"
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
                  const newValue = value[0];
                  setShadowOffsetY(newValue);
                  updateEffects();
                }}
                min={-50}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
          </>
        )}

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
      </div>
    </>
  );
};
export default TextStyles;
