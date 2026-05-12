import { InvalidTaskNameError } from '../errors/task/InvalidTaskNameError';
import { TaskNotFoundError } from '../errors/task/TaskNotFoundError';
import { prisma } from '../utils/prisma';
import { calcularEstatisticas, diasParaVencimento, estaAtrasada, formatarPrioridade } from '../utils/task.utils';


export class TaskService {
    static async createTask(
        userId: number,
        data: {
            title: string;
            description?: string;
            dueDate?: string | null;
            priority?: string;
        },
    ) {
        if (/^\d/.test(data.title)) {
            throw new InvalidTaskNameError();
        }

        const task = await prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                priority: data.priority,
                userId,
            },
        });

        return task;
    }

    static async getTasks(userId: number, filters: { completed?: string; priority?: string }) {
        const { completed, priority } = filters;

        const tasks = await prisma.task.findMany({
            where: {
                userId,
                ...(completed !== undefined && { completed: completed === 'true' }),
                ...(priority && { priority }),
            },
            orderBy: { createdAt: 'desc' },
        });

        return tasks;
    }

    static async getTaskById(userId: number, id: number) {
        const task = await prisma.task.findUnique({
            where: { id, userId },
        });

        if (!task) {
            throw new TaskNotFoundError();
        }

        return task;
    }

    static async updateTask(
        userId: number,
        id: number,
        data: {
            title?: string;
            description?: string;
            completed?: boolean;
            dueDate?: string | null;
            priority?: string;
        },
    ) {
        if (data.title !== undefined && /^\d/.test(data.title)) {
            throw new InvalidTaskNameError();
        }

        await TaskService.getTaskById(userId, id);

        const updatedTask = await prisma.task.update({
            where: { id, userId },
            data: {
                title: data.title,
                description: data.description,
                completed: data.completed,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                priority: data.priority,
            },
        });

        return updatedTask;
    }

    static async deleteTask(userId: number, id: number) {
        await TaskService.getTaskById(userId, id);

        await prisma.task.delete({
            where: { id, userId },
        });
    }

    static async getStats(userId: number) {
        const tasks = await prisma.task.findMany({ where: { userId } });
        const agora = new Date();

        let atrasadas = 0;
        let vencendoEm7Dias = 0;

        for (const task of tasks) {
            if (estaAtrasada({ dueDate: task.dueDate, completed: task.completed }, agora)) {
                atrasadas++;
            }
            const dias = diasParaVencimento(task.dueDate, agora);
            if (dias !== null && dias >= 0 && dias <= 7) {
                vencendoEm7Dias++;
            }
        }

        const { total, concluidas, pendentes, porPrioridade } = calcularEstatisticas(tasks);

        const porPrioridadeFormatada: Record<string, number> = {};
        for (const [chave, quantidade] of Object.entries(porPrioridade)) {
            const label = chave === 'sem_prioridade' ? 'Sem prioridade' : formatarPrioridade(chave);
            porPrioridadeFormatada[label] = quantidade;
        }

        return { total, concluidas, pendentes, atrasadas, porPrioridade: porPrioridadeFormatada, vencendoEm7Dias };
    }
}
