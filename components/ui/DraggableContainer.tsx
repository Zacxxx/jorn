import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import useMeasure from 'react-use-measure';

interface DraggableItemProps {
  id: string;
  children: React.ReactNode;
  defaultSize?: { width: number; height: number };
  minConstraints?: [number, number];
  maxConstraints?: [number, number];
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, children, defaultSize, minConstraints, maxConstraints }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [size, setSize] = useState(defaultSize || { width: 300, height: 200 });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ResizableBox
      width={size.width}
      height={size.height}
      minConstraints={minConstraints || [200, 100]}
      maxConstraints={maxConstraints || [800, 600]}
      onResizeStop={(e, { size }) => setSize(size)}
      className="bg-slate-800/90 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700/50"
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      {children}
    </ResizableBox>
  );
};

interface DraggableContainerProps {
  children: React.ReactNode[];
  defaultSizes?: Array<{ width: number; height: number }>;
}

export const DraggableContainer: React.FC<DraggableContainerProps> = ({ children, defaultSizes }) => {
  const [items, setItems] = useState(children.map((_, index) => `item-${index}`));
  const [ref, bounds] = useMeasure();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div ref={ref} className="w-full h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-4 p-4">
            {React.Children.map(children, (child, index) => (
              <DraggableItem
                id={items[index]}
                defaultSize={defaultSizes?.[index]}
                key={items[index]}
              >
                {child}
              </DraggableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default DraggableContainer; 