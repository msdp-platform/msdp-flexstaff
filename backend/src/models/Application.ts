import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Shift } from './Shift';
import { Worker } from './Worker';

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Table({
  tableName: 'applications',
  timestamps: true,
  underscored: true,
})
export class Application extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Shift)
  @Column({
    type: DataType.UUID,
  })
  shiftId!: string;

  @ForeignKey(() => Worker)
  @Column({
    type: DataType.UUID,
  })
  workerId!: string;

  @Column({
    type: DataType.ENUM(...Object.values(ApplicationStatus)),
    defaultValue: ApplicationStatus.PENDING,
  })
  status!: ApplicationStatus;

  @Column({
    type: DataType.TEXT,
  })
  coverMessage?: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  appliedAt!: Date;

  @Column({
    type: DataType.DATE,
  })
  respondedAt?: Date;

  // Associations
  @BelongsTo(() => Shift)
  shift!: Shift;

  @BelongsTo(() => Worker)
  worker!: Worker;
}
