import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';
import { Worker } from './Worker';
import { Employer } from './Employer';

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  CANCELLED = 'cancelled',
}

@Table({
  tableName: 'worker_availability',
  timestamps: true,
})
export class WorkerAvailability extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Worker)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'worker_id',
  })
  workerId!: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    field: 'availability_date',
  })
  availabilityDate!: Date;

  @Column({
    type: DataType.TIME,
    allowNull: false,
    field: 'start_time',
  })
  startTime!: string;

  @Column({
    type: DataType.TIME,
    allowNull: false,
    field: 'end_time',
  })
  endTime!: string;

  @Column({
    type: DataType.ENUM(...Object.values(AvailabilityStatus)),
    allowNull: false,
    defaultValue: AvailabilityStatus.AVAILABLE,
  })
  status!: AvailabilityStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'hourly_rate',
  })
  hourlyRate?: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes?: string;

  @ForeignKey(() => Employer)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'booked_by_employer_id',
  })
  bookedByEmployerId?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'booked_at',
  })
  bookedAt?: Date;

  @BelongsTo(() => Worker)
  worker!: Worker;

  @BelongsTo(() => Employer, 'bookedByEmployerId')
  bookedByEmployer?: Employer;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  updatedAt!: Date;
}
