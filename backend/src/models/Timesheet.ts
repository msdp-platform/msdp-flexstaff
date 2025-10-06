import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript';
import { ShiftAssignment } from './ShiftAssignment';
import { Worker } from './Worker';
import { Employer } from './Employer';
import { Payment } from './Payment';

export enum TimesheetStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISPUTED = 'disputed',
}

@Table({
  tableName: 'timesheets',
  timestamps: true,
  underscored: true,
})
export class Timesheet extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => ShiftAssignment)
  @Column({
    type: DataType.UUID,
  })
  assignmentId!: string;

  @ForeignKey(() => Worker)
  @Column({
    type: DataType.UUID,
  })
  workerId!: string;

  @ForeignKey(() => Employer)
  @Column({
    type: DataType.UUID,
  })
  employerId!: string;

  @Column({
    type: DataType.DATE,
  })
  clockInTime?: Date;

  @Column({
    type: DataType.DATE,
  })
  clockOutTime?: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  breakDuration!: number; // in minutes

  @Column({
    type: DataType.DECIMAL(5, 2),
  })
  totalHours?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  hourlyRate?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  totalAmount?: number;

  @Column({
    type: DataType.ENUM(...Object.values(TimesheetStatus)),
    defaultValue: TimesheetStatus.PENDING,
  })
  status!: TimesheetStatus;

  @Column({
    type: DataType.DATE,
  })
  submittedAt?: Date;

  @Column({
    type: DataType.DATE,
  })
  approvedAt?: Date;

  @Column({
    type: DataType.TEXT,
  })
  notes?: string;

  // Associations
  @BelongsTo(() => ShiftAssignment)
  assignment!: ShiftAssignment;

  @BelongsTo(() => Worker)
  worker!: Worker;

  @BelongsTo(() => Employer)
  employer!: Employer;

  @HasOne(() => Payment)
  payment?: Payment;
}
