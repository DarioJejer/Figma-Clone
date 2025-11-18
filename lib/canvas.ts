import { fabric } from "fabric";


export const printShape = (canvas: fabric.Canvas, pointer: any, selectedShape: string) => {
  switch (selectedShape) {
    case "circle":
      addCircle(canvas, pointer, selectedShape);
      break;
    case "rectangle":
      addRectangle(canvas, pointer, selectedShape);
      break;
    case "triangle":
      addTriangle(canvas, pointer, selectedShape);
      break;
    default:
      break;
  }
}

function addCircle(canvas: fabric.Canvas, pointer: any, selectedShape: string) {
  const circle = new fabric.Circle({
    left: pointer.x,
    top: pointer.y,
    radius: 20,
    fill: "blue",
  });
  canvas.add(circle);
}

function addRectangle(canvas: fabric.Canvas, pointer: any, selectedShape: string) {
  const rectangle = new fabric.Rect({
    left: pointer.x,
    top: pointer.y,
    width: 40,
    height: 30,
    fill: "red",
  });
  canvas.add(rectangle);
}

function addTriangle(canvas: fabric.Canvas, pointer: any, selectedShape: string) {
  const triangle = new fabric.Triangle({
    left: pointer.x,
    top: pointer.y,
    width: 40,
    height: 40,
    fill: "green",
  });
  canvas.add(triangle);
}