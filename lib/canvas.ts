import { fabric } from "fabric";


export const printShape = (canvas: fabric.Canvas, pointer: any, selectedShape: string, color?: string) => {
  switch (selectedShape) {
    case "circle":
      return addCircle(canvas, pointer, color);
    case "rectangle":
      return addRectangle(canvas, pointer, color);
    case "triangle":
      return addTriangle(canvas, pointer, color);
    case "text":
      return addText(canvas, pointer, color);
    default:
      return null;
  }
}

function addCircle(canvas: fabric.Canvas, pointer: any, color?: string) {
  const circle = new fabric.Circle({
    left: pointer.x,
    top: pointer.y,
    radius: 2,
    fill: color ?? "blue",
    objectId: crypto.randomUUID(),
  });
  canvas.add(circle);
  return circle;
}

function addRectangle(canvas: fabric.Canvas, pointer: any, color?: string) {
  const rectangle = new fabric.Rect({
    left: pointer.x,
    top: pointer.y,
    width: 4,
    height: 4,
    fill: color ?? "red",
    objectId: crypto.randomUUID(),
  });
  canvas.add(rectangle);
  return rectangle;
}

function addTriangle(canvas: fabric.Canvas, pointer: any, color?: string) {
  const triangle = new fabric.Triangle({
    left: pointer.x,
    top: pointer.y,
    width: 4,
    height: 4,
    fill: color ?? "green",
    objectId: crypto.randomUUID(),
  });
  canvas.add(triangle);
  return triangle;
}

function addText(canvas: fabric.Canvas, pointer: any, color?: string) {
  const textbox = new fabric.Textbox("Text", {
    left: pointer.x,
    top: pointer.y,
    fontSize: 20,
    fill: color ?? "#000000",
    objectId: crypto.randomUUID(),
  });
  canvas.add(textbox);
  return textbox;
}
