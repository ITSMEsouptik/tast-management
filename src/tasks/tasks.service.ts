import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}
  async getTasks(filterDTO: GetTasksFilterDTO, user: User): Promise<Task[]> {
    const query = this.taskRepository.createQueryBuilder('task');
    const { search, status } = filterDTO;
    query.where({ user });
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        '(LOWER(task.description) LIKE LOWER(:search) OR LOWER(task.title) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }
    const tasks = await query.getMany();
    return tasks;
  }

  async getAllTasks(): Promise<Task[]> {
    const tasks = await this.taskRepository.find();
    if (!tasks.length) {
      throw new NotFoundException('No tasks found');
    }
    return tasks;
  }

  async getTasksWithFilter(filterData: GetTasksFilterDTO): Promise<Task[]> {
    const { status, search } = filterData;
    let tasks = await this.getAllTasks();
    if (status) {
      tasks = tasks.filter((task) => task.status === status);
    }
    if (search) {
      tasks = tasks.filter(
        (task) =>
          task.description.includes(search) || task.title.includes(search),
      );
    }
    if (!tasks.length) {
      throw new NotFoundException('No tasks found');
    }
    return tasks;
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({
      where: {
        id,
        user,
      },
    });
    if (!found) {
      throw new NotFoundException(`Task Id ${id} not found.`);
    }
    return found;
  }

  async createTask(createTaskDTO: CreateTaskDTO, user: User): Promise<Task> {
    const { title, description } = createTaskDTO;
    const task = await this.taskRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });
    await this.taskRepository.save(task);
    return task;
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const query = this.taskRepository.createQueryBuilder('task');
    const result = await query
      .delete()
      .from(Task)
      .where('id = :id', { id })
      .andWhere('userId = :userId', { userId: user.id })
      .execute();
    if (result.affected === 0) {
      throw new NotFoundException('Task Id not found');
    }
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    const result = await this.taskRepository.update(id, { status });
    if (result.affected) {
      task.status = status;
    } else {
      throw new NotFoundException('Task cannot be updated');
    }
    return task;
  }
}
