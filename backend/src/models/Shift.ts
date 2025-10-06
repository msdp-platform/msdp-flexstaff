import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Employer, IndustryType } from './Employer';
import { Application } from './Application';
import { ShiftAssignment } from './ShiftAssignment';

export enum ShiftStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum JobDurationType {
  QUICK = 'quick',
  DAY = 'day',
  MULTI_DAY = 'multi_day',
}

@Table({
  tableName: 'shifts',
  timestamps: true,
  underscored: true,
})
export class Shift extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Employer)
  @Column({
    type: DataType.UUID,
  })
  employerId!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
  })
  description?: string;

  @Column({
    type: DataType.ENUM(...Object.values(IndustryType)),
    allowNull: false,
  })
  industry!: IndustryType;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  roleType!: string;

  @Column({
    type: DataType.STRING(255),
  })
  locationName?: string;

  @Column({
    type: DataType.STRING(255),
  })
  addressLine1?: string;

  @Column({
    type: DataType.STRING(255),
  })
  addressLine2?: string;

  @Column({
    type: DataType.STRING(100),
  })
  city?: string;

  @Column({
    type: DataType.STRING(20),
  })
  postcode?: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  shiftDate!: Date;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  startTime!: string;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  endTime!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  hourlyRate!: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
  })
  totalHours?: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
  })
  totalPositions!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  filledPositions!: number;

  @Column({
    type: DataType.TEXT,
  })
  requirements?: string;

  @Column({
    type: DataType.ENUM(...Object.values(ShiftStatus)),
    defaultValue: ShiftStatus.DRAFT,
  })
  status!: ShiftStatus;

  @Column({
    type: DataType.ENUM(...Object.values(JobDurationType)),
    defaultValue: JobDurationType.DAY,
    field: 'duration_type',
  })
  durationType!: JobDurationType;

  // Associations
  @BelongsTo(() => Employer)
  employer!: Employer;

  @HasMany(() => Application)
  applications?: Application[];

  @HasMany(() => ShiftAssignment)
  assignments?: ShiftAssignment[];

  // Virtual fields
  get isFullyBooked(): boolean {
    return this.filledPositions >= this.totalPositions;
  }

  get availablePositions(): number {
    return this.totalPositions - this.filledPositions;
  }
}
