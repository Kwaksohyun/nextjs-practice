"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createCategory,
  deleteCategory,
  reorderCategories,
} from "@/lib/actions/categories";
import type { Category } from "@/lib/types";
import adminStyles from "@/styles/modules/categories-admin.module.css";
import btnStyles from "@/styles/modules/buttons.module.css";

function SortableItem({
  category,
  onDelete,
  disabled,
}: {
  category: Category;
  onDelete: (id: string) => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isProtected = category.slug === "all";

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${adminStyles.item} ${isDragging ? adminStyles.itemDragging : ""}`}
    >
      <span className={adminStyles.dragHandle} {...attributes} {...listeners}>
        ⋮⋮
      </span>
      <div className={adminStyles.name}>
        {category.name}
        <div className={adminStyles.slug}>{category.slug}</div>
      </div>
      <button
        type="button"
        className={adminStyles.deleteBtn}
        disabled={disabled || isProtected}
        onClick={() => onDelete(category.id)}
        title={isProtected ? "기본 카테고리는 삭제할 수 없습니다" : "삭제"}
      >
        삭제
      </button>
    </li>
  );
}

type Props = {
  initialCategories: Category[];
};

export default function CategoryManager({ initialCategories }: Props) {
  const [items, setItems] = useState(initialCategories);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    startTransition(async () => {
      const result = await reorderCategories(reordered.map((c) => c.id));
      if (result.error) {
        setError(result.error);
        setItems(items);
      } else {
        setMessage("순서가 저장되었습니다.");
      }
    });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setMessage("");

    startTransition(async () => {
      const result = await createCategory(name.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setName("");
        setMessage("카테고리가 추가되었습니다. 페이지를 새로고침합니다.");
        window.location.reload();
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("이 카테고리를 삭제할까요?")) return;
    setError("");
    setMessage("");

    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.error) {
        setError(result.error);
      } else {
        setItems((prev) => prev.filter((c) => c.id !== id));
        setMessage("삭제되었습니다.");
      }
    });
  }

  return (
    <>
      <h1 className={adminStyles.pageTitle}>카테고리 관리</h1>
      <p className={adminStyles.pageDesc}>
        드래그로 순서를 바꿀 수 있습니다. &quot;전체&quot;는 필터용이라 삭제할 수
        없습니다.
      </p>

      <div className={adminStyles.panel}>
        <form className={adminStyles.addRow} onSubmit={handleAdd}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="새 카테고리 이름"
            maxLength={30}
          />
          <button
            type="submit"
            className={`${btnStyles.btn} ${btnStyles.btnPrimary}`}
            disabled={pending}
          >
            추가
          </button>
        </form>
        {error && <p className={adminStyles.error}>{error}</p>}
        {message && <p className={adminStyles.message}>{message}</p>}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <ul className={adminStyles.list}>
            {items.map((cat) => (
              <SortableItem
                key={cat.id}
                category={cat}
                onDelete={handleDelete}
                disabled={pending}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}
