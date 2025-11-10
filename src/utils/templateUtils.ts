import { Canvas, Textbox } from "fabric";

export function getTemplateBySlug(slug: string): any | null {
    // Example: fetch from your Redux store, a local JSON file, or an API
    if (slug === 'example-template-1') {
        return {
            id: '123',
            previewUrl: 'https://example.com/image-1.jpg',
            config: {
                objects: [
                    { type: 'Textbox', text: 'Top Text', left: 250, top: 50, width: 400, fontSize: 40, fill: 'white', stroke: 'black', strokeWidth: 2 },
                    { type: 'Textbox', text: 'Bottom Text', left: 250, top: 450, width: 400, fontSize: 40, fill: 'white', stroke: 'black', strokeWidth: 2 },
                ]
            }
        };
    }
    // Return null if not found
    return null; 
}


export function loadCanvasObjects(canvas: Canvas, objectsConfig: any[]) {
    if (!canvas || !objectsConfig || !Array.isArray(objectsConfig)) return;

    // 1. Clear existing objects (objects, not background image)
    canvas.getObjects().forEach((obj) => {
        if (obj !== canvas.backgroundImage) canvas.remove(obj);
    });

    // 2. Add new objects
    objectsConfig.forEach((objectConfig: any) => {
        try {
            if (objectConfig.type === "Textbox" || objectConfig.type === "text") {
                const textObj = new Textbox(objectConfig.text, {
                    left: objectConfig.left || 100,
                    top: objectConfig.top || 100,
                    width: objectConfig.width || 200,
                    height: objectConfig.height || 50,
                    fontSize: objectConfig.fontSize || 28,
                    fill: objectConfig.fill || "#000",
                    fontFamily: objectConfig.fontFamily || "Arial",
                    fontWeight: objectConfig.fontWeight || "normal",
                    textAlign: objectConfig.textAlign || "center", // Changed to center for typical meme text
                    originX: objectConfig.originX || "center",
                    originY: objectConfig.originY || "center",
                    angle: objectConfig.angle || 0,
                    scaleX: objectConfig.scaleX || 1,
                    scaleY: objectConfig.scaleY || 1,
                    // Copy control settings from your existing addTextBox for consistency
                    borderColor: "orange",
                    cornerStyle: "circle",
                    transparentCorners: false,
                    hasControls: true,
                    editable: true,
                });
                canvas.add(textObj);
            }
            // Add logic for other object types (e.g., rect, image) if necessary
        } catch (error) {
            console.error("Error creating object from template:", error, objectConfig);
        }
    });
    
    // 3. Final render
    canvas.renderAll();
}