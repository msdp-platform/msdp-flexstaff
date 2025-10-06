import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript';
import { Shift } from './Shift';
import { Worker } from './Worker';
import { Application } from './Application';
import { Timesheet } from './Timesheet';

@Table({
  tableName: 'shift_assignments',
  timestamps: true,
  underscored: true,
})
export class ShiftAssignment extends Model {
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

  @ForeignKey(() => Application)
  @Column({
    type: DataType.UUID,
  })
  applicationId?: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  assignedAt!: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  confirmedByWorker!: boolean;

  @Column({
    type: DataType.DATE,
  })
  confirmedAt?: Date;

  // Associations
  @BelongsTo(() => Shift)
  shift!: Shift;

  @BelongsTo(() => Worker)
  worker!: Worker;

  @BelongsTo(() => Application)
  application?: Application;

  @HasOne(() => Timesheet)
  timesheet?: Timesheet;
}
