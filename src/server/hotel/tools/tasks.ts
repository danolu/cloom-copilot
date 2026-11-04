import type { HotelContext } from '../context';
import type { HotelTools } from '../tools';
import type { Task, TaskPriority } from '../../../shared/types/hotel';

export function createTaskTools(
  ctx: HotelContext,
): Pick<HotelTools, 'list_tasks' | 'list_approvals' | 'create_task' | 'complete_task' | 'decide_approval'> {
  const { state, log, pushUndo } = ctx;
  return {
    list_tasks: async () => ({ tasks: state.tasks.filter((t) => !t.done) }),
    list_approvals: async () => ({ approvals: state.approvals.filter((a) => a.status === 'pending') }),
    create_task: async ({
      title,
      assignee,
      priority,
    }: {
      title: string;
      assignee?: string;
      priority?: TaskPriority;
    }) => {
      const task: Task = {
        id: `T-${state.tasks.length + 1}`,
        title,
        assignee: assignee || 'Housekeeping',
        priority: priority || 'MEDIUM',
        done: false,
      };
      state.tasks.push(task);
      pushUndo({
        label: `task "${title}"`,
        undo: () => {
          task.done = true;
        },
      });
      log('admin', 'create_task', title);
      return { ok: true, task };
    },
    complete_task: async ({ id }: { id: string }) => {
      const t = state.tasks.find((x) => x.id === id);
      if (!t) throw new Error(`Task ${id} not found`);
      t.done = true;
      log('admin', 'complete_task', id);
      return { ok: true, task: t };
    },
    decide_approval: async ({ id, decision }: { id: string; decision: string }) => {
      const a = state.approvals.find((x) => x.id === id);
      if (!a) throw new Error(`Approval ${id} not found`);
      a.status = decision;
      log('admin', 'decide_approval', `${id}: ${decision}`);
      return { ok: true, approval: a };
    },
  };
}
