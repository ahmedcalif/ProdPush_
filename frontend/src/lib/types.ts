export interface KanbanTask {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}
