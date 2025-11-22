import { fabric } from "fabric";


export const printShape = (canvas: fabric.Canvas, pointer: any, selectedShape: string) => {
  switch (selectedShape) {
    case "circle":
      return addCircle(canvas, pointer);
    case "rectangle":
      return addRectangle(canvas, pointer);
    case "triangle":
      return addTriangle(canvas, pointer);
    default:
      return null;
  }
}

function addCircle(canvas: fabric.Canvas, pointer: any) {
  const circle = new fabric.Circle({
    left: pointer.x,
    top: pointer.y,
    radius: 2,
    fill: "blue",
    objectId: crypto.randomUUID(),
  });
  canvas.add(circle);
  return circle;
}

function addRectangle(canvas: fabric.Canvas, pointer: any) {
  const rectangle = new fabric.Rect({
    left: pointer.x,
    top: pointer.y,
    width: 4,
    height: 4,
    fill: "red",
    objectId: crypto.randomUUID(),
  });
  canvas.add(rectangle);
  return rectangle;
}

function addTriangle(canvas: fabric.Canvas, pointer: any) {
  const triangle = new fabric.Triangle({
    left: pointer.x,
    top: pointer.y,
    width: 4,
    height: 4,
    fill: "green",
    objectId: crypto.randomUUID(),
  });
  canvas.add(triangle);
  return triangle;
}